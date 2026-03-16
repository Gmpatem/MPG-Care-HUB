"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function makeReceiptNumber() {
  const now = new Date();
  const stamp = [
    now.getUTCFullYear(),
    String(now.getUTCMonth() + 1).padStart(2, "0"),
    String(now.getUTCDate()).padStart(2, "0"),
    String(now.getUTCHours()).padStart(2, "0"),
    String(now.getUTCMinutes()).padStart(2, "0"),
    String(now.getUTCSeconds()).padStart(2, "0"),
  ].join("");

  return `RCT-${stamp}`;
}

export async function createPayment(formData: FormData) {
  const hospitalSlug = String(formData.get("hospital_slug") ?? "").trim();
  const invoiceId = String(formData.get("invoice_id") ?? "").trim();
  const amount = Number(formData.get("amount") ?? 0);
  const method = String(formData.get("method") ?? "").trim();
  const referenceNumber = String(formData.get("reference_number") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const payerName = String(formData.get("payer_name") ?? "").trim() || null;
  const receiptNumber = String(formData.get("receipt_number") ?? "").trim() || makeReceiptNumber();

  if (!hospitalSlug) throw new Error("Hospital slug is required.");
  if (!invoiceId) throw new Error("Invoice is required.");
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Payment amount must be greater than zero.");
  if (!method) throw new Error("Payment method is required.");

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) throw new Error("You must be signed in.");

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug")
    .eq("slug", hospitalSlug)
    .maybeSingle<{ id: string; slug: string }>();

  if (hospitalError) throw new Error(hospitalError.message);
  if (!hospital) throw new Error("Hospital not found.");

  const { data: membership, error: membershipError } = await supabase
    .from("hospital_users")
    .select("id, status")
    .eq("hospital_id", hospital.id)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle<{ id: string; status: string }>();

  if (membershipError) throw new Error(membershipError.message);
  if (!membership) throw new Error("You do not have access to this hospital.");

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select("id, hospital_id, status, total_amount, amount_paid, balance_due")
    .eq("hospital_id", hospital.id)
    .eq("id", invoiceId)
    .maybeSingle<{
      id: string;
      hospital_id: string;
      status: string;
      total_amount: number;
      amount_paid: number;
      balance_due: number;
    }>();

  if (invoiceError) throw new Error(invoiceError.message);
  if (!invoice) throw new Error("Invoice not found.");

  const { data: staffRecord } = await supabase
    .from("staff")
    .select("id")
    .eq("hospital_id", hospital.id)
    .eq("hospital_user_id", membership.id)
    .maybeSingle<{ id: string }>();

  const paymentInsert: Record<string, any> = {
    hospital_id: hospital.id,
    invoice_id: invoice.id,
    payment_date: new Date().toISOString(),
    amount,
    method,
    reference_number: referenceNumber,
    notes,
    recorded_by: user.id,
    receipt_number: receiptNumber,
    created_by_user_id: user.id,
    status: "posted",
    payer_name: payerName,
  };

  const { data: paymentsColumns } = await supabase
    .from("payments")
    .select("id")
    .limit(1);

  void paymentsColumns;

  paymentInsert.received_by_staff_id = staffRecord?.id ?? null;

  let paymentId: string | null = null;
  let paymentInsertError: string | null = null;

  const insertAttempt = await supabase
    .from("payments")
    .insert(paymentInsert)
    .select("id")
    .maybeSingle<{ id: string }>();

  if (insertAttempt.error && String(insertAttempt.error.message).includes("received_by_staff_id")) {
    delete paymentInsert.received_by_staff_id;

    const retry = await supabase
      .from("payments")
      .insert(paymentInsert)
      .select("id")
      .maybeSingle<{ id: string }>();

    if (retry.error) {
      paymentInsertError = retry.error.message;
    } else {
      paymentId = retry.data?.id ?? null;
    }
  } else if (insertAttempt.error) {
    paymentInsertError = insertAttempt.error.message;
  } else {
    paymentId = insertAttempt.data?.id ?? null;
  }

  if (paymentInsertError) throw new Error(paymentInsertError);
  if (!paymentId) throw new Error("Payment could not be created.");

  const { data: invoiceItems, error: itemsError } = await supabase
    .from("invoice_items")
    .select(`
      id,
      line_total,
      payment_allocations (
        id,
        amount
      )
    `)
    .eq("hospital_id", hospital.id)
    .eq("invoice_id", invoice.id)
    .order("created_at", { ascending: true });

  if (itemsError) throw new Error(itemsError.message);

  let remaining = amount;

  for (const item of invoiceItems ?? []) {
    if (remaining <= 0) break;

    const allocated = (item.payment_allocations ?? []).reduce(
      (sum: number, row: any) => sum + Number(row.amount ?? 0),
      0
    );

    const lineTotal = Number(item.line_total ?? 0);
    const unpaid = Math.max(0, lineTotal - allocated);
    if (unpaid <= 0) continue;

    const allocationAmount = Math.min(unpaid, remaining);

    const { error: allocationError } = await supabase
      .from("payment_allocations")
      .insert({
        hospital_id: hospital.id,
        payment_id: paymentId,
        invoice_item_id: item.id,
        amount: allocationAmount,
      });

    if (allocationError) throw new Error(allocationError.message);

    remaining -= allocationAmount;
  }

  const nextAmountPaid = Number(invoice.amount_paid ?? 0) + amount;
  const nextBalance = Math.max(0, Number(invoice.total_amount ?? 0) - nextAmountPaid);

  let nextStatus: "issued" | "partially_paid" | "paid" = "issued";
  if (nextAmountPaid <= 0) {
    nextStatus = "issued";
  } else if (nextBalance <= 0) {
    nextStatus = "paid";
  } else {
    nextStatus = "partially_paid";
  }

  const { error: invoiceUpdateError } = await supabase
    .from("invoices")
    .update({
      amount_paid: nextAmountPaid,
      balance_due: nextBalance,
      status: nextStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("hospital_id", hospital.id)
    .eq("id", invoice.id);

  if (invoiceUpdateError) throw new Error(invoiceUpdateError.message);

  await supabase
    .from("billing_events")
    .insert({
      hospital_id: hospital.id,
      entity_type: "payment",
      entity_id: paymentId,
      event_type: "payment_posted",
      payload: {
        invoice_id: invoice.id,
        amount,
        method,
        receipt_number: receiptNumber,
      },
    });

  revalidatePath(`/h/${hospital.slug}/billing`);
  revalidatePath(`/h/${hospital.slug}/billing/invoices`);
  revalidatePath(`/h/${hospital.slug}/billing/invoices/${invoice.id}`);
  revalidatePath(`/h/${hospital.slug}/billing/payments`);
}
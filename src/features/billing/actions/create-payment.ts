"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createPaymentSchema } from "@/features/billing/schemas/payment.schema";

export async function createPayment(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const values = {
    hospital_id: String(formData.get("hospital_id") ?? ""),
    invoice_id: String(formData.get("invoice_id") ?? ""),
    amount: Number(formData.get("amount") ?? 0),
    method: String(formData.get("method") ?? "cash"),
    payment_date: String(formData.get("payment_date") ?? ""),
    reference_number: String(formData.get("reference_number") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };

  const parsed = createPaymentSchema.safeParse(values);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid payment data");
  }

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select("id, hospital_id, total_amount, amount_paid, balance_due")
    .eq("id", parsed.data.invoice_id)
    .eq("hospital_id", parsed.data.hospital_id)
    .maybeSingle();

  if (invoiceError) {
    throw new Error(invoiceError.message);
  }

  if (!invoice) {
    throw new Error("Invoice not found");
  }

  const currentBalance = Number(invoice.balance_due ?? 0);
  const amount = Number(parsed.data.amount);

  if (amount > currentBalance) {
    throw new Error("Payment amount cannot exceed the invoice balance due");
  }

  const { error: paymentError } = await supabase
    .from("payments")
    .insert({
      hospital_id: parsed.data.hospital_id,
      invoice_id: parsed.data.invoice_id,
      payment_date: new Date(parsed.data.payment_date).toISOString(),
      amount,
      method: parsed.data.method,
      reference_number: parsed.data.reference_number || null,
      notes: parsed.data.notes || null,
      recorded_by: user.id,
    });

  if (paymentError) {
    throw new Error(paymentError.message);
  }

  const { data: paymentRows, error: sumError } = await supabase
    .from("payments")
    .select("amount")
    .eq("hospital_id", parsed.data.hospital_id)
    .eq("invoice_id", parsed.data.invoice_id);

  if (sumError) {
    throw new Error(sumError.message);
  }

  const amountPaid = (paymentRows ?? []).reduce(
    (sum, row) => sum + Number(row.amount ?? 0),
    0
  );

  const totalAmount = Number(invoice.total_amount ?? 0);
  const balanceDue = Math.max(0, totalAmount - amountPaid);

  let nextStatus: "issued" | "partially_paid" | "paid" = "issued";

  if (amountPaid <= 0) {
    nextStatus = "issued";
  } else if (balanceDue <= 0) {
    nextStatus = "paid";
  } else {
    nextStatus = "partially_paid";
  }

  const { error: updateInvoiceError } = await supabase
    .from("invoices")
    .update({
      amount_paid: amountPaid,
      balance_due: balanceDue,
      status: nextStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", parsed.data.invoice_id)
    .eq("hospital_id", parsed.data.hospital_id);

  if (updateInvoiceError) {
    throw new Error(updateInvoiceError.message);
  }

  const { data: hospital } = await supabase
    .from("hospitals")
    .select("slug")
    .eq("id", parsed.data.hospital_id)
    .maybeSingle();

  revalidatePath(`/h/${hospital?.slug}/billing`);
  revalidatePath(`/h/${hospital?.slug}/billing/payments`);
  revalidatePath(`/h/${hospital?.slug}/billing/invoices`);
  revalidatePath(`/h/${hospital?.slug}/billing/invoices/${parsed.data.invoice_id}`);

  redirect(`/h/${hospital?.slug}/billing/invoices/${parsed.data.invoice_id}`);
}

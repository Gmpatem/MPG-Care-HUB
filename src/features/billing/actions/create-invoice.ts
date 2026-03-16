"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createInvoiceSchema } from "@/features/billing/schemas/invoice.schema";

type ParsedInvoiceItem = {
  description: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  item_type: "other";
};

function formatInvoiceNumber(sequence: number): string {
  return `INV-${String(sequence).padStart(6, "0")}`;
}

function extractInvoiceSequence(invoiceNumber: string | null): number {
  if (!invoiceNumber) return 0;
  const match = invoiceNumber.match(/INV-(\d+)$/i);
  if (!match) return 0;
  return Number(match[1] ?? 0);
}

export async function createInvoice(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const values = {
    hospital_id: String(formData.get("hospital_id") ?? ""),
    patient_id: String(formData.get("patient_id") ?? ""),
    appointment_id: String(formData.get("appointment_id") ?? ""),
    encounter_id: String(formData.get("encounter_id") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };

  const parsed = createInvoiceSchema.safeParse(values);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid invoice data");
  }

  const descriptions = formData.getAll("item_description").map(String);
  const quantities = formData.getAll("item_quantity").map((value) => Number(value));
  const unitPrices = formData.getAll("item_unit_price").map((value) => Number(value));

  const items: ParsedInvoiceItem[] = descriptions
    .map((description, index) => {
      const quantity = quantities[index] || 0;
      const unit_price = unitPrices[index] || 0;

      return {
        description: description.trim(),
        quantity,
        unit_price,
        line_total: quantity * unit_price,
        item_type: "other" as const,
      };
    })
    .filter(
      (item) =>
        item.description.length > 0 &&
        item.quantity > 0 &&
        item.unit_price >= 0
    );

  if (items.length === 0) {
    throw new Error("At least one invoice item is required.");
  }

  const subtotal = items.reduce((sum, item) => sum + item.line_total, 0);
  const total = subtotal;

  const { data: hospital } = await supabase
    .from("hospitals")
    .select("id, slug")
    .eq("id", parsed.data.hospital_id)
    .maybeSingle();

  if (!hospital) {
    throw new Error("Hospital not found");
  }

  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("id", parsed.data.patient_id)
    .eq("hospital_id", parsed.data.hospital_id)
    .maybeSingle();

  if (!patient) {
    throw new Error("Patient not found in this hospital");
  }

  if (parsed.data.appointment_id) {
    const { data: appointment } = await supabase
      .from("appointments")
      .select("id")
      .eq("id", parsed.data.appointment_id)
      .eq("hospital_id", parsed.data.hospital_id)
      .eq("patient_id", parsed.data.patient_id)
      .maybeSingle();

    if (!appointment) {
      throw new Error("Appointment not found for this patient");
    }
  }

  if (parsed.data.encounter_id) {
    const { data: encounter } = await supabase
      .from("encounters")
      .select("id")
      .eq("id", parsed.data.encounter_id)
      .eq("hospital_id", parsed.data.hospital_id)
      .eq("patient_id", parsed.data.patient_id)
      .maybeSingle();

    if (!encounter) {
      throw new Error("Encounter not found for this patient");
    }
  }

  const { data: latestInvoice, error: latestInvoiceError } = await supabase
    .from("invoices")
    .select("invoice_number")
    .eq("hospital_id", parsed.data.hospital_id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (latestInvoiceError) {
    throw new Error(latestInvoiceError.message);
  }

  const nextSequence =
    extractInvoiceSequence(latestInvoice?.invoice_number ?? null) + 1;
  const invoiceNumber = formatInvoiceNumber(nextSequence);

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .insert({
      hospital_id: parsed.data.hospital_id,
      patient_id: parsed.data.patient_id,
      appointment_id: parsed.data.appointment_id || null,
      encounter_id: parsed.data.encounter_id || null,
      invoice_number: invoiceNumber,
      status: "issued",
      subtotal_amount: subtotal,
      discount_amount: 0,
      tax_amount: 0,
      total_amount: total,
      amount_paid: 0,
      balance_due: total,
      issued_at: new Date().toISOString(),
      notes: parsed.data.notes || null,
      created_by_user_id: user.id,
    })
    .select("id")
    .single();

  if (invoiceError) {
    throw new Error(invoiceError.message);
  }

  const invoiceItemsPayload = items.map((item) => ({
    hospital_id: hospital.id,
    invoice_id: invoice.id,
    item_type: item.item_type,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price,
    line_total: item.line_total,
  }));

  const { error: itemsError } = await supabase
    .from("invoice_items")
    .insert(invoiceItemsPayload);

  if (itemsError) {
    throw new Error(itemsError.message);
  }

  revalidatePath(`/h/${hospital.slug}/billing`);
  revalidatePath(`/h/${hospital.slug}/billing/invoices`);

  redirect(`/h/${hospital.slug}/billing/invoices/${invoice.id}`);
}


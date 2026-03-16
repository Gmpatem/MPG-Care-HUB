import { createClient } from "@/lib/supabase/server";

export type AutomatedInvoiceItemType =
  | "consultation"
  | "lab"
  | "pharmacy"
  | "ward"
  | "radiology"
  | "procedure"
  | "supply"
  | "adjustment"
  | "other";

export type AddAutomatedChargeInput = {
  hospitalId: string;
  patientId: string;
  appointmentId?: string | null;
  encounterId?: string | null;
  createdByUserId?: string | null;
  itemType: AutomatedInvoiceItemType;
  description: string;
  quantity: number;
  unitPrice: number;
  sourceEntityType: string;
  sourceEntityId: string;
  catalogItemId?: string | null;
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

async function getNextInvoiceNumber(hospitalId: string) {
  const supabase = await createClient();

  const { data: latestInvoice, error } = await supabase
    .from("invoices")
    .select("invoice_number")
    .eq("hospital_id", hospitalId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<{ invoice_number: string | null }>();

  if (error) throw new Error(error.message);

  const nextSequence =
    extractInvoiceSequence(latestInvoice?.invoice_number ?? null) + 1;

  return formatInvoiceNumber(nextSequence);
}

async function getOrCreateOpenInvoice(input: {
  hospitalId: string;
  patientId: string;
  appointmentId?: string | null;
  encounterId?: string | null;
  createdByUserId?: string | null;
}) {
  const supabase = await createClient();

  const { data: invoices, error } = await supabase
    .from("invoices")
    .select("id, encounter_id, appointment_id, status")
    .eq("hospital_id", input.hospitalId)
    .eq("patient_id", input.patientId)
    .in("status", ["draft", "issued", "partially_paid"])
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);

  const openInvoices = invoices ?? [];

  const matchedInvoice =
    openInvoices.find(
      (invoice: any) =>
        input.encounterId &&
        invoice.encounter_id &&
        invoice.encounter_id === input.encounterId
    ) ??
    openInvoices.find(
      (invoice: any) =>
        input.appointmentId &&
        invoice.appointment_id &&
        invoice.appointment_id === input.appointmentId
    ) ??
    openInvoices[0] ??
    null;

  if (matchedInvoice) {
    return { invoiceId: matchedInvoice.id, created: false };
  }

  const invoiceNumber = await getNextInvoiceNumber(input.hospitalId);

  const { data: invoice, error: insertError } = await supabase
    .from("invoices")
    .insert({
      hospital_id: input.hospitalId,
      patient_id: input.patientId,
      appointment_id: input.appointmentId ?? null,
      encounter_id: input.encounterId ?? null,
      invoice_number: invoiceNumber,
      status: "issued",
      subtotal_amount: 0,
      discount_amount: 0,
      tax_amount: 0,
      total_amount: 0,
      amount_paid: 0,
      balance_due: 0,
      issued_at: new Date().toISOString(),
      created_by_user_id: input.createdByUserId ?? null,
      notes: "Auto-generated from clinical workflow",
    })
    .select("id")
    .single<{ id: string }>();

  if (insertError) throw new Error(insertError.message);

  return { invoiceId: invoice.id, created: true };
}

export async function recalculateInvoiceTotals(hospitalId: string, invoiceId: string) {
  const supabase = await createClient();

  const { data: items, error: itemsError } = await supabase
    .from("invoice_items")
    .select("line_total")
    .eq("hospital_id", hospitalId)
    .eq("invoice_id", invoiceId);

  if (itemsError) throw new Error(itemsError.message);

  const { data: payments, error: paymentsError } = await supabase
    .from("payments")
    .select("amount")
    .eq("hospital_id", hospitalId)
    .eq("invoice_id", invoiceId);

  if (paymentsError) throw new Error(paymentsError.message);

  const subtotal = (items ?? []).reduce(
    (sum: number, row: any) => sum + Number(row.line_total ?? 0),
    0
  );

  const amountPaid = (payments ?? []).reduce(
    (sum: number, row: any) => sum + Number(row.amount ?? 0),
    0
  );

  const total = subtotal;
  const balance = Math.max(0, total - amountPaid);

  let status: "draft" | "issued" | "partially_paid" | "paid" = "issued";
  if (amountPaid <= 0) {
    status = "issued";
  } else if (balance <= 0) {
    status = "paid";
  } else {
    status = "partially_paid";
  }

  const { error: updateError } = await supabase
    .from("invoices")
    .update({
      subtotal_amount: subtotal,
      total_amount: total,
      amount_paid: amountPaid,
      balance_due: balance,
      status,
      updated_at: new Date().toISOString(),
    })
    .eq("hospital_id", hospitalId)
    .eq("id", invoiceId);

  if (updateError) throw new Error(updateError.message);
}

export async function addAutomatedCharge(input: AddAutomatedChargeInput) {
  const supabase = await createClient();

  if (!input.description.trim()) {
    throw new Error("Automated charge description is required.");
  }

  if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
    throw new Error("Automated charge quantity must be greater than zero.");
  }

  if (!Number.isFinite(input.unitPrice) || input.unitPrice < 0) {
    throw new Error("Automated charge unit price must be zero or greater.");
  }

  const { data: existingCharge, error: existingChargeError } = await supabase
    .from("invoice_items")
    .select("id, invoice_id")
    .eq("hospital_id", input.hospitalId)
    .eq("source_entity_type", input.sourceEntityType)
    .eq("source_entity_id", input.sourceEntityId)
    .maybeSingle<{ id: string; invoice_id: string }>();

  if (existingChargeError) throw new Error(existingChargeError.message);

  if (existingCharge) {
    return {
      invoiceId: existingCharge.invoice_id,
      invoiceItemId: existingCharge.id,
      duplicate: true,
    };
  }

  const { invoiceId } = await getOrCreateOpenInvoice({
    hospitalId: input.hospitalId,
    patientId: input.patientId,
    appointmentId: input.appointmentId ?? null,
    encounterId: input.encounterId ?? null,
    createdByUserId: input.createdByUserId ?? null,
  });

  const lineTotal = Number(input.quantity) * Number(input.unitPrice);

  const { data: insertedItem, error: insertError } = await supabase
    .from("invoice_items")
    .insert({
      hospital_id: input.hospitalId,
      invoice_id: invoiceId,
      item_type: input.itemType,
      description: input.description,
      quantity: input.quantity,
      unit_price: input.unitPrice,
      line_total: lineTotal,
      source_entity_type: input.sourceEntityType,
      source_entity_id: input.sourceEntityId,
      catalog_item_id: input.catalogItemId ?? null,
    })
    .select("id")
    .single<{ id: string }>();

  if (insertError) throw new Error(insertError.message);

  await recalculateInvoiceTotals(input.hospitalId, invoiceId);

  await supabase.from("billing_events").insert({
    hospital_id: input.hospitalId,
    entity_type: input.sourceEntityType,
    entity_id: input.sourceEntityId,
    event_type: "charge_created",
    payload: {
      invoice_id: invoiceId,
      invoice_item_id: insertedItem.id,
      item_type: input.itemType,
      description: input.description,
      quantity: input.quantity,
      unit_price: input.unitPrice,
      line_total: lineTotal,
      catalog_item_id: input.catalogItemId ?? null,
    },
  });

  return {
    invoiceId,
    invoiceItemId: insertedItem.id,
    duplicate: false,
  };
}

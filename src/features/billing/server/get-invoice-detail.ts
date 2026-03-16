import { createClient } from "@/lib/supabase/server";

export async function getInvoiceDetail(hospitalSlug: string, invoiceId: string) {
  const supabase = await createClient();

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug, name, currency_code")
    .eq("slug", hospitalSlug)
    .maybeSingle<{ id: string; slug: string; name: string; currency_code: string | null }>();

  if (hospitalError) throw new Error(hospitalError.message);
  if (!hospital) throw new Error("Hospital not found");

  const { data: invoice, error: invoiceError } = await supabase
    .from("invoices")
    .select(`
      id,
      invoice_number,
      status,
      subtotal_amount,
      discount_amount,
      tax_amount,
      total_amount,
      amount_paid,
      balance_due,
      issued_at,
      due_at,
      notes,
      appointment_id,
      encounter_id,
      patient:patients (
        id,
        patient_number,
        first_name,
        middle_name,
        last_name,
        phone
      )
    `)
    .eq("hospital_id", hospital.id)
    .eq("id", invoiceId)
    .maybeSingle();

  if (invoiceError) throw new Error(invoiceError.message);
  if (!invoice) throw new Error("Invoice not found");

  const { data: items, error: itemsError } = await supabase
    .from("invoice_items")
    .select(`
      id,
      item_type,
      description,
      quantity,
      unit_price,
      line_total,
      source_entity_type,
      source_entity_id,
      catalog_item_id,
      payment_allocations (
        id,
        amount,
        payment_id
      )
    `)
    .eq("hospital_id", hospital.id)
    .eq("invoice_id", invoiceId)
    .order("created_at", { ascending: true });

  if (itemsError) throw new Error(itemsError.message);

  const { data: payments, error: paymentsError } = await supabase
    .from("payments")
    .select(`
      id,
      payment_date,
      amount,
      method,
      reference_number,
      notes,
      receipt_number,
      status,
      payer_name,
      payment_allocations (
        id,
        invoice_item_id,
        amount
      )
    `)
    .eq("hospital_id", hospital.id)
    .eq("invoice_id", invoiceId)
    .order("payment_date", { ascending: false });

  if (paymentsError) throw new Error(paymentsError.message);

  return {
    hospital,
    invoice: {
      ...invoice,
      patient: Array.isArray((invoice as any).patient) ? (invoice as any).patient[0] ?? null : (invoice as any).patient ?? null,
    },
    items: items ?? [],
    payments: payments ?? [],
  };
}
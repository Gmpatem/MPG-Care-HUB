import { createClient } from "@/lib/supabase/server";

export async function getPaymentsPageData(hospitalSlug: string) {
  const supabase = await createClient();

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug, name, currency_code")
    .eq("slug", hospitalSlug)
    .maybeSingle<{ id: string; slug: string; name: string; currency_code: string | null }>();

  if (hospitalError) throw new Error(hospitalError.message);
  if (!hospital) throw new Error("Hospital not found");

  const { data: payments, error: paymentsError } = await supabase
    .from("payments")
    .select(`
      id,
      invoice_id,
      payment_date,
      amount,
      method,
      reference_number,
      notes,
      receipt_number,
      status,
      payer_name,
      invoice:invoices (
        id,
        invoice_number,
        patient:patients (
          id,
          patient_number,
          first_name,
          middle_name,
          last_name
        )
      )
    `)
    .eq("hospital_id", hospital.id)
    .order("payment_date", { ascending: false });

  if (paymentsError) throw new Error(paymentsError.message);

  const { data: eligibleInvoices, error: invoiceError } = await supabase
    .from("invoices")
    .select(`
      id,
      invoice_number,
      status,
      balance_due,
      patient:patients (
        id,
        patient_number,
        first_name,
        middle_name,
        last_name
      )
    `)
    .eq("hospital_id", hospital.id)
    .in("status", ["issued", "partially_paid"])
    .order("created_at", { ascending: false });

  if (invoiceError) throw new Error(invoiceError.message);

  return {
    hospital,
    payments: (payments ?? []).map((row: any) => ({
      ...row,
      invoice: Array.isArray(row.invoice) ? row.invoice[0] ?? null : row.invoice ?? null,
    })),
    invoices: (eligibleInvoices ?? []).map((row: any) => ({
      ...row,
      patient: Array.isArray(row.patient) ? row.patient[0] ?? null : row.patient ?? null,
    })),
  };
}
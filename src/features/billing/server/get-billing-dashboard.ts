import { createClient } from "@/lib/supabase/server";

export async function getBillingDashboard(hospitalSlug: string) {
  const supabase = await createClient();

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug, name, currency_code")
    .eq("slug", hospitalSlug)
    .maybeSingle<{ id: string; slug: string; name: string; currency_code: string | null }>();

  if (hospitalError) throw new Error(hospitalError.message);
  if (!hospital) throw new Error("Hospital not found");

  const { data: invoices, error: invoicesError } = await supabase
    .from("invoices")
    .select(`
      id,
      invoice_number,
      status,
      total_amount,
      amount_paid,
      balance_due,
      issued_at,
      due_at,
      patient:patients (
        id,
        patient_number,
        first_name,
        middle_name,
        last_name
      )
    `)
    .eq("hospital_id", hospital.id)
    .order("created_at", { ascending: false })
    .limit(12);

  if (invoicesError) throw new Error(invoicesError.message);

  const { data: payments, error: paymentsError } = await supabase
    .from("payments")
    .select(`
      id,
      invoice_id,
      payment_date,
      amount,
      method,
      receipt_number,
      payer_name,
      status,
      invoice:invoices (
        id,
        invoice_number
      )
    `)
    .eq("hospital_id", hospital.id)
    .order("payment_date", { ascending: false })
    .limit(12);

  if (paymentsError) throw new Error(paymentsError.message);

  const { data: allInvoices, error: allInvoicesError } = await supabase
    .from("invoices")
    .select("id, status, total_amount, amount_paid, balance_due")
    .eq("hospital_id", hospital.id);

  if (allInvoicesError) throw new Error(allInvoicesError.message);

  const mappedInvoices = (invoices ?? []).map((row: any) => ({
    ...row,
    patient: Array.isArray(row.patient) ? row.patient[0] ?? null : row.patient ?? null,
  }));

  const mappedPayments = (payments ?? []).map((row: any) => ({
    ...row,
    invoice: Array.isArray(row.invoice) ? row.invoice[0] ?? null : row.invoice ?? null,
  }));

  const all = allInvoices ?? [];
  const totalInvoices = all.length;
  const openInvoices = all.filter((row: any) => row.status === "issued" || row.status === "partially_paid").length;
  const paidInvoices = all.filter((row: any) => row.status === "paid").length;
  const totalBilled = all.reduce((sum: number, row: any) => sum + Number(row.total_amount ?? 0), 0);
  const totalCollected = all.reduce((sum: number, row: any) => sum + Number(row.amount_paid ?? 0), 0);
  const totalOutstanding = all.reduce((sum: number, row: any) => sum + Number(row.balance_due ?? 0), 0);

  return {
    hospital,
    stats: {
      totalInvoices,
      openInvoices,
      paidInvoices,
      totalBilled,
      totalCollected,
      totalOutstanding,
    },
    invoices: mappedInvoices,
    payments: mappedPayments,
  };
}
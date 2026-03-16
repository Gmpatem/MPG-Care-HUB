import { createClient } from "@/lib/supabase/server";

export async function getInvoicesPageData(hospitalSlug: string) {
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
      subtotal_amount,
      discount_amount,
      tax_amount,
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
    .order("created_at", { ascending: false });

  if (invoicesError) throw new Error(invoicesError.message);

  return {
    hospital,
    invoices: (invoices ?? []).map((row: any) => ({
      ...row,
      patient: Array.isArray(row.patient) ? row.patient[0] ?? null : row.patient ?? null,
    })),
  };
}
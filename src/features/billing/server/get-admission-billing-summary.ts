import { createClient } from "@/lib/supabase/server";

export async function getAdmissionBillingSummary(
  hospitalId: string,
  patientId: string,
  encounterId: string | null
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("invoices")
    .select("id,total_amount,amount_paid,balance_due,status")
    .eq("hospital_id", hospitalId)
    .eq("patient_id", patientId)
    .eq("encounter_id", encounterId);

  if (error) throw new Error(error.message);

  const invoices = data ?? [];

  const total = invoices.reduce((s, i) => s + Number(i.total_amount ?? 0), 0);
  const paid = invoices.reduce((s, i) => s + Number(i.amount_paid ?? 0), 0);
  const balance = invoices.reduce((s, i) => s + Number(i.balance_due ?? 0), 0);

  return {
    invoiceCount: invoices.length,
    totalAmount: total,
    amountPaid: paid,
    balanceDue: balance,
    cleared: balance <= 0,
  };
}
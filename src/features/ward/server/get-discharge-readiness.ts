import { createClient } from "@/lib/supabase/server";
import { getAdmissionDischargeChecklist } from "@/features/ward/server/get-admission-discharge-checklist";

type ReadinessResult = {
  admissionId: string;
  dischargeRequested: boolean;
  nurseCleared: boolean;
  checklistReady: boolean;
  checklistCompleted: number;
  checklistRequiredTotal: number;
  balanceDue: number;
  billingReady: boolean;
  readyForFinalDischarge: boolean;
};

export async function getDischargeReadiness(
  hospitalId: string,
  admissionId: string,
  patientId: string,
  encounterId: string | null
): Promise<ReadinessResult> {
  const supabase = await createClient();

  const { data: admission, error: admissionError } = await supabase
    .from("admissions")
    .select("id, discharge_requested")
    .eq("hospital_id", hospitalId)
    .eq("id", admissionId)
    .maybeSingle();

  if (admissionError) throw new Error(admissionError.message);
  if (!admission) throw new Error("Admission not found.");

  const checklist = await getAdmissionDischargeChecklist(hospitalId, admissionId);

  const { data: invoices, error: invoicesError } = await supabase
    .from("invoices")
    .select("id, balance_due, status")
    .eq("hospital_id", hospitalId)
    .eq("patient_id", patientId)
    .eq("encounter_id", encounterId)
    .order("created_at", { ascending: false });

  if (invoicesError) throw new Error(invoicesError.message);

  const openInvoices = (invoices ?? []).filter((invoice) =>
    invoice.status !== "cancelled" && invoice.status !== "void"
  );

  const balanceDue = openInvoices.reduce(
    (sum, invoice) => sum + Number(invoice.balance_due ?? 0),
    0
  );

  const dischargeRequested = Boolean(admission.discharge_requested);
  const nurseCleared = checklist.summary.ready;
  const billingReady = balanceDue <= 0;

  return {
    admissionId,
    dischargeRequested,
    nurseCleared,
    checklistReady: checklist.summary.ready,
    checklistCompleted: checklist.summary.required_completed,
    checklistRequiredTotal: checklist.summary.required_total,
    balanceDue,
    billingReady,
    readyForFinalDischarge: dischargeRequested && checklist.summary.ready && billingReady,
  };
}
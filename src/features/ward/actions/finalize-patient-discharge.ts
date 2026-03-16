"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit/write-audit-log";
import { getDischargeReadiness } from "@/features/ward/server/get-discharge-readiness";

export type FinalizePatientDischargeState = {
  success?: boolean;
  message?: string;
};

export async function finalizePatientDischarge(
  hospitalSlug: string,
  admissionId: string,
  _prevState: FinalizePatientDischargeState,
  formData: FormData
): Promise<FinalizePatientDischargeState> {
  const dischargeNotes = String(formData.get("discharge_notes") ?? "").trim() || null;

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, message: "You must be signed in." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug")
    .eq("slug", hospitalSlug)
    .maybeSingle();

  if (hospitalError || !hospital) {
    return { success: false, message: "Hospital not found." };
  }

  const { data: admission, error: admissionError } = await supabase
    .from("admissions")
    .select("id, patient_id, encounter_id, bed_id, status, discharge_requested")
    .eq("hospital_id", hospital.id)
    .eq("id", admissionId)
    .eq("status", "admitted")
    .maybeSingle();

  if (admissionError || !admission) {
    return { success: false, message: "Admission not found." };
  }

  let readiness;
  try {
    readiness = await getDischargeReadiness(
      hospital.id,
      admission.id,
      admission.patient_id,
      admission.encounter_id
    );
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to evaluate discharge readiness.",
    };
  }

  if (!readiness.dischargeRequested) {
    return { success: false, message: "Doctor discharge request is still missing." };
  }

  if (!readiness.nurseCleared) {
    return { success: false, message: "Nurse discharge clearance is still missing." };
  }

  if (!readiness.billingReady) {
    return {
      success: false,
      message: `Billing is not settled. Balance due: ${readiness.balanceDue.toFixed(2)}`,
    };
  }

  const { error: admissionUpdateError } = await supabase
    .from("admissions")
    .update({
      status: "discharged",
      discharged_at: new Date().toISOString(),
      discharge_notes: dischargeNotes,
      updated_at: new Date().toISOString(),
    })
    .eq("hospital_id", hospital.id)
    .eq("id", admission.id);

  if (admissionUpdateError) {
    return { success: false, message: admissionUpdateError.message };
  }

  if (admission.bed_id) {
    const { error: bedUpdateError } = await supabase
      .from("beds")
      .update({
        status: "available",
        updated_at: new Date().toISOString(),
      })
      .eq("hospital_id", hospital.id)
      .eq("id", admission.bed_id);

    if (bedUpdateError) {
      return {
        success: false,
        message: "Patient discharged, but bed release failed.",
      };
    }
  }

  await writeAuditLog({
    hospitalId: hospital.id,
    actorUserId: profile?.id ?? user.id,
    entityType: "admission",
    entityId: admission.id,
    action: "patient_discharged",
    payload: {
      admission_id: admission.id,
      patient_id: admission.patient_id,
      encounter_id: admission.encounter_id,
      balance_due: readiness.balanceDue,
      discharge_notes: dischargeNotes,
    },
  });

  revalidatePath(`/h/${hospitalSlug}`);
  revalidatePath(`/h/${hospitalSlug}/ward`);
  revalidatePath(`/h/${hospitalSlug}/census`);
  revalidatePath(`/h/${hospitalSlug}/nurse`);
  revalidatePath(`/h/${hospitalSlug}/ward/discharges`);
  revalidatePath(`/h/${hospitalSlug}/ward/admissions/${admission.id}`);

  return { success: true, message: "Patient discharged successfully." };
}
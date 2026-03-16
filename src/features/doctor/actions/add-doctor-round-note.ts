"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit/write-audit-log";

export type AddDoctorRoundNoteState = {
  success?: boolean;
  message?: string;
};

export async function addDoctorRoundNote(
  hospitalSlug: string,
  admissionId: string,
  _prevState: AddDoctorRoundNoteState,
  formData: FormData
): Promise<AddDoctorRoundNoteState> {
  const subjectiveNotes = String(formData.get("subjective_notes") ?? "").trim() || null;
  const objectiveNotes = String(formData.get("objective_notes") ?? "").trim() || null;
  const assessmentNotes = String(formData.get("assessment_notes") ?? "").trim() || null;
  const planNotes = String(formData.get("plan_notes") ?? "").trim() || null;
  const dischargeRecommendedRaw = String(formData.get("discharge_recommended") ?? "").trim();
  const dischargeRecommended = dischargeRecommendedRaw === "true";

  const hasAnyContent =
    subjectiveNotes ||
    objectiveNotes ||
    assessmentNotes ||
    planNotes ||
    dischargeRecommended;

  if (!hasAnyContent) {
    return { success: false, message: "Enter at least one round note field." };
  }

  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { success: false, message: "You must be signed in." };
  }

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
    .select("id, patient_id, encounter_id, status")
    .eq("hospital_id", hospital.id)
    .eq("id", admissionId)
    .eq("status", "admitted")
    .maybeSingle();

  if (admissionError || !admission) {
    return { success: false, message: "Admission not found." };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  const { data: doctorStaff, error: doctorStaffError } = await supabase
    .from("staff")
    .select("id")
    .eq("hospital_id", hospital.id)
    .eq("hospital_user_id", user.id)
    .maybeSingle();

  if (doctorStaffError || !doctorStaff) {
    return { success: false, message: "Doctor staff profile not found." };
  }

  const { data: inserted, error: insertError } = await supabase
    .from("doctor_rounds")
    .insert({
      hospital_id: hospital.id,
      admission_id: admission.id,
      patient_id: admission.patient_id,
      doctor_staff_id: doctorStaff.id,
      encounter_id: admission.encounter_id,
      round_datetime: new Date().toISOString(),
      subjective_notes: subjectiveNotes,
      objective_notes: objectiveNotes,
      assessment_notes: assessmentNotes,
      plan_notes: planNotes,
      discharge_recommended: dischargeRecommended,
      created_by_user_id: profile?.id ?? user.id,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    return { success: false, message: insertError?.message ?? "Failed to save doctor round." };
  }

  await writeAuditLog({
    hospitalId: hospital.id,
    actorUserId: profile?.id ?? user.id,
    entityType: "doctor_round",
    entityId: inserted.id,
    action: "doctor_round_added",
    payload: {
      admission_id: admission.id,
      patient_id: admission.patient_id,
      encounter_id: admission.encounter_id,
      doctor_staff_id: doctorStaff.id,
      discharge_recommended: dischargeRecommended,
    },
  });

  revalidatePath(`/h/${hospitalSlug}/doctor/rounds`);
  revalidatePath(`/h/${hospitalSlug}/ward/admissions/${admissionId}`);
  revalidatePath(`/h/${hospitalSlug}/ward/admissions/${admissionId}/activity`);
  revalidatePath(`/h/${hospitalSlug}/nurse/admissions/${admissionId}`);

  return {
    success: true,
    message: "Doctor round note added successfully.",
  };
}
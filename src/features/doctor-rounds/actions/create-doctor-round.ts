"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ActionState = {
  error?: string;
};

export async function createDoctorRound(
  hospitalSlug: string,
  admissionId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();

  const doctor_staff_id = String(formData.get("doctor_staff_id") ?? "").trim() || null;
  const encounter_id = String(formData.get("encounter_id") ?? "").trim() || null;
  const subjective_notes = String(formData.get("subjective_notes") ?? "").trim() || null;
  const objective_notes = String(formData.get("objective_notes") ?? "").trim() || null;
  const assessment_notes = String(formData.get("assessment_notes") ?? "").trim() || null;
  const plan_notes = String(formData.get("plan_notes") ?? "").trim() || null;
  const discharge_recommended =
    String(formData.get("discharge_recommended") ?? "") === "on";

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug")
    .eq("slug", hospitalSlug)
    .maybeSingle<{ id: string; slug: string }>();

  if (hospitalError) return { error: hospitalError.message };
  if (!hospital) return { error: "Hospital not found." };

  const { data: admission, error: admissionError } = await supabase
    .from("admissions")
    .select("id, patient_id")
    .eq("hospital_id", hospital.id)
    .eq("id", admissionId)
    .maybeSingle<{ id: string; patient_id: string }>();

  if (admissionError) return { error: admissionError.message };
  if (!admission) return { error: "Admission not found." };

  const { error: roundError } = await supabase
    .from("doctor_rounds")
    .insert({
      hospital_id: hospital.id,
      admission_id: admission.id,
      patient_id: admission.patient_id,
      doctor_staff_id,
      encounter_id,
      round_datetime: new Date().toISOString(),
      subjective_notes,
      objective_notes,
      assessment_notes,
      plan_notes,
      discharge_recommended,
      created_by_user_id: null,
    });

  if (roundError) return { error: roundError.message };

  if (discharge_recommended) {
    const { error: dischargeUpdateError } = await supabase
      .from("admissions")
      .update({
        discharge_requested: true,
        discharge_requested_at: new Date().toISOString(),
        discharge_requested_by_staff_id: doctor_staff_id,
        discharge_notes: plan_notes,
      })
      .eq("hospital_id", hospital.id)
      .eq("id", admission.id);

    if (dischargeUpdateError) return { error: dischargeUpdateError.message };
  }

  revalidatePath(`/h/${hospitalSlug}/doctor/rounds`);
  revalidatePath(`/h/${hospitalSlug}/ward/discharges`);

  redirect(`/h/${hospitalSlug}/doctor/rounds`);
}
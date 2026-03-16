"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionState = {
  success?: boolean;
  error?: string;
};

function toNullableNumber(value: FormDataEntryValue | null) {
  const str = String(value ?? "").trim();
  if (!str) return null;
  const num = Number(str);
  return Number.isFinite(num) ? num : null;
}

export async function createNurseVitals(
  hospitalSlug: string,
  admissionId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();

  const recorded_by_staff_id = String(formData.get("recorded_by_staff_id") ?? "").trim();
  const patient_id = String(formData.get("patient_id") ?? "").trim();
  const encounter_id = String(formData.get("encounter_id") ?? "").trim() || null;

  if (!patient_id) return { error: "Patient is required." };
  if (!recorded_by_staff_id) return { error: "Recording staff is required." };

  const temperature_c = toNullableNumber(formData.get("temperature_c"));
  const blood_pressure_systolic = toNullableNumber(formData.get("blood_pressure_systolic"));
  const blood_pressure_diastolic = toNullableNumber(formData.get("blood_pressure_diastolic"));
  const pulse_bpm = toNullableNumber(formData.get("pulse_bpm"));
  const respiratory_rate = toNullableNumber(formData.get("respiratory_rate"));
  const spo2 = toNullableNumber(formData.get("spo2"));
  const pain_score = toNullableNumber(formData.get("pain_score"));
  const weight_kg = toNullableNumber(formData.get("weight_kg"));
  const notes = String(formData.get("notes") ?? "").trim() || null;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in." };

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug")
    .eq("slug", hospitalSlug)
    .maybeSingle<{ id: string; slug: string }>();

  if (hospitalError) return { error: hospitalError.message };
  if (!hospital) return { error: "Hospital not found." };

  const { error } = await supabase
    .from("patient_vitals")
    .insert({
      hospital_id: hospital.id,
      patient_id,
      admission_id: admissionId,
      encounter_id,
      source_type: "triage",
      recorded_at: new Date().toISOString(),
      recorded_by_user_id: user.id,
      recorded_by_staff_id,
      temperature_c,
      blood_pressure_systolic,
      blood_pressure_diastolic,
      pulse_bpm,
      respiratory_rate,
      spo2,
      pain_score,
      weight_kg,
      notes,
    });

  if (error) return { error: error.message };

  revalidatePath(`/h/${hospitalSlug}/ward/admissions/${admissionId}`);

  return { success: true };
}

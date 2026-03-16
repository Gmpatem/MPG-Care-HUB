"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit/write-audit-log";

export type RecordNurseVitalsState = {
  success?: boolean;
  message?: string;
};

function parseOptionalNumber(value: FormDataEntryValue | null) {
  const raw = String(value ?? "").trim();
  if (!raw) return null;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export async function recordNurseVitals(
  hospitalSlug: string,
  admissionId: string,
  _prevState: RecordNurseVitalsState,
  formData: FormData
): Promise<RecordNurseVitalsState> {
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

  const { data: staff } = await supabase
    .from("staff")
    .select("id")
    .eq("hospital_id", hospital.id)
    .eq("hospital_user_id", user.id)
    .maybeSingle();

  const payload = {
    hospital_id: hospital.id,
    patient_id: admission.patient_id,
    encounter_id: admission.encounter_id,
    admission_id: admission.id,
    source_type: "ward_round",
    recorded_at: new Date().toISOString(),
    recorded_by_user_id: profile?.id ?? user.id,
    recorded_by_staff_id: staff?.id ?? null,
    temperature_c: parseOptionalNumber(formData.get("temperature_c")),
    blood_pressure_systolic: parseOptionalNumber(formData.get("blood_pressure_systolic")),
    blood_pressure_diastolic: parseOptionalNumber(formData.get("blood_pressure_diastolic")),
    pulse_bpm: parseOptionalNumber(formData.get("pulse_bpm")),
    respiratory_rate: parseOptionalNumber(formData.get("respiratory_rate")),
    spo2: parseOptionalNumber(formData.get("spo2")),
    pain_score: parseOptionalNumber(formData.get("pain_score")),
    weight_kg: parseOptionalNumber(formData.get("weight_kg")),
    height_cm: parseOptionalNumber(formData.get("height_cm")),
    notes: String(formData.get("notes") ?? "").trim() || null,
  };

  const hasAnyVitals =
    payload.temperature_c !== null ||
    payload.blood_pressure_systolic !== null ||
    payload.blood_pressure_diastolic !== null ||
    payload.pulse_bpm !== null ||
    payload.respiratory_rate !== null ||
    payload.spo2 !== null ||
    payload.pain_score !== null ||
    payload.weight_kg !== null ||
    payload.height_cm !== null ||
    payload.notes !== null;

  if (!hasAnyVitals) {
    return { success: false, message: "Enter at least one vital sign or note." };
  }

  const { data: inserted, error: insertError } = await supabase
    .from("patient_vitals")
    .insert(payload)
    .select("id")
    .single();

  if (insertError || !inserted) {
    return { success: false, message: insertError?.message ?? "Failed to save vitals." };
  }

  await writeAuditLog({
    hospitalId: hospital.id,
    actorUserId: profile?.id ?? user.id,
    entityType: "patient_vitals",
    entityId: inserted.id,
    action: "nurse_vitals_recorded",
    payload: {
      admission_id: admission.id,
      patient_id: admission.patient_id,
      encounter_id: admission.encounter_id,
      recorded_by_staff_id: staff?.id ?? null,
    },
  });

  revalidatePath(`/h/${hospitalSlug}/nurse`);
  revalidatePath(`/h/${hospitalSlug}/nurse/admissions/${admissionId}`);
  revalidatePath(`/h/${hospitalSlug}/ward/admissions/${admissionId}`);

  return { success: true, message: "Vitals recorded successfully." };
}
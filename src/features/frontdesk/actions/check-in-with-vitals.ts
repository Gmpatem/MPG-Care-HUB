"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionState = {
  success?: boolean;
  error?: string;
};

function decimalOrNull(value: FormDataEntryValue | null) {
  const str = String(value ?? "").trim();
  if (!str) return null;

  const num = Number(str);
  if (Number.isNaN(num) || num <= 0) return null;

  return num;
}

function integerOrNull(value: FormDataEntryValue | null) {
  const str = String(value ?? "").trim();
  if (!str) return null;

  const num = Number(str);
  if (Number.isNaN(num) || num <= 0) return null;

  return Math.trunc(num);
}

function spo2OrNull(value: FormDataEntryValue | null) {
  const str = String(value ?? "").trim();
  if (!str) return null;

  const num = Number(str);
  if (Number.isNaN(num) || num < 0 || num > 100) return null;

  return Math.trunc(num);
}

function painScoreOrNull(value: FormDataEntryValue | null) {
  const str = String(value ?? "").trim();
  if (!str) return null;

  const num = Number(str);
  if (Number.isNaN(num) || num < 0 || num > 10) return null;

  return Math.trunc(num);
}

export async function checkInWithVitals(
  hospitalSlug: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();

  const appointment_id = String(formData.get("appointment_id") ?? "").trim();
  const patient_id = String(formData.get("patient_id") ?? "").trim();
  const vitals_enabled = String(formData.get("vitals_enabled") ?? "false") === "true";

  if (!appointment_id) {
    return { error: "Appointment is required." };
  }

  if (!patient_id) {
    return { error: "Patient is required." };
  }

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug")
    .eq("slug", hospitalSlug)
    .maybeSingle<{ id: string; slug: string }>();

  if (hospitalError) {
    return { error: hospitalError.message };
  }

  if (!hospital) {
    return { error: "Hospital not found." };
  }

  const { error: appointmentError } = await supabase
    .from("appointments")
    .update({
      status: "checked_in",
      check_in_at: new Date().toISOString(),
      checked_in_by: null,
    })
    .eq("hospital_id", hospital.id)
    .eq("id", appointment_id);

  if (appointmentError) {
    return { error: appointmentError.message };
  }

  if (vitals_enabled) {
    const payload = {
      hospital_id: hospital.id,
      patient_id,
      appointment_id,
      source_type: "check_in",
      recorded_by_user_id: null,
      recorded_by_staff_id: null,
      height_cm: decimalOrNull(formData.get("height_cm")),
      weight_kg: decimalOrNull(formData.get("weight_kg")),
      temperature_c: decimalOrNull(formData.get("temperature_c")),
      blood_pressure_systolic: integerOrNull(formData.get("blood_pressure_systolic")),
      blood_pressure_diastolic: integerOrNull(formData.get("blood_pressure_diastolic")),
      pulse_bpm: integerOrNull(formData.get("pulse_bpm")),
      respiratory_rate: integerOrNull(formData.get("respiratory_rate")),
      spo2: spo2OrNull(formData.get("spo2")),
      pain_score: painScoreOrNull(formData.get("pain_score")),
      notes: String(formData.get("notes") ?? "").trim() || null,
    };

    const hasAnyVitals =
      payload.height_cm !== null ||
      payload.weight_kg !== null ||
      payload.temperature_c !== null ||
      payload.blood_pressure_systolic !== null ||
      payload.blood_pressure_diastolic !== null ||
      payload.pulse_bpm !== null ||
      payload.respiratory_rate !== null ||
      payload.spo2 !== null ||
      payload.pain_score !== null ||
      payload.notes !== null;

    if (hasAnyVitals) {
      const { error: vitalsError } = await supabase
        .from("patient_vitals")
        .insert(payload);

      if (vitalsError) {
        return { error: vitalsError.message };
      }
    }
  }

  revalidatePath(`/h/${hospitalSlug}/frontdesk`);
  revalidatePath(`/h/${hospitalSlug}/frontdesk/queue`);
  revalidatePath(`/h/${hospitalSlug}/frontdesk/patients`);
  revalidatePath(`/h/${hospitalSlug}/appointments`);

  return { success: true };
}
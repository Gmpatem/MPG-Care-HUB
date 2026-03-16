"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generatePatientNumber } from "@/features/frontdesk/server/generate-patient-number";

export type CreateOrQueuePatientState = {
  success?: boolean;
  message?: string;
  patientId?: string;
  appointmentId?: string;
};

function normalizeText(value: FormDataEntryValue | null) {
  return String(value ?? "").trim();
}

export async function createOrQueuePatient(
  hospitalSlug: string,
  _prevState: CreateOrQueuePatientState,
  formData: FormData
): Promise<CreateOrQueuePatientState> {
  const existingPatientId = normalizeText(formData.get("existing_patient_id"));
  const firstName = normalizeText(formData.get("first_name"));
  const middleName = normalizeText(formData.get("middle_name"));
  const lastName = normalizeText(formData.get("last_name"));
  const sex = normalizeText(formData.get("sex")) || "unknown";
  const dateOfBirth = normalizeText(formData.get("date_of_birth")) || null;
  const phone = normalizeText(formData.get("phone")) || null;
  const email = normalizeText(formData.get("email")) || null;
  const addressText = normalizeText(formData.get("address_text")) || null;
  const emergencyContactName = normalizeText(formData.get("emergency_contact_name")) || null;
  const emergencyContactPhone = normalizeText(formData.get("emergency_contact_phone")) || null;
  const staffId = normalizeText(formData.get("staff_id")) || null;
  const scheduledAt = normalizeText(formData.get("scheduled_at"));
  const visitType = normalizeText(formData.get("visit_type")) || "outpatient";
  const appointmentType = normalizeText(formData.get("appointment_type")) || "walk_in";
  const reason = normalizeText(formData.get("reason")) || null;
  const arrivalNotes = normalizeText(formData.get("arrival_notes")) || null;
  const assignmentMode = normalizeText(formData.get("assignment_mode")) || "manual";

  if (!existingPatientId && (!firstName || !lastName)) {
    return {
      success: false,
      message: "First name and last name are required for a new patient.",
    };
  }

  if (!scheduledAt) {
    return {
      success: false,
      message: "Scheduled time is required.",
    };
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
    .select("id, slug, name")
    .eq("slug", hospitalSlug)
    .maybeSingle();

  if (hospitalError || !hospital) {
    return { success: false, message: "Hospital not found." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return { success: false, message: "Profile not found." };
  }

  let patientId = existingPatientId;

  if (!patientId) {
    let patientNumber: string;

    try {
      patientNumber = await generatePatientNumber({
        hospitalId: hospital.id,
        hospitalSlug: hospital.slug,
      });
    } catch (error) {
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to generate patient number.",
      };
    }

    const { data: patient, error: patientError } = await supabase
      .from("patients")
      .insert({
        hospital_id: hospital.id,
        patient_number: patientNumber,
        first_name: firstName,
        middle_name: middleName || null,
        last_name: lastName,
        sex,
        date_of_birth: dateOfBirth,
        phone,
        email,
        address_text: addressText,
        emergency_contact_name: emergencyContactName,
        emergency_contact_phone: emergencyContactPhone,
        created_by_user_id: profile.id,
      })
      .select("id")
      .single();

    if (patientError || !patient) {
      return {
        success: false,
        message: patientError?.message ?? "Failed to create patient.",
      };
    }

    patientId = patient.id;
  } else {
    const { data: patientExists, error: patientExistsError } = await supabase
      .from("patients")
      .select("id")
      .eq("id", patientId)
      .eq("hospital_id", hospital.id)
      .maybeSingle();

    if (patientExistsError || !patientExists) {
      return {
        success: false,
        message: "Selected patient was not found in this hospital.",
      };
    }
  }

  const { data: latestQueueRow } = await supabase
    .from("appointments")
    .select("queue_number")
    .eq("hospital_id", hospital.id)
    .order("queue_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextQueueNumber = Number(latestQueueRow?.queue_number ?? 0) + 1;

  const { data: appointment, error: appointmentError } = await supabase
    .from("appointments")
    .insert({
      hospital_id: hospital.id,
      patient_id: patientId,
      staff_id: staffId,
      appointment_type: appointmentType,
      scheduled_at: scheduledAt,
      status: "scheduled",
      reason,
      visit_type: visitType,
      queue_number: nextQueueNumber,
      arrival_notes: arrivalNotes,
      assignment_mode: assignmentMode,
      created_by_user_id: profile.id,
    })
    .select("id")
    .single();

  if (appointmentError || !appointment) {
    return {
      success: false,
      message: appointmentError?.message ?? "Failed to create appointment.",
    };
  }

  revalidatePath(`/h/${hospitalSlug}/frontdesk`);
  revalidatePath(`/h/${hospitalSlug}/frontdesk/queue`);
  revalidatePath(`/h/${hospitalSlug}/patients`);
  revalidatePath(`/h/${hospitalSlug}/appointments`);

  return {
    success: true,
    message: "Patient queued successfully.",
    patientId,
    appointmentId: appointment.id,
  };
}
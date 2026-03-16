"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { addAutomatedCharge } from "@/features/billing/server/automation";
import { writeAuditLog } from "@/lib/audit/write-audit-log";

export type CreateAdmissionIntakeState = {
  success?: boolean;
  message?: string;
};

export async function createAdmissionIntake(
  hospitalSlug: string,
  _prevState: CreateAdmissionIntakeState,
  formData: FormData
): Promise<CreateAdmissionIntakeState> {
  const encounterId = String(formData.get("encounter_id") ?? "").trim();
  const wardId = String(formData.get("ward_id") ?? "").trim();
  const bedIdRaw = String(formData.get("bed_id") ?? "").trim();
  const admissionReason = String(formData.get("admission_reason") ?? "").trim();

  if (!encounterId || !wardId) {
    return { success: false, message: "Encounter and ward are required." };
  }

  const bedId = bedIdRaw || null;

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

  const { data: encounter, error: encounterError } = await supabase
    .from("encounters")
    .select("id, patient_id, appointment_id, provider_staff_id, hospital_id, status")
    .eq("id", encounterId)
    .eq("hospital_id", hospital.id)
    .maybeSingle();

  if (encounterError || !encounter) {
    return { success: false, message: "Encounter not found." };
  }

  const { data: ward, error: wardError } = await supabase
    .from("wards")
    .select("id, name, hospital_id, admission_fee")
    .eq("id", wardId)
    .eq("hospital_id", hospital.id)
    .maybeSingle();

  if (wardError || !ward) {
    return { success: false, message: "Ward not found." };
  }

  if (bedId) {
    const { data: bed, error: bedError } = await supabase
      .from("beds")
      .select("id, ward_id, hospital_id, status, active")
      .eq("id", bedId)
      .eq("hospital_id", hospital.id)
      .maybeSingle();

    if (bedError || !bed) {
      return { success: false, message: "Selected bed not found." };
    }

    if (bed.ward_id !== wardId) {
      return { success: false, message: "Selected bed does not belong to the chosen ward." };
    }

    if (!bed.active) {
      return { success: false, message: "Selected bed is inactive." };
    }

    if (bed.status !== "available") {
      return { success: false, message: "Selected bed is not available." };
    }
  }

  const { data: existingAdmission, error: existingAdmissionError } = await supabase
    .from("admissions")
    .select("id, status")
    .eq("hospital_id", hospital.id)
    .eq("encounter_id", encounter.id)
    .eq("status", "admitted")
    .limit(1)
    .maybeSingle();

  if (existingAdmissionError) {
    return { success: false, message: existingAdmissionError.message };
  }

  if (existingAdmission) {
    return { success: false, message: "This encounter already has an active admission." };
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return { success: false, message: "Profile not found." };
  }

  const { data: admission, error: admissionError } = await supabase
    .from("admissions")
    .insert({
      hospital_id: hospital.id,
      patient_id: encounter.patient_id,
      encounter_id: encounter.id,
      appointment_id: encounter.appointment_id,
      admitting_doctor_staff_id: encounter.provider_staff_id,
      ward_id: ward.id,
      bed_id: bedId,
      status: "admitted",
      admission_reason: admissionReason || null,
      created_by_user_id: profile.id,
    })
    .select("id")
    .single();

  if (admissionError || !admission) {
    return { success: false, message: admissionError?.message ?? "Failed to create admission." };
  }

  if (bedId) {
    const { error: bedUpdateError } = await supabase
      .from("beds")
      .update({
        status: "occupied",
        updated_at: new Date().toISOString(),
      })
      .eq("id", bedId)
      .eq("hospital_id", hospital.id);

    if (bedUpdateError) {
      return {
        success: false,
        message: "Admission created, but bed occupancy update failed.",
      };
    }
  }

  const { error: encounterUpdateError } = await supabase
    .from("encounters")
    .update({
      admission_requested: true,
      status: "finalized",
      updated_at: new Date().toISOString(),
    })
    .eq("id", encounter.id)
    .eq("hospital_id", hospital.id);

  if (encounterUpdateError) {
    return {
      success: false,
      message: "Admission created, but encounter finalization failed.",
    };
  }

  if (Number(ward.admission_fee ?? 0) > 0) {
    try {
      await addAutomatedCharge({
        hospitalId: hospital.id,
        patientId: encounter.patient_id,
        encounterId: encounter.id,
        appointmentId: encounter.appointment_id ?? null,
        sourceEntityType: "admission",
        sourceEntityId: admission.id,
        itemType: "other",
        description: `Admission Fee - ${ward.name}`,
        quantity: 1,
        unitPrice: Number(ward.admission_fee),
      });
    } catch {
      return {
        success: false,
        message: "Admission created, but admission billing charge failed.",
      };
    }
  }

  await writeAuditLog({
    hospitalId: hospital.id,
    actorUserId: profile.id,
    entityType: "admission",
    entityId: admission.id,
    action: "admission_created",
    payload: {
      encounter_id: encounter.id,
      patient_id: encounter.patient_id,
      ward_id: ward.id,
      bed_id: bedId,
      admission_reason: admissionReason || null,
    },
  });

  revalidatePath(`/h/${hospitalSlug}/ward`);
  revalidatePath(`/h/${hospitalSlug}/ward/admissions`);
  revalidatePath(`/h/${hospitalSlug}/ward/admissions/${admission.id}`);
  revalidatePath(`/h/${hospitalSlug}/census`);
  revalidatePath(`/h/${hospitalSlug}/ward/discharges`);

  return {
    success: true,
    message: "Admission created successfully.",
  };
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit/write-audit-log";

export type CreateAdmissionTransferState = {
  success?: boolean;
  message?: string;
};

export async function createAdmissionTransfer(
  hospitalSlug: string,
  admissionId: string,
  _prevState: CreateAdmissionTransferState,
  formData: FormData
): Promise<CreateAdmissionTransferState> {
  const toWardId = String(formData.get("to_ward_id") ?? "").trim();
  const toBedIdRaw = String(formData.get("to_bed_id") ?? "").trim();
  const transferReason = String(formData.get("transfer_reason") ?? "").trim();

  if (!toWardId) {
    return { success: false, message: "Destination ward is required." };
  }

  const toBedId = toBedIdRaw || null;

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

  const { data: admission, error: admissionError } = await supabase
    .from("admissions")
    .select("id, hospital_id, ward_id, bed_id, status")
    .eq("id", admissionId)
    .eq("hospital_id", hospital.id)
    .maybeSingle();

  if (admissionError || !admission) {
    return { success: false, message: "Admission not found." };
  }

  const { data: targetWard, error: targetWardError } = await supabase
    .from("wards")
    .select("id, hospital_id, name")
    .eq("id", toWardId)
    .eq("hospital_id", hospital.id)
    .maybeSingle();

  if (targetWardError || !targetWard) {
    return { success: false, message: "Destination ward not found." };
  }

  if (toBedId) {
    const { data: targetBed, error: targetBedError } = await supabase
      .from("beds")
      .select("id, hospital_id, ward_id, status, active")
      .eq("id", toBedId)
      .eq("hospital_id", hospital.id)
      .maybeSingle();

    if (targetBedError || !targetBed) {
      return { success: false, message: "Destination bed not found." };
    }

    if (targetBed.ward_id !== toWardId) {
      return { success: false, message: "Destination bed does not belong to the selected ward." };
    }

    if (!targetBed.active) {
      return { success: false, message: "Destination bed is inactive." };
    }

    if (targetBed.status !== "available") {
      return { success: false, message: "Destination bed is not available." };
    }
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return { success: false, message: "Profile not found." };
  }

  let transferredByStaffId: string | null = null;
  const { data: staffRow } = await supabase
    .from("staff")
    .select("id")
    .eq("hospital_id", hospital.id)
    .eq("hospital_user_id", user.id)
    .maybeSingle();

  transferredByStaffId = staffRow?.id ?? null;

  const { error: transferInsertError } = await supabase
    .from("admission_transfers")
    .insert({
      hospital_id: hospital.id,
      admission_id: admission.id,
      from_ward_id: admission.ward_id,
      from_bed_id: admission.bed_id,
      to_ward_id: toWardId,
      to_bed_id: toBedId,
      transfer_reason: transferReason || null,
      transferred_by_staff_id: transferredByStaffId,
      created_by_user_id: profile.id,
    });

  if (transferInsertError) {
    return { success: false, message: transferInsertError.message };
  }

  const { error: admissionUpdateError } = await supabase
    .from("admissions")
    .update({
      ward_id: toWardId,
      bed_id: toBedId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", admission.id)
    .eq("hospital_id", hospital.id);

  if (admissionUpdateError) {
    return { success: false, message: "Transfer recorded, but admission update failed." };
  }

  if (admission.bed_id) {
    await supabase
      .from("beds")
      .update({
        status: "available",
        updated_at: new Date().toISOString(),
      })
      .eq("id", admission.bed_id)
      .eq("hospital_id", hospital.id);
  }

  if (toBedId) {
    const { error: targetBedUpdateError } = await supabase
      .from("beds")
      .update({
        status: "occupied",
        updated_at: new Date().toISOString(),
      })
      .eq("id", toBedId)
      .eq("hospital_id", hospital.id);

    if (targetBedUpdateError) {
      return { success: false, message: "Transfer saved, but destination bed update failed." };
    }
  }

  await writeAuditLog({
    hospitalId: hospital.id,
    actorUserId: profile.id,
    entityType: "admission_transfer",
    entityId: admission.id,
    action: "admission_transferred",
    payload: {
      admission_id: admission.id,
      from_ward_id: admission.ward_id,
      from_bed_id: admission.bed_id,
      to_ward_id: toWardId,
      to_bed_id: toBedId,
      transfer_reason: transferReason || null,
    },
  });

  revalidatePath(`/h/${hospitalSlug}/ward`);
  revalidatePath(`/h/${hospitalSlug}/census`);
  revalidatePath(`/h/${hospitalSlug}/ward/admissions`);
  revalidatePath(`/h/${hospitalSlug}/ward/admissions/${admission.id}`);
  revalidatePath(`/h/${hospitalSlug}/ward/discharges`);

  return {
    success: true,
    message: "Transfer completed successfully.",
  };
}
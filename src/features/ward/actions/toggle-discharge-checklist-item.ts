"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit/write-audit-log";

export type ToggleDischargeChecklistItemState = {
  success?: boolean;
  message?: string;
};

export async function toggleDischargeChecklistItem(
  hospitalSlug: string,
  admissionId: string,
  checklistItemKey: string,
  nextCompleted: boolean,
  _prevState: ToggleDischargeChecklistItemState,
  formData: FormData
): Promise<ToggleDischargeChecklistItemState> {
  const noteText = String(formData.get("notes") ?? "").trim() || null;

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
    .select("id")
    .eq("slug", hospitalSlug)
    .maybeSingle();

  if (hospitalError || !hospital) {
    return { success: false, message: "Hospital not found." };
  }

  const { data: admission, error: admissionError } = await supabase
    .from("admissions")
    .select("id, patient_id")
    .eq("hospital_id", hospital.id)
    .eq("id", admissionId)
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

  const { data: existing } = await supabase
    .from("admission_discharge_checklist_items")
    .select("id")
    .eq("hospital_id", hospital.id)
    .eq("admission_id", admissionId)
    .eq("checklist_item_key", checklistItemKey)
    .maybeSingle();

  if (existing?.id) {
    const { error: updateError } = await supabase
      .from("admission_discharge_checklist_items")
      .update({
        completed: nextCompleted,
        completed_at: nextCompleted ? new Date().toISOString() : null,
        completed_by_staff_id: nextCompleted ? staff?.id ?? null : null,
        notes: noteText,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id)
      .eq("hospital_id", hospital.id);

    if (updateError) {
      return { success: false, message: updateError.message };
    }
  } else {
    const { error: insertError } = await supabase
      .from("admission_discharge_checklist_items")
      .insert({
        hospital_id: hospital.id,
        admission_id: admissionId,
        checklist_item_key: checklistItemKey,
        completed: nextCompleted,
        completed_at: nextCompleted ? new Date().toISOString() : null,
        completed_by_staff_id: nextCompleted ? staff?.id ?? null : null,
        notes: noteText,
      });

    if (insertError) {
      return { success: false, message: insertError.message };
    }
  }

  await writeAuditLog({
    hospitalId: hospital.id,
    actorUserId: profile?.id ?? user.id,
    entityType: "admission_discharge_checklist_item",
    entityId: admissionId,
    action: nextCompleted ? "discharge_checklist_completed" : "discharge_checklist_unchecked",
    payload: {
      admission_id: admissionId,
      patient_id: admission.patient_id,
      checklist_item_key: checklistItemKey,
      completed: nextCompleted,
      notes: noteText,
    },
  });

  revalidatePath(`/h/${hospitalSlug}/ward/discharges`);
  revalidatePath(`/h/${hospitalSlug}/ward/admissions/${admissionId}`);
  revalidatePath(`/h/${hospitalSlug}/nurse/admissions/${admissionId}`);
  revalidatePath(`/h/${hospitalSlug}/ward/admissions/${admissionId}/activity`);

  return {
    success: true,
    message: nextCompleted ? "Checklist item completed." : "Checklist item unchecked.",
  };
}
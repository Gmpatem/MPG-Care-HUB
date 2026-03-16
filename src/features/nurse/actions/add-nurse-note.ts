"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { writeAuditLog } from "@/lib/audit/write-audit-log";

export type AddNurseNoteState = {
  success?: boolean;
  message?: string;
};

export async function addNurseNote(
  hospitalSlug: string,
  admissionId: string,
  _prevState: AddNurseNoteState,
  formData: FormData
): Promise<AddNurseNoteState> {
  const noteText = String(formData.get("note_text") ?? "").trim();
  const noteType = String(formData.get("note_type") ?? "").trim() || "routine_monitoring";

  if (!noteText) {
    return { success: false, message: "Note text is required." };
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

  const { data: staff } = await supabase
    .from("staff")
    .select("id")
    .eq("hospital_id", hospital.id)
    .eq("hospital_user_id", user.id)
    .maybeSingle();

  const { data: inserted, error: insertError } = await supabase
    .from("nurse_notes")
    .insert({
      hospital_id: hospital.id,
      admission_id: admission.id,
      patient_id: admission.patient_id,
      encounter_id: admission.encounter_id,
      recorded_by_staff_id: staff?.id ?? null,
      note_type: noteType,
      note_text: noteText,
      created_by_user_id: profile?.id ?? user.id,
    })
    .select("id")
    .single();

  if (insertError || !inserted) {
    return { success: false, message: insertError?.message ?? "Failed to save nurse note." };
  }

  await writeAuditLog({
    hospitalId: hospital.id,
    actorUserId: profile?.id ?? user.id,
    entityType: "nurse_note",
    entityId: inserted.id,
    action: "nurse_note_added",
    payload: {
      admission_id: admission.id,
      patient_id: admission.patient_id,
      encounter_id: admission.encounter_id,
      note_type: noteType,
      recorded_by_staff_id: staff?.id ?? null,
    },
  });

  revalidatePath(`/h/${hospitalSlug}/nurse`);
  revalidatePath(`/h/${hospitalSlug}/nurse/admissions/${admissionId}`);
  revalidatePath(`/h/${hospitalSlug}/ward/admissions/${admissionId}`);

  return { success: true, message: "Nurse note added successfully." };
}
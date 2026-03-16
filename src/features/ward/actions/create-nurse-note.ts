"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CreateNurseNoteState = {
  success?: boolean;
  message?: string;
};

export async function createNurseNote(
  hospitalSlug: string,
  admissionId: string,
  _prevState: CreateNurseNoteState,
  formData: FormData,
): Promise<CreateNurseNoteState> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "You must be signed in." };
    }

    const { data: hospital, error: hospitalError } = await supabase
      .from("hospitals")
      .select("id, slug")
      .eq("slug", hospitalSlug)
      .maybeSingle<{ id: string; slug: string }>();

    if (hospitalError) return { success: false, message: hospitalError.message };
    if (!hospital) return { success: false, message: "Hospital not found." };

    const { data: membership, error: membershipError } = await supabase
      .from("hospital_users")
      .select("id, status")
      .eq("hospital_id", hospital.id)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle<{ id: string; status: string }>();

    if (membershipError) return { success: false, message: membershipError.message };
    if (!membership) return { success: false, message: "You do not have access to this hospital." };

    const { data: nurseStaff } = await supabase
      .from("staff")
      .select("id")
      .eq("hospital_id", hospital.id)
      .eq("hospital_user_id", membership.id)
      .maybeSingle<{ id: string }>();

    const { data: admission, error: admissionError } = await supabase
      .from("admissions")
      .select("id, patient_id, encounter_id")
      .eq("hospital_id", hospital.id)
      .eq("id", admissionId)
      .maybeSingle<{ id: string; patient_id: string; encounter_id: string | null }>();

    if (admissionError) return { success: false, message: admissionError.message };
    if (!admission) return { success: false, message: "Admission not found." };

    const noteType = String(formData.get("note_type") ?? "routine_monitoring").trim() || "routine_monitoring";
    const noteText = String(formData.get("note_text") ?? "").trim();

    if (!noteText) {
      return { success: false, message: "Nurse note text is required." };
    }

    const { error: insertError } = await supabase
      .from("nurse_notes")
      .insert({
        hospital_id: hospital.id,
        admission_id: admission.id,
        patient_id: admission.patient_id,
        encounter_id: admission.encounter_id,
        recorded_by_staff_id: nurseStaff?.id ?? null,
        note_type: noteType,
        note_text: noteText,
        created_by_user_id: user.id,
        updated_at: new Date().toISOString(),
      });

    if (insertError) {
      return { success: false, message: insertError.message };
    }

    revalidatePath(`/h/${hospital.slug}/ward/admissions/${admissionId}`);
    revalidatePath(`/h/${hospital.slug}/ward/census`);

    return { success: true, message: "Nurse note added." };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create nurse note.",
    };
  }
}
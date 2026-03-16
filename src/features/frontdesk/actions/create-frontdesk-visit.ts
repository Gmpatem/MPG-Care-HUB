"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ActionState = {
  error?: string;
};

export async function createFrontdeskVisit(
  hospitalSlug: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();

  const patient_id = String(formData.get("patient_id") ?? "").trim();
  const staff_id = String(formData.get("staff_id") ?? "").trim() || null;
  const visit_type = String(formData.get("visit_type") ?? "outpatient").trim() || "outpatient";
  const appointment_type = String(formData.get("appointment_type") ?? "").trim() || null;
  const scheduled_at = String(formData.get("scheduled_at") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!patient_id) {
    return { error: "Patient is required." };
  }

  if (!scheduled_at) {
    return { error: "Visit date and time is required." };
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

  const { error: insertError } = await supabase
    .from("appointments")
    .insert({
      hospital_id: hospital.id,
      patient_id,
      staff_id,
      appointment_type,
      visit_type,
      scheduled_at,
      reason,
      notes,
      status: "scheduled",
      created_by_user_id: null,
    });

  if (insertError) {
    return { error: insertError.message };
  }

  revalidatePath(`/h/${hospitalSlug}/frontdesk`);
  revalidatePath(`/h/${hospitalSlug}/frontdesk/patients`);
  revalidatePath(`/h/${hospitalSlug}/frontdesk/queue`);
  revalidatePath(`/h/${hospitalSlug}/appointments`);

  redirect(`/h/${hospitalSlug}/frontdesk/queue`);
}
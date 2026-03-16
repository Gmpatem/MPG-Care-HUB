"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type ActionState = {
  error?: string;
};

export async function createFrontdeskPatient(
  hospitalSlug: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();

  const first_name = String(formData.get("first_name") ?? "").trim();
  const middle_name = String(formData.get("middle_name") ?? "").trim() || null;
  const last_name = String(formData.get("last_name") ?? "").trim();
  const sex = String(formData.get("sex") ?? "unknown").trim() || "unknown";
  const date_of_birth = String(formData.get("date_of_birth") ?? "").trim() || null;
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const email = String(formData.get("email") ?? "").trim() || null;
  const address_text = String(formData.get("address_text") ?? "").trim() || null;
  const emergency_contact_name =
    String(formData.get("emergency_contact_name") ?? "").trim() || null;
  const emergency_contact_phone =
    String(formData.get("emergency_contact_phone") ?? "").trim() || null;

  if (!first_name) {
    return { error: "First name is required." };
  }

  if (!last_name) {
    return { error: "Last name is required." };
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

  const { data: inserted, error: insertError } = await supabase
    .from("patients")
    .insert({
      hospital_id: hospital.id,
      first_name,
      middle_name,
      last_name,
      sex,
      date_of_birth,
      phone,
      email,
      address_text,
      emergency_contact_name,
      emergency_contact_phone,
      created_by_user_id: null,
    })
    .select("id")
    .maybeSingle<{ id: string }>();

  if (insertError) {
    return { error: insertError.message };
  }

  if (!inserted) {
    return { error: "Patient could not be created." };
  }

  revalidatePath(`/h/${hospitalSlug}/frontdesk`);
  revalidatePath(`/h/${hospitalSlug}/frontdesk/patients`);
  revalidatePath(`/h/${hospitalSlug}/patients`);

  redirect(`/h/${hospitalSlug}/frontdesk/visits/new?patientId=${inserted.id}`);
}
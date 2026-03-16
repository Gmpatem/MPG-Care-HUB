"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createPatientSchema } from "@/features/patients/schemas/patient.schema";

export async function createPatient(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const values = {
    hospital_id: String(formData.get("hospital_id") ?? ""),
    first_name: String(formData.get("first_name") ?? ""),
    last_name: String(formData.get("last_name") ?? ""),
    middle_name: String(formData.get("middle_name") ?? ""),
    sex: String(formData.get("sex") ?? "unknown"),
    date_of_birth: String(formData.get("date_of_birth") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    address_text: String(formData.get("address_text") ?? ""),
    emergency_contact_name: String(formData.get("emergency_contact_name") ?? ""),
    emergency_contact_phone: String(formData.get("emergency_contact_phone") ?? ""),
  };

  const parsed = createPatientSchema.safeParse(values);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid patient data");
  }

  const { data: hospital } = await supabase
    .from("hospitals")
    .select("id, slug")
    .eq("id", parsed.data.hospital_id)
    .maybeSingle();

  if (!hospital) {
    throw new Error("Hospital not found");
  }

  const { data: inserted, error } = await supabase
    .from("patients")
    .insert({
      hospital_id: parsed.data.hospital_id,
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      middle_name: parsed.data.middle_name || null,
      sex: parsed.data.sex,
      date_of_birth: parsed.data.date_of_birth || null,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      address_text: parsed.data.address_text || null,
      emergency_contact_name: parsed.data.emergency_contact_name || null,
      emergency_contact_phone: parsed.data.emergency_contact_phone || null,
      created_by_user_id: user.id,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/h/${hospital.slug}/patients`);
  redirect(`/h/${hospital.slug}/patients/${inserted.id}`);
}


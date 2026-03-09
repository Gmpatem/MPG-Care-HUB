"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function createStaffProfile(formData: FormData) {
  const supabase = await createClient();

  const hospitalId = String(formData.get("hospital_id") ?? "");
  const hospitalSlug = String(formData.get("hospital_slug") ?? "");
  const hospitalUserId = String(formData.get("hospital_user_id") ?? "");
  const fullName = String(formData.get("full_name") ?? "").trim();
  const department = String(formData.get("department") ?? "").trim();
  const jobTitle = String(formData.get("job_title") ?? "").trim();
  const licenseNumber = String(formData.get("license_number") ?? "").trim();

  if (!hospitalId) throw new Error("Missing hospital id");
  if (!hospitalSlug) throw new Error("Missing hospital slug");
  if (!hospitalUserId) throw new Error("Missing hospital user id");
  if (!fullName) throw new Error("Full name is required");

  const { error } = await supabase
    .from("staff")
    .insert({
      hospital_id: hospitalId,
      hospital_user_id: hospitalUserId,
      full_name: fullName,
      department: department || null,
      job_title: jobTitle || null,
      license_number: licenseNumber || null,
      active: true,
    });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/h/${hospitalSlug}/staff`);
}

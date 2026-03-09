"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

const ALLOWED_ROLES = [
  "hospital_admin",
  "receptionist",
  "doctor",
  "nurse",
  "cashier",
] as const;

export async function updateHospitalUserRole(formData: FormData) {
  const supabase = await createClient();

  const hospitalUserId = String(formData.get("hospital_user_id") ?? "");
  const hospitalSlug = String(formData.get("hospital_slug") ?? "");
  const nextRole = String(formData.get("role") ?? "");

  if (!hospitalUserId) throw new Error("Missing hospital user id");
  if (!hospitalSlug) throw new Error("Missing hospital slug");
  if (!ALLOWED_ROLES.includes(nextRole as (typeof ALLOWED_ROLES)[number])) {
    throw new Error("Invalid role");
  }

  const { error } = await supabase
    .from("hospital_users")
    .update({
      role: nextRole,
      updated_at: new Date().toISOString(),
    })
    .eq("id", hospitalUserId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/h/${hospitalSlug}/staff`);
}

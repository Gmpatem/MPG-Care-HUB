"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleHospitalUserStatus(formData: FormData) {
  const supabase = await createClient();

  const hospitalUserId = String(formData.get("hospital_user_id") ?? "");
  const hospitalSlug = String(formData.get("hospital_slug") ?? "");
  const nextStatus = String(formData.get("next_status") ?? "");

  if (!hospitalUserId) throw new Error("Missing hospital user id");
  if (!hospitalSlug) throw new Error("Missing hospital slug");
  if (!["active", "inactive"].includes(nextStatus)) {
    throw new Error("Invalid status");
  }

  const { error } = await supabase
    .from("hospital_users")
    .update({
      status: nextStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", hospitalUserId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/h/${hospitalSlug}/staff`);
}

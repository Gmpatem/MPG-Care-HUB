"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function toggleStaffActive(formData: FormData) {
  const hospitalSlug = String(formData.get("hospital_slug") ?? "");
  const staffId = String(formData.get("staff_id") ?? "");
  const nextActive = String(formData.get("next_active") ?? "") === "true";

  if (!hospitalSlug || !staffId) {
    throw new Error("Missing staff toggle parameters.");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in.");
  }

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug")
    .eq("slug", hospitalSlug)
    .maybeSingle<{ id: string; slug: string }>();

  if (hospitalError) throw new Error(hospitalError.message);
  if (!hospital) throw new Error("Hospital not found.");

  const { data: membership, error: membershipError } = await supabase
    .from("hospital_users")
    .select("id, status")
    .eq("hospital_id", hospital.id)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (membershipError) throw new Error(membershipError.message);
  if (!membership) throw new Error("You do not have access to this hospital.");

  const { error: updateError } = await supabase
    .from("staff")
    .update({
      active: nextActive,
      updated_at: new Date().toISOString(),
    })
    .eq("hospital_id", hospital.id)
    .eq("id", staffId);

  if (updateError) throw new Error(updateError.message);

  revalidatePath(`/h/${hospital.slug}/staff`);
}
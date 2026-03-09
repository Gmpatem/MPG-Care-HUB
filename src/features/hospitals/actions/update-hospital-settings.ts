"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function updateHospitalSettings(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const hospitalId = String(formData.get("hospital_id") ?? "");
  const hospitalSlug = String(formData.get("hospital_slug") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const address_text = String(formData.get("address_text") ?? "").trim();
  const timezone = String(formData.get("timezone") ?? "").trim();
  const currency_code = String(formData.get("currency_code") ?? "").trim().toUpperCase();

  if (!hospitalId) throw new Error("Missing hospital id");
  if (!hospitalSlug) throw new Error("Missing hospital slug");
  if (!name) throw new Error("Hospital name is required");
  if (!timezone) throw new Error("Timezone is required");
  if (!currency_code) throw new Error("Currency code is required");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, is_platform_owner")
    .eq("id", user.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(profileError.message);
  }

  const isPlatformOwner = !!profile?.is_platform_owner;

  const { data: membership, error: membershipError } = await supabase
    .from("hospital_users")
    .select("id, role, status")
    .eq("hospital_id", hospitalId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  const canManage =
    isPlatformOwner ||
    (!!membership && membership.status === "active" && membership.role === "hospital_admin");

  if (!canManage) {
    throw new Error("Only hospital admins or platform owners can update hospital settings");
  }

  const { error } = await supabase
    .from("hospitals")
    .update({
      name,
      phone: phone || null,
      email: email || null,
      address_text: address_text || null,
      timezone,
      currency_code,
      updated_at: new Date().toISOString(),
    })
    .eq("id", hospitalId);

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/h/${hospitalSlug}`);
  revalidatePath(`/h/${hospitalSlug}/settings`);
}

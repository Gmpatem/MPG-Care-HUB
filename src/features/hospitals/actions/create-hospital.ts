"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createHospitalSchema } from "@/features/hospitals/schemas/hospital.schema";

export async function createHospital(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const values = {
    name: String(formData.get("name") ?? ""),
    slug: String(formData.get("slug") ?? ""),
    type: String(formData.get("type") ?? "clinic"),
    country_code: String(formData.get("country_code") ?? "CM"),
    timezone: String(formData.get("timezone") ?? "Africa/Douala"),
    currency_code: String(formData.get("currency_code") ?? "XAF"),
    phone: String(formData.get("phone") ?? ""),
    email: String(formData.get("email") ?? ""),
    address_text: String(formData.get("address_text") ?? ""),
  };

  const parsed = createHospitalSchema.safeParse(values);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid hospital data");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_platform_owner")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_platform_owner) {
    throw new Error("Only platform owners can create hospitals");
  }

  const { data, error } = await supabase
    .from("hospitals")
    .insert({
      name: parsed.data.name,
      slug: parsed.data.slug,
      type: parsed.data.type,
      country_code: parsed.data.country_code,
      timezone: parsed.data.timezone,
      currency_code: parsed.data.currency_code,
      phone: parsed.data.phone || null,
      email: parsed.data.email || null,
      address_text: parsed.data.address_text || null,
      created_by_user_id: user.id,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/platform");
  revalidatePath("/platform/hospitals");

  redirect("/platform/hospitals");
}


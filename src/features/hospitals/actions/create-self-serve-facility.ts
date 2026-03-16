"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function createSelfServeFacility(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/onboarding/create-facility");
  }

  const facilityName = String(formData.get("name") ?? "").trim();
  const facilityType = String(formData.get("type") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const addressText = String(formData.get("address_text") ?? "").trim();
  const timezone = String(formData.get("timezone") ?? "").trim() || "Africa/Douala";
  const currencyCode =
    String(formData.get("currency_code") ?? "").trim().toUpperCase() || "XAF";

  if (!facilityName) {
    throw new Error("Facility name is required.");
  }

  if (!facilityType) {
    throw new Error("Facility type is required.");
  }

  const { data, error } = await supabase.rpc("create_self_serve_hospital", {
    p_name: facilityName,
    p_type: facilityType,
    p_phone: phone || null,
    p_email: email || null,
    p_address_text: addressText || null,
    p_timezone: timezone,
    p_currency_code: currencyCode,
  });

  if (error) {
    throw new Error(error.message);
  }

  const row = Array.isArray(data) ? data[0] : data;

  if (!row?.hospital_slug) {
    throw new Error("Hospital creation failed.");
  }

  redirect(`/h/${row.hospital_slug}`);
}

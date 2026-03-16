"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SaveLabOrderItemResultState = {
  success?: boolean;
  message?: string;
};

async function getScopedHospital(slug: string) {
  const supabase = await createClient();

  const { data: hospital, error } = await supabase
    .from("hospitals")
    .select("id, slug")
    .eq("slug", slug)
    .maybeSingle<{ id: string; slug: string }>();

  if (error) throw new Error(error.message);
  if (!hospital) throw new Error("Hospital not found");

  return { supabase, hospital };
}

export async function saveLabOrderItemResult(
  hospitalSlug: string,
  labOrderId: string,
  itemId: string,
  _prevState: SaveLabOrderItemResultState,
  formData: FormData,
): Promise<SaveLabOrderItemResultState> {
  try {
    const { supabase, hospital } = await getScopedHospital(hospitalSlug);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "You must be signed in." };
    }

    const { data: membership, error: membershipError } = await supabase
      .from("hospital_users")
      .select("id, status")
      .eq("hospital_id", hospital.id)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    if (membershipError) {
      return { success: false, message: membershipError.message };
    }

    if (!membership) {
      return { success: false, message: "You do not have access to this hospital." };
    }

    const { data: staffRecord } = await supabase
      .from("staff")
      .select("id")
      .eq("hospital_id", hospital.id)
      .eq("hospital_user_id", membership.id)
      .maybeSingle<{ id: string }>();

    const resultText = String(formData.get("result_text") ?? "").trim();
    const unit = String(formData.get("unit") ?? "").trim();
    const referenceRange = String(formData.get("reference_range") ?? "").trim();
    const notes = String(formData.get("notes") ?? "").trim();

    const hasResult = Boolean(resultText);

    const payload = {
      result_text: resultText || null,
      unit: unit || null,
      reference_range: referenceRange || null,
      notes: notes || null,
      entered_at: hasResult ? new Date().toISOString() : null,
      entered_by_staff_id: hasResult ? (staffRecord?.id ?? null) : null,
      updated_at: new Date().toISOString(),
    };

    const { error: updateError } = await supabase
      .from("lab_order_items")
      .update(payload)
      .eq("hospital_id", hospital.id)
      .eq("lab_order_id", labOrderId)
      .eq("id", itemId);

    if (updateError) {
      return { success: false, message: updateError.message };
    }

    revalidatePath(`/h/${hospital.slug}/lab/orders`);
    revalidatePath(`/h/${hospital.slug}/lab/orders/${labOrderId}`);

    return {
      success: true,
      message: "Result saved.",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to save lab result.",
    };
  }
}
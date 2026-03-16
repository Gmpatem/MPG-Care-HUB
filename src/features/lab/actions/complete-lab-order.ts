"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CompleteLabOrderState = {
  success?: boolean;
  message?: string;
};

type HospitalRow = {
  id: string;
  slug: string;
};

type MembershipRow = {
  id: string;
  status: string;
};

type LabOrderItemRow = {
  id: string;
  entered_at: string | null;
  result_text: string | null;
};

type LabOrderScopeRow = {
  id: string;
  encounter_id: string | null;
};

async function getScopedHospital(slug: string) {
  const supabase = await createClient();

  const { data: hospital, error } = await supabase
    .from("hospitals")
    .select("id, slug")
    .eq("slug", slug)
    .maybeSingle<HospitalRow>();

  if (error) throw new Error(error.message);
  if (!hospital) throw new Error("Hospital not found");

  return { supabase, hospital };
}

export async function completeLabOrder(
  hospitalSlug: string,
  labOrderId: string
): Promise<CompleteLabOrderState> {
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
      .maybeSingle<MembershipRow>();

    if (membershipError) {
      return { success: false, message: membershipError.message };
    }

    if (!membership) {
      return {
        success: false,
        message: "You do not have access to this hospital.",
      };
    }

    const { data: order, error: orderError } = await supabase
      .from("lab_orders")
      .select("id, encounter_id")
      .eq("hospital_id", hospital.id)
      .eq("id", labOrderId)
      .maybeSingle<LabOrderScopeRow>();

    if (orderError) {
      return { success: false, message: orderError.message };
    }

    if (!order) {
      return { success: false, message: "Lab order not found." };
    }

    const { data: items, error: itemsError } = await supabase
      .from("lab_order_items")
      .select("id, entered_at, result_text")
      .eq("hospital_id", hospital.id)
      .eq("lab_order_id", labOrderId)
      .returns<LabOrderItemRow[]>();

    if (itemsError) {
      return { success: false, message: itemsError.message };
    }

    const totalItems = items?.length ?? 0;
    const enteredItems =
      items?.filter((item) => item.entered_at || item.result_text).length ?? 0;

    if (totalItems === 0) {
      return { success: false, message: "This lab order has no items." };
    }

    if (enteredItems < totalItems) {
      return {
        success: false,
        message:
          "Enter results for all test items before marking the order completed.",
      };
    }

    const now = new Date().toISOString();

    const { error: updateError } = await supabase
      .from("lab_orders")
      .update({
        status: "completed",
        completed_at: now,
        updated_at: now,
      })
      .eq("hospital_id", hospital.id)
      .eq("id", labOrderId);

    if (updateError) {
      return { success: false, message: updateError.message };
    }

    if (order.encounter_id) {
      const { error: encounterUpdateError } = await supabase
        .from("encounters")
        .update({
          stage: "results_review",
          results_reviewed_at: now,
          updated_at: now,
        })
        .eq("hospital_id", hospital.id)
        .eq("id", order.encounter_id);

      if (encounterUpdateError) {
        return {
          success: false,
          message: `Lab order completed, but encounter stage update failed: ${encounterUpdateError.message}`,
        };
      }
    }

    revalidatePath(`/h/${hospital.slug}/lab`);
    revalidatePath(`/h/${hospital.slug}/lab/orders`);
    revalidatePath(`/h/${hospital.slug}/lab/orders/${labOrderId}`);
    revalidatePath(`/h/${hospital.slug}/doctor`);
    revalidatePath(`/h/${hospital.slug}/encounters`);

    if (order.encounter_id) {
      revalidatePath(`/h/${hospital.slug}/encounters/${order.encounter_id}`);
    }

    return {
      success: true,
      message: "Lab order marked completed.",
    };
  } catch (error) {
    return {
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Failed to complete lab order.",
    };
  }
}

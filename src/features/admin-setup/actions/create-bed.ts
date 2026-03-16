"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CreateBedState = {
  success?: boolean;
  error?: string;
};

export async function createBed(
  hospitalSlug: string,
  _prevState: CreateBedState,
  formData: FormData
): Promise<CreateBedState> {
  const supabase = await createClient();

  const wardId = String(formData.get("ward_id") ?? "").trim();
  const bedNumber = String(formData.get("bed_number") ?? "").trim();
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const active = formData.get("active") === "on";

  if (!wardId) return { error: "Ward is required." };
  if (!bedNumber) return { error: "Bed number is required." };

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug")
    .eq("slug", hospitalSlug)
    .maybeSingle<{ id: string; slug: string }>();

  if (hospitalError) return { error: hospitalError.message };
  if (!hospital) return { error: "Hospital not found." };

  const { data: ward, error: wardError } = await supabase
    .from("wards")
    .select("id")
    .eq("hospital_id", hospital.id)
    .eq("id", wardId)
    .maybeSingle();

  if (wardError) return { error: wardError.message };
  if (!ward) return { error: "Selected ward was not found." };

  const { error: insertError } = await supabase
    .from("beds")
    .insert({
      hospital_id: hospital.id,
      ward_id: wardId,
      bed_number: bedNumber,
      status: "available",
      notes,
      active,
    });

  if (insertError) return { error: insertError.message };

  revalidatePath(`/h/${hospital.slug}/admin/beds`);
  revalidatePath(`/h/${hospital.slug}/ward`);
  revalidatePath(`/h/${hospital.slug}/ward/bed-board`);

  return { success: true };
}
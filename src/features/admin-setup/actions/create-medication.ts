"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CreateMedicationState = {
  success?: boolean;
  error?: string;
};

export async function createMedication(
  hospitalSlug: string,
  _prevState: CreateMedicationState,
  formData: FormData
): Promise<CreateMedicationState> {
  const supabase = await createClient();

  const code = String(formData.get("code") ?? "").trim() || null;
  const genericName = String(formData.get("generic_name") ?? "").trim();
  const brandName = String(formData.get("brand_name") ?? "").trim() || null;
  const form = String(formData.get("form") ?? "").trim();
  const strength = String(formData.get("strength") ?? "").trim() || null;
  const unit = String(formData.get("unit") ?? "").trim() || null;
  const route = String(formData.get("route") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const reorderLevelRaw = String(formData.get("reorder_level") ?? "").trim();
  const active = formData.get("active") === "on";

  if (!genericName) return { error: "Generic name is required." };
  if (!form) return { error: "Medication form is required." };

  let reorderLevel: number | null = null;
  if (reorderLevelRaw) {
    const parsed = Number.parseFloat(reorderLevelRaw);
    if (Number.isNaN(parsed) || parsed < 0) {
      return { error: "Reorder level must be zero or greater." };
    }
    reorderLevel = parsed;
  }

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug")
    .eq("slug", hospitalSlug)
    .maybeSingle<{ id: string; slug: string }>();

  if (hospitalError) return { error: hospitalError.message };
  if (!hospital) return { error: "Hospital not found." };

  const { error: insertError } = await supabase
    .from("medications")
    .insert({
      hospital_id: hospital.id,
      code,
      generic_name: genericName,
      brand_name: brandName,
      form,
      strength,
      unit,
      route,
      description,
      reorder_level: reorderLevel,
      active,
    });

  if (insertError) return { error: insertError.message };

  revalidatePath(`/h/${hospital.slug}/admin/medications`);
  revalidatePath(`/h/${hospital.slug}/admin/pharmacy-stock`);
  revalidatePath(`/h/${hospital.slug}/pharmacy`);

  return { success: true };
}
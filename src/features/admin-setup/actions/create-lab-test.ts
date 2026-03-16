"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CreateLabTestState = {
  success?: boolean;
  error?: string;
};

export async function createLabTest(
  hospitalSlug: string,
  _prevState: CreateLabTestState,
  formData: FormData
): Promise<CreateLabTestState> {
  const supabase = await createClient();

  const code = String(formData.get("code") ?? "").trim() || null;
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const departmentId = String(formData.get("department_id") ?? "").trim() || null;
  const priceRaw = String(formData.get("price") ?? "0").trim();
  const active = formData.get("active") === "on";

  if (!name) return { error: "Lab test name is required." };

  const price = Number.parseFloat(priceRaw);
  if (Number.isNaN(price) || price < 0) {
    return { error: "Price must be zero or greater." };
  }

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug")
    .eq("slug", hospitalSlug)
    .maybeSingle<{ id: string; slug: string }>();

  if (hospitalError) return { error: hospitalError.message };
  if (!hospital) return { error: "Hospital not found." };

  if (departmentId) {
    const { data: department, error: departmentError } = await supabase
      .from("departments")
      .select("id")
      .eq("hospital_id", hospital.id)
      .eq("id", departmentId)
      .maybeSingle();

    if (departmentError) return { error: departmentError.message };
    if (!department) return { error: "Selected department was not found." };
  }

  const { error: insertError } = await supabase
    .from("lab_test_catalog")
    .insert({
      hospital_id: hospital.id,
      department_id: departmentId,
      code,
      name,
      description,
      price,
      active,
    });

  if (insertError) return { error: insertError.message };

  revalidatePath(`/h/${hospital.slug}/admin/lab-tests`);
  revalidatePath(`/h/${hospital.slug}/lab`);
  revalidatePath(`/h/${hospital.slug}/lab/tests`);

  return { success: true };
}
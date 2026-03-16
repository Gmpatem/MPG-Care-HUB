"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CreateWardState = {
  success?: boolean;
  error?: string;
};

export async function createWard(
  hospitalSlug: string,
  _prevState: CreateWardState,
  formData: FormData
): Promise<CreateWardState> {
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim() || null;
  const wardType = String(formData.get("ward_type") ?? "").trim();
  const departmentId = String(formData.get("department_id") ?? "").trim() || null;
  const admissionFeeRaw = String(formData.get("admission_fee") ?? "0").trim();
  const active = formData.get("active") === "on";

  if (!name) return { error: "Ward name is required." };
  if (!wardType) return { error: "Ward type is required." };

  const admissionFee = Number.parseFloat(admissionFeeRaw);
  if (Number.isNaN(admissionFee) || admissionFee < 0) {
    return { error: "Admission fee must be zero or greater." };
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
    .from("wards")
    .insert({
      hospital_id: hospital.id,
      department_id: departmentId,
      code,
      name,
      ward_type: wardType,
      active,
      admission_fee: admissionFee,
    });

  if (insertError) return { error: insertError.message };

  revalidatePath(`/h/${hospital.slug}/admin/wards`);
  revalidatePath(`/h/${hospital.slug}/admin/beds`);
  revalidatePath(`/h/${hospital.slug}/ward`);
  revalidatePath(`/h/${hospital.slug}/ward/config`);

  return { success: true };
}

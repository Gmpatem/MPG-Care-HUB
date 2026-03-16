"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CreateDepartmentState = {
  success?: boolean;
  error?: string;
};

export async function createDepartment(
  hospitalSlug: string,
  _prevState: CreateDepartmentState,
  formData: FormData
): Promise<CreateDepartmentState> {
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const departmentType = String(formData.get("department_type") ?? "").trim();
  const sortOrderRaw = String(formData.get("sort_order") ?? "0").trim();
  const active = formData.get("active") === "on";

  if (!name) return { error: "Department name is required." };
  if (!departmentType) return { error: "Department type is required." };

  const sortOrder = Number.parseInt(sortOrderRaw, 10);
  if (Number.isNaN(sortOrder)) return { error: "Sort order must be a valid number." };

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug")
    .eq("slug", hospitalSlug)
    .maybeSingle<{ id: string; slug: string }>();

  if (hospitalError) return { error: hospitalError.message };
  if (!hospital) return { error: "Hospital not found." };

  const { error: insertError } = await supabase
    .from("departments")
    .insert({
      hospital_id: hospital.id,
      code,
      name,
      department_type: departmentType,
      description,
      active,
      sort_order: sortOrder,
    });

  if (insertError) return { error: insertError.message };

  revalidatePath(`/h/${hospital.slug}/admin/departments`);
  revalidatePath(`/h/${hospital.slug}/admin/wards`);
  revalidatePath(`/h/${hospital.slug}/staff`);

  return { success: true };
}
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type UpdateDepartmentState = {
  success?: boolean;
  error?: string;
};

export async function updateDepartment(
  hospitalSlug: string,
  _prevState: UpdateDepartmentState,
  formData: FormData
): Promise<UpdateDepartmentState> {
  const supabase = await createClient();

  const departmentId = String(formData.get("department_id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const code = String(formData.get("code") ?? "").trim() || null;
  const description = String(formData.get("description") ?? "").trim() || null;
  const departmentType = String(formData.get("department_type") ?? "").trim();
  const sortOrderRaw = String(formData.get("sort_order") ?? "0").trim();
  const active = formData.get("active") === "on";

  if (!departmentId) return { error: "Department ID is required." };
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

  // Verify the department belongs to this hospital
  const { data: existingDept, error: checkError } = await supabase
    .from("departments")
    .select("id")
    .eq("id", departmentId)
    .eq("hospital_id", hospital.id)
    .maybeSingle();

  if (checkError) return { error: checkError.message };
  if (!existingDept) return { error: "Department not found." };

  const { error: updateError } = await supabase
    .from("departments")
    .update({
      code,
      name,
      department_type: departmentType,
      description,
      active,
      sort_order: sortOrder,
    })
    .eq("id", departmentId);

  if (updateError) return { error: updateError.message };

  revalidatePath(`/h/${hospital.slug}/admin/departments`);
  revalidatePath(`/h/${hospital.slug}/admin/wards`);
  revalidatePath(`/h/${hospital.slug}/staff`);

  return { success: true };
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createLabTestSchema } from "@/features/lab/schemas/lab-test.schema";

export type CreateLabTestState = {
  success?: boolean;
  message?: string;
  errors?: Partial<Record<"code" | "name" | "description" | "price", string>>;
};

async function getHospitalBySlug(slug: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("hospitals")
    .select("id, slug, name")
    .eq("slug", slug)
    .maybeSingle<{ id: string; slug: string; name: string }>();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Hospital not found");

  return { supabase, hospital: data };
}

export async function createLabTest(
  hospitalSlug: string,
  _prevState: CreateLabTestState,
  formData: FormData,
): Promise<CreateLabTestState> {
  try {
    const { supabase, hospital } = await getHospitalBySlug(hospitalSlug);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "You must be signed in." };
    }

    const { data: membership, error: membershipError } = await supabase
      .from("hospital_users")
      .select("id, role, status")
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

    const rawInput = {
      hospital_id: hospital.id,
      department_id: String(formData.get("department_id") ?? "").trim(),
      code: String(formData.get("code") ?? "").trim(),
      name: String(formData.get("name") ?? "").trim(),
      description: String(formData.get("description") ?? "").trim(),
      price: Number(formData.get("price") ?? 0),
      active: formData.get("active") === "on",
    };

    const parsed = createLabTestSchema.safeParse(rawInput);

    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      return {
        success: false,
        message: "Please correct the form and try again.",
        errors: {
          code: fieldErrors.code?.[0],
          name: fieldErrors.name?.[0],
          description: fieldErrors.description?.[0],
          price: fieldErrors.price?.[0],
        },
      };
    }

    const { error } = await supabase.from("lab_test_catalog").insert({
      hospital_id: hospital.id,
      department_id: parsed.data.department_id || null,
      code: parsed.data.code || null,
      name: parsed.data.name,
      description: parsed.data.description || null,
      price: parsed.data.price,
      active: parsed.data.active,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      return { success: false, message: error.message };
    }

    revalidatePath(`/h/${hospital.slug}/lab`);
    revalidatePath(`/h/${hospital.slug}/lab/tests`);
    revalidatePath(`/h/${hospital.slug}/lab/tests/new`);

    return {
      success: true,
      message: "Lab test created successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to create lab test.",
    };
  }
}
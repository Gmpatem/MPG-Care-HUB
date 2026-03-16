"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { STAFF_TYPE_OPTIONS } from "@/features/staff/constants";

type ActionState = {
  error?: string;
};

async function getHospitalAndAccess(hospitalSlug: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in.");
  }

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug, name")
    .eq("slug", hospitalSlug)
    .maybeSingle<{ id: string; slug: string; name: string }>();

  if (hospitalError) throw new Error(hospitalError.message);
  if (!hospital) throw new Error("Hospital not found.");

  const { data: membership, error: membershipError } = await supabase
    .from("hospital_users")
    .select("id, role, status")
    .eq("hospital_id", hospital.id)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle<{ id: string; role: string; status: string }>();

  if (membershipError) throw new Error(membershipError.message);
  if (!membership) throw new Error("You do not have access to this hospital.");

  return { supabase, hospital };
}

export async function updateStaff(
  hospitalSlug: string,
  staffId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  try {
    const { supabase, hospital } = await getHospitalAndAccess(hospitalSlug);

    const full_name = String(formData.get("full_name") ?? "").trim();
    const staff_code = String(formData.get("staff_code") ?? "").trim() || null;
    const hospital_user_id = String(formData.get("hospital_user_id") ?? "").trim() || null;
    const department_id = String(formData.get("department_id") ?? "").trim() || null;
    const job_title = String(formData.get("job_title") ?? "").trim() || null;
    const license_number = String(formData.get("license_number") ?? "").trim() || null;
    const staff_type = String(formData.get("staff_type") ?? "general").trim() || "general";
    const specialty = String(formData.get("specialty") ?? "").trim() || null;
    const phone = String(formData.get("phone") ?? "").trim() || null;
    const email = String(formData.get("email") ?? "").trim() || null;
    const date_of_birth = String(formData.get("date_of_birth") ?? "").trim() || null;
    const address_text = String(formData.get("address_text") ?? "").trim() || null;
    const emergency_contact_name = String(formData.get("emergency_contact_name") ?? "").trim() || null;
    const emergency_contact_phone = String(formData.get("emergency_contact_phone") ?? "").trim() || null;
    const notes = String(formData.get("notes") ?? "").trim() || null;
    const active = formData.get("active") === "on";

    if (!full_name) {
      return { error: "Full name is required." };
    }

    if (!STAFF_TYPE_OPTIONS.includes(staff_type as any)) {
      return { error: "Invalid staff type selected." };
    }

    let departmentName: string | null = null;

    if (department_id) {
      const { data: department, error: departmentError } = await supabase
        .from("departments")
        .select("id, name")
        .eq("hospital_id", hospital.id)
        .eq("id", department_id)
        .maybeSingle<{ id: string; name: string }>();

      if (departmentError) {
        return { error: departmentError.message };
      }

      if (!department) {
        return { error: "Selected department was not found." };
      }

      departmentName = department.name;
    }

    if (hospital_user_id) {
      const { data: hospitalUser, error: userError } = await supabase
        .from("hospital_users")
        .select("id")
        .eq("hospital_id", hospital.id)
        .eq("id", hospital_user_id)
        .maybeSingle<{ id: string }>();

      if (userError) {
        return { error: userError.message };
      }

      if (!hospitalUser) {
        return { error: "Selected hospital user was not found." };
      }
    }

    const { error: updateError } = await supabase
      .from("staff")
      .update({
        hospital_user_id,
        staff_code,
        full_name,
        department: departmentName,
        department_id,
        job_title,
        license_number,
        active,
        staff_type,
        specialty,
        phone,
        email,
        date_of_birth,
        address_text,
        emergency_contact_name,
        emergency_contact_phone,
        notes,
        updated_at: new Date().toISOString(),
      })
      .eq("hospital_id", hospital.id)
      .eq("id", staffId);

    if (updateError) {
      return { error: updateError.message };
    }

    revalidatePath(`/h/${hospital.slug}/staff`);
    revalidatePath(`/h/${hospital.slug}/staff/${staffId}`);

    redirect(`/h/${hospital.slug}/staff`);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Failed to update staff record.",
    };
  }
}
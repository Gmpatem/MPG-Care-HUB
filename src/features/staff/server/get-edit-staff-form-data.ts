import { createClient } from "@/lib/supabase/server";
import { getStaffFormData } from "@/features/staff/server/get-staff-form-data";

export async function getEditStaffFormData(hospitalSlug: string, staffId: string) {
  const supabase = await createClient();
  const base = await getStaffFormData(hospitalSlug);

  const { data: record, error } = await supabase
    .from("staff")
    .select(`
      id,
      hospital_user_id,
      staff_code,
      full_name,
      department,
      job_title,
      license_number,
      active,
      department_id,
      staff_type,
      specialty,
      phone,
      email,
      date_of_birth,
      address_text,
      emergency_contact_name,
      emergency_contact_phone,
      notes
    `)
    .eq("hospital_id", base.hospital.id)
    .eq("id", staffId)
    .maybeSingle();

  if (error) throw new Error(error.message);
  if (!record) throw new Error("Staff record not found.");

  return {
    ...base,
    staff: record,
  };
}
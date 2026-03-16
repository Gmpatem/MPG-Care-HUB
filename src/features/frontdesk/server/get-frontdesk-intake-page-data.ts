import { createClient } from "@/lib/supabase/server";

type HospitalRow = {
  id: string;
  name: string;
  slug: string;
};

type StaffRow = {
  id: string;
  full_name: string;
  job_title: string | null;
  staff_type: string | null;
  active: boolean;
};

export async function getFrontdeskIntakePageData(hospitalSlug: string) {
  const supabase = await createClient();

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, name, slug")
    .eq("slug", hospitalSlug)
    .maybeSingle<HospitalRow>();

  if (hospitalError) {
    throw new Error(hospitalError.message);
  }

  if (!hospital) {
    return {
      hospital: null,
      staff: [] as StaffRow[],
    };
  }

  const { data: staff, error: staffError } = await supabase
    .from("staff")
    .select("id, full_name, job_title, staff_type, active")
    .eq("hospital_id", hospital.id)
    .eq("active", true)
    .order("full_name", { ascending: true })
    .returns<StaffRow[]>();

  if (staffError) {
    throw new Error(staffError.message);
  }

  return {
    hospital,
    staff: staff ?? [],
  };
}

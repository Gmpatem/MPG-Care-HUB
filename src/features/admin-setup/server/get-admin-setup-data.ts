import { createClient } from "@/lib/supabase/server";

export async function getAdminSetupData(hospitalSlug: string) {
  const supabase = await createClient();

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug, name")
    .eq("slug", hospitalSlug)
    .maybeSingle<{ id: string; slug: string; name: string }>();

  if (hospitalError) throw new Error(hospitalError.message);
  if (!hospital) throw new Error("Hospital not found.");

  const [
    departmentsRes,
    wardsRes,
    bedsRes,
  ] = await Promise.all([
    supabase
      .from("departments")
      .select("id, code, name, department_type, description, active, sort_order")
      .eq("hospital_id", hospital.id)
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),

    supabase
      .from("wards")
      .select("id, department_id, code, name, ward_type, active, admission_fee")
      .eq("hospital_id", hospital.id)
      .order("name", { ascending: true }),

    supabase
      .from("beds")
      .select("id, ward_id, bed_number, status, notes, active")
      .eq("hospital_id", hospital.id)
      .order("bed_number", { ascending: true }),
  ]);

  if (departmentsRes.error) throw new Error(departmentsRes.error.message);
  if (wardsRes.error) throw new Error(wardsRes.error.message);
  if (bedsRes.error) throw new Error(bedsRes.error.message);

  return {
    hospital,
    departments: departmentsRes.data ?? [],
    wards: wardsRes.data ?? [],
    beds: bedsRes.data ?? [],
  };
}
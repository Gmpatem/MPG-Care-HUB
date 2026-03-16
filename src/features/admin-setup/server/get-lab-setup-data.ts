import { createClient } from "@/lib/supabase/server";

type DepartmentRow = {
  id: string;
  name: string;
};

type LabTestRow = {
  id: string;
  department_id: string | null;
  code: string | null;
  name: string;
  description: string | null;
  price: number;
  active: boolean;
};

export async function getLabSetupData(hospitalSlug: string) {
  const supabase = await createClient();

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug, name")
    .eq("slug", hospitalSlug)
    .maybeSingle<{ id: string; slug: string; name: string }>();

  if (hospitalError) throw new Error(hospitalError.message);
  if (!hospital) throw new Error("Hospital not found.");

  const [departmentsRes, labTestsRes] = await Promise.all([
    supabase
      .from("departments")
      .select("id, name")
      .eq("hospital_id", hospital.id)
      .order("name", { ascending: true })
      .returns<DepartmentRow[]>(),

    supabase
      .from("lab_test_catalog")
      .select("id, department_id, code, name, description, price, active")
      .eq("hospital_id", hospital.id)
      .order("name", { ascending: true })
      .returns<LabTestRow[]>(),
  ]);

  if (departmentsRes.error) throw new Error(departmentsRes.error.message);
  if (labTestsRes.error) throw new Error(labTestsRes.error.message);

  return {
    hospital,
    departments: departmentsRes.data ?? [],
    labTests: labTestsRes.data ?? [],
  };
}
import { createClient } from "@/lib/supabase/server";

type HospitalRow = {
  id: string;
  slug: string;
};

type LabTestRow = {
  id: string;
  name: string;
  code: string | null;
};

export async function getLabOrderFormData(hospitalSlug: string) {
  const supabase = await createClient();

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug")
    .eq("slug", hospitalSlug)
    .maybeSingle<HospitalRow>();

  if (hospitalError) {
    throw new Error(hospitalError.message);
  }

  if (!hospital) {
    throw new Error("Hospital not found.");
  }

  const hospitalId = hospital.id;

  const { data: tests, error: testsError } = await supabase
    .from("lab_test_catalog")
    .select("id, name, code")
    .eq("hospital_id", hospitalId)
    .eq("active", true)
    .order("name")
    .returns<LabTestRow[]>();

  if (testsError) {
    throw new Error(testsError.message);
  }

  return {
    hospital,
    tests: tests ?? [],
  };
}

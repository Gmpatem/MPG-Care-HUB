import { createClient } from "@/lib/supabase/server";

type LabTestRow = {
  id: string;
  code: string | null;
  name: string;
  description: string | null;
  price: number | null;
  active: boolean;
  created_at: string;
};

export async function getLabTestsPageData(hospitalSlug: string) {
  const supabase = await createClient();

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug, name")
    .eq("slug", hospitalSlug)
    .maybeSingle<{ id: string; slug: string; name: string }>();

  if (hospitalError) throw new Error(hospitalError.message);
  if (!hospital) throw new Error("Hospital not found");

  const { data: tests, error: testsError } = await supabase
    .from("lab_test_catalog")
    .select("id, code, name, description, price, active, created_at")
    .eq("hospital_id", hospital.id)
    .order("active", { ascending: false })
    .order("name", { ascending: true });

  if (testsError) throw new Error(testsError.message);

  const { data: departments } = await supabase
    .from("departments")
    .select("id, name")
    .eq("hospital_id", hospital.id)
    .order("name", { ascending: true });

  return {
    hospital,
    tests: (tests ?? []) as LabTestRow[],
    departments: (departments ?? []) as Array<{ id: string; name: string }>,
  };
}
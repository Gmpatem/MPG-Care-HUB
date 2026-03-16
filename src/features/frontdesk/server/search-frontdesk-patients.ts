import { createClient } from "@/lib/supabase/server";

type HospitalRow = {
  id: string;
  name: string;
  slug: string;
};

export type FrontdeskPatientRow = {
  id: string;
  hospital_id: string;
  patient_number: string | null;
  first_name: string;
  last_name: string;
  middle_name: string | null;
  sex: string | null;
  date_of_birth: string | null;
  phone: string | null;
  status: string | null;
  created_at: string | null;
};

function normalizeQuery(value: string | undefined) {
  return (value ?? "").trim();
}

export async function searchFrontdeskPatients({
  hospitalSlug,
  query,
}: {
  hospitalSlug: string;
  query?: string;
}) {
  const supabase = await createClient();
  const normalizedQuery = normalizeQuery(query);

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
      patients: [] as FrontdeskPatientRow[],
      query: normalizedQuery,
    };
  }

  let patientsQuery = supabase
    .from("patients")
    .select(
      [
        "id",
        "hospital_id",
        "patient_number",
        "first_name",
        "last_name",
        "middle_name",
        "sex",
        "date_of_birth",
        "phone",
        "status",
        "created_at",
      ].join(", ")
    )
    .eq("hospital_id", hospital.id)
    .order("created_at", { ascending: false })
    .limit(30);

  if (normalizedQuery) {
    const q = normalizedQuery.replace(/[%_]/g, "");
    patientsQuery = patientsQuery.or(
      [
        `patient_number.ilike.%${q}%`,
        `phone.ilike.%${q}%`,
        `first_name.ilike.%${q}%`,
        `last_name.ilike.%${q}%`,
        `middle_name.ilike.%${q}%`,
      ].join(",")
    );
  }

  const { data: patients, error: patientsError } = await patientsQuery.returns<FrontdeskPatientRow[]>();

  if (patientsError) {
    throw new Error(patientsError.message);
  }

  return {
    hospital,
    patients: patients ?? [],
    query: normalizedQuery,
  };
}
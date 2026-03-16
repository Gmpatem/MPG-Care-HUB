import { createClient } from "@/lib/supabase/server";

type HospitalRow = {
  id: string;
  slug: string;
  name: string;
};

type PatientRow = {
  id: string;
  patient_number: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  sex: string | null;
  phone: string | null;
  created_at: string | null;
};

export async function getDoctorPrescriptionPatientPicker(
  hospitalSlug: string,
  search?: string
) {
  const supabase = await createClient();

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug, name")
    .eq("slug", hospitalSlug)
    .maybeSingle<HospitalRow>();

  if (hospitalError) throw new Error(hospitalError.message);
  if (!hospital) throw new Error("Hospital not found");

  let query = supabase
    .from("patients")
    .select("id, patient_number, first_name, middle_name, last_name, sex, phone, created_at")
    .eq("hospital_id", hospital.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const term = (search ?? "").trim();

  if (term.length > 0) {
    const escaped = term.replace(/,/g, "");
    query = query.or(
      [
        `patient_number.ilike.%${escaped}%`,
        `first_name.ilike.%${escaped}%`,
        `middle_name.ilike.%${escaped}%`,
        `last_name.ilike.%${escaped}%`,
        `phone.ilike.%${escaped}%`,
      ].join(",")
    );
  }

  const { data: patients, error: patientsError } = await query;

  if (patientsError) throw new Error(patientsError.message);

  return {
    hospital,
    search: term,
    patients: (patients ?? []) as PatientRow[],
  };
}
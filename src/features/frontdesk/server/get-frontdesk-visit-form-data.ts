import { createClient } from "@/lib/supabase/server";

type HospitalRow = {
  id: string;
  name: string;
  slug: string;
};

type PatientRow = {
  id: string;
  patient_number: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  sex: string | null;
  date_of_birth: string | null;
  phone: string | null;
  status: string | null;
};

type StaffRow = {
  id: string;
  full_name: string;
  job_title: string | null;
  staff_type: string | null;
  active: boolean;
};

export async function getFrontdeskVisitFormData({
  hospitalSlug,
  patientId,
}: {
  hospitalSlug: string;
  patientId?: string;
}) {
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
      patient: null as PatientRow | null,
      staff: [] as StaffRow[],
    };
  }

  let patient: PatientRow | null = null;

  if (patientId) {
    const patientResult = await supabase
      .from("patients")
      .select(
        [
          "id",
          "patient_number",
          "first_name",
          "middle_name",
          "last_name",
          "sex",
          "date_of_birth",
          "phone",
          "status",
        ].join(", ")
      )
      .eq("hospital_id", hospital.id)
      .eq("id", patientId)
      .maybeSingle<PatientRow>();

    if (patientResult.error) {
      throw new Error(patientResult.error.message);
    }

    patient = patientResult.data ?? null;
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
    patient,
    staff: staff ?? [],
  };
}
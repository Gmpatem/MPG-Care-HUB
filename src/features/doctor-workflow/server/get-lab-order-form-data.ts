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
  staff_type: string | null;
  active: boolean;
};

type LabTestRow = {
  id: string;
  code: string | null;
  name: string;
  description: string | null;
  price: number | null;
  active: boolean;
};

type EncounterRow = {
  id: string;
  appointment_id: string | null;
  encounter_datetime: string | null;
  status: string | null;
};

export async function getLabOrderFormData({
  hospitalSlug,
  patientId,
}: {
  hospitalSlug: string;
  patientId: string;
}) {
  const supabase = await createClient();

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, name, slug")
    .eq("slug", hospitalSlug)
    .maybeSingle<HospitalRow>();

  if (hospitalError) throw new Error(hospitalError.message);

  if (!hospital) {
    return {
      hospital: null,
      patient: null as PatientRow | null,
      doctorStaff: [] as StaffRow[],
      labTests: [] as LabTestRow[],
      latestEncounter: null as EncounterRow | null,
    };
  }

  const [patientResult, staffResult, labTestsResult, encounterResult] = await Promise.all([
    supabase
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
      .maybeSingle<PatientRow>(),

    supabase
      .from("staff")
      .select("id, full_name, staff_type, active")
      .eq("hospital_id", hospital.id)
      .eq("active", true)
      .order("full_name", { ascending: true })
      .returns<StaffRow[]>(),

    supabase
      .from("lab_test_catalog")
      .select("id, code, name, description, price, active")
      .eq("hospital_id", hospital.id)
      .eq("active", true)
      .order("name", { ascending: true })
      .returns<LabTestRow[]>(),

    supabase
      .from("encounters")
      .select("id, appointment_id, encounter_datetime, status")
      .eq("hospital_id", hospital.id)
      .eq("patient_id", patientId)
      .order("encounter_datetime", { ascending: false })
      .limit(1)
      .maybeSingle<EncounterRow>(),
  ]);

  if (patientResult.error) throw new Error(patientResult.error.message);
  if (staffResult.error) throw new Error(staffResult.error.message);
  if (labTestsResult.error) throw new Error(labTestsResult.error.message);
  if (encounterResult.error) throw new Error(encounterResult.error.message);

  return {
    hospital,
    patient: patientResult.data ?? null,
    doctorStaff: (staffResult.data ?? []).filter(
      (s) => s.staff_type === "doctor" || s.staff_type === "general" || s.staff_type === null
    ),
    labTests: labTestsResult.data ?? [],
    latestEncounter: encounterResult.data ?? null,
  };
}
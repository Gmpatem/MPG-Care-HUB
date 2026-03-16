import { createClient } from "@/lib/supabase/server";

type HospitalRow = {
  id: string;
  name: string;
  slug: string;
};

type EncounterRequestRow = {
  id: string;
  hospital_id: string;
  patient_id: string;
  appointment_id: string | null;
  provider_staff_id: string | null;
  encounter_datetime: string | null;
  stage: string | null;
  status: string | null;
  chief_complaint: string | null;
  diagnosis_text: string | null;
  final_notes: string | null;
  patients: {
    id: string;
    patient_number: string | null;
    first_name: string;
    last_name: string;
    middle_name: string | null;
  } | null;
  staff: {
    id: string;
    full_name: string;
  } | null;
};

type AdmissionLite = {
  id: string;
  encounter_id: string | null;
};

type WardLite = {
  id: string;
  name: string;
  ward_type: string | null;
};

type BedLite = {
  id: string;
  ward_id: string | null;
  bed_number: string | null;
};

export async function getWardAdmissionIntake(hospitalSlug: string) {
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
      requests: [] as EncounterRequestRow[],
      wards: [] as WardLite[],
      beds: [] as BedLite[],
    };
  }

  const [requestsResult, admissionsResult, wardsResult, bedsResult] = await Promise.all([
    supabase
      .from("encounters")
      .select(`
        id,
        hospital_id,
        patient_id,
        appointment_id,
        provider_staff_id,
        encounter_datetime,
        stage,
        status,
        chief_complaint,
        diagnosis_text,
        final_notes,
        patients (
          id,
          patient_number,
          first_name,
          last_name,
          middle_name
        ),
        staff:provider_staff_id (
          id,
          full_name
        )
      `)
      .eq("hospital_id", hospital.id)
      .eq("stage", "admission_requested")
      .order("encounter_datetime", { ascending: false })
      .returns<EncounterRequestRow[]>(),

    supabase
      .from("admissions")
      .select("id, encounter_id")
      .eq("hospital_id", hospital.id)
      .returns<AdmissionLite[]>(),

    supabase
      .from("wards")
      .select("id, name, ward_type")
      .eq("hospital_id", hospital.id)
      .returns<WardLite[]>(),

    supabase
      .from("beds")
      .select("id, ward_id, bed_number")
      .eq("hospital_id", hospital.id)
      .returns<BedLite[]>(),
  ]);

  if (requestsResult.error) throw new Error(requestsResult.error.message);
  if (admissionsResult.error) throw new Error(admissionsResult.error.message);
  if (wardsResult.error) throw new Error(wardsResult.error.message);
  if (bedsResult.error) throw new Error(bedsResult.error.message);

  const existingEncounterIds = new Set(
    (admissionsResult.data ?? [])
      .map((a) => a.encounter_id)
      .filter((v): v is string => Boolean(v))
  );

  const requests = (requestsResult.data ?? []).filter(
    (row) => !existingEncounterIds.has(row.id)
  );

  return {
    hospital,
    requests,
    wards: wardsResult.data ?? [],
    beds: bedsResult.data ?? [],
  };
}
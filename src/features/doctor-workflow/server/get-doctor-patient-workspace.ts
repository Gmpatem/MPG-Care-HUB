import { createClient } from "@/lib/supabase/server";

type HospitalRow = {
  id: string;
  name: string;
  slug: string;
};

type PatientRow = {
  id: string;
  hospital_id: string;
  patient_number: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  sex: string | null;
  date_of_birth: string | null;
  phone: string | null;
  email: string | null;
  address_text: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  status: string | null;
};

type LatestVitalsRow = {
  hospital_id: string;
  patient_id: string;
  patient_vitals_id: string;
  appointment_id: string | null;
  encounter_id: string | null;
  admission_id: string | null;
  source_type: string | null;
  recorded_at: string;
  height_cm: number | null;
  weight_kg: number | null;
  temperature_c: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  pulse_bpm: number | null;
  respiratory_rate: number | null;
  spo2: number | null;
  pain_score: number | null;
  notes: string | null;
};

type VitalsTimelineRow = {
  id: string;
  hospital_id: string;
  patient_id: string;
  appointment_id: string | null;
  encounter_id: string | null;
  admission_id: string | null;
  source_type: string | null;
  recorded_at: string;
  height_cm: number | null;
  weight_kg: number | null;
  temperature_c: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  pulse_bpm: number | null;
  respiratory_rate: number | null;
  spo2: number | null;
  pain_score: number | null;
  notes: string | null;
};

type EncounterRow = {
  id: string;
  hospital_id: string;
  patient_id: string;
  appointment_id: string | null;
  encounter_datetime: string | null;
  status: string | null;
  chief_complaint: string | null;
  diagnosis_text: string | null;
  admission_requested: boolean | null;
};

export async function getDoctorPatientWorkspace({
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

  if (hospitalError) {
    throw new Error(hospitalError.message);
  }

  if (!hospital) {
    return {
      hospital: null,
      patient: null as PatientRow | null,
      latestVitals: null as LatestVitalsRow | null,
      vitalsTimeline: [] as VitalsTimelineRow[],
      recentEncounters: [] as EncounterRow[],
    };
  }

  const [patientResult, latestVitalsResult, timelineResult, encountersResult] = await Promise.all([
    supabase
      .from("patients")
      .select(
        [
          "id",
          "hospital_id",
          "patient_number",
          "first_name",
          "middle_name",
          "last_name",
          "sex",
          "date_of_birth",
          "phone",
          "email",
          "address_text",
          "emergency_contact_name",
          "emergency_contact_phone",
          "status",
        ].join(", ")
      )
      .eq("hospital_id", hospital.id)
      .eq("id", patientId)
      .maybeSingle<PatientRow>(),

    supabase
      .from("latest_patient_vitals_v")
      .select("*")
      .eq("hospital_id", hospital.id)
      .eq("patient_id", patientId)
      .maybeSingle<LatestVitalsRow>(),

    supabase
      .from("patient_vitals")
      .select(
        [
          "id",
          "hospital_id",
          "patient_id",
          "appointment_id",
          "encounter_id",
          "admission_id",
          "source_type",
          "recorded_at",
          "height_cm",
          "weight_kg",
          "temperature_c",
          "blood_pressure_systolic",
          "blood_pressure_diastolic",
          "pulse_bpm",
          "respiratory_rate",
          "spo2",
          "pain_score",
          "notes",
        ].join(", ")
      )
      .eq("hospital_id", hospital.id)
      .eq("patient_id", patientId)
      .order("recorded_at", { ascending: false })
      .limit(12)
      .returns<VitalsTimelineRow[]>(),

    supabase
      .from("encounters")
      .select(
        [
          "id",
          "hospital_id",
          "patient_id",
          "appointment_id",
          "encounter_datetime",
          "status",
          "chief_complaint",
          "diagnosis_text",
          "admission_requested",
        ].join(", ")
      )
      .eq("hospital_id", hospital.id)
      .eq("patient_id", patientId)
      .order("encounter_datetime", { ascending: false })
      .limit(10)
      .returns<EncounterRow[]>(),
  ]);

  if (patientResult.error) throw new Error(patientResult.error.message);
  if (latestVitalsResult.error) throw new Error(latestVitalsResult.error.message);
  if (timelineResult.error) throw new Error(timelineResult.error.message);
  if (encountersResult.error) throw new Error(encountersResult.error.message);

  return {
    hospital,
    patient: patientResult.data ?? null,
    latestVitals: latestVitalsResult.data ?? null,
    vitalsTimeline: timelineResult.data ?? [],
    recentEncounters: encountersResult.data ?? [],
  };
}
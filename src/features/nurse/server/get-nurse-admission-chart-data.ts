import { createClient } from "@/lib/supabase/server";
import { getAdmissionDischargeChecklist } from "@/features/ward/server/get-admission-discharge-checklist";

type HospitalRow = {
  id: string;
  slug: string;
  name: string;
};

type PatientLite = {
  id: string;
  patient_number: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  sex: string | null;
  phone: string | null;
};

type WardLite = {
  id: string;
  name: string;
  code: string | null;
  ward_type: string | null;
};

type BedLite = {
  id: string;
  bed_number: string;
  status: string | null;
};

type DoctorLite = {
  id: string;
  full_name: string;
  specialty: string | null;
};

type AdmissionRow = {
  id: string;
  patient_id: string;
  encounter_id: string | null;
  ward_id: string;
  bed_id: string | null;
  admitting_doctor_staff_id: string | null;
  admitted_at: string;
  status: string;
  discharge_requested: boolean;
  discharge_requested_at: string | null;
  admission_reason: string | null;
  patient: PatientLite | PatientLite[] | null;
  ward: WardLite | WardLite[] | null;
  bed: BedLite | BedLite[] | null;
  admitting_doctor: DoctorLite | DoctorLite[] | null;
};

type VitalRow = {
  id: string;
  recorded_at: string;
  temperature_c: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  pulse_bpm: number | null;
  respiratory_rate: number | null;
  spo2: number | null;
  pain_score: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  notes: string | null;
};

type NurseNoteRow = {
  id: string;
  note_type: string;
  note_text: string;
  created_at: string;
  recorded_by_staff: {
    id: string;
    full_name: string;
  } | {
    id: string;
    full_name: string;
  }[] | null;
};

function takeOne<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export async function getNurseAdmissionChartData(hospitalSlug: string, admissionId: string) {
  const supabase = await createClient();

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug, name")
    .eq("slug", hospitalSlug)
    .maybeSingle<HospitalRow>();

  if (hospitalError) throw new Error(hospitalError.message);
  if (!hospital) throw new Error("Hospital not found");

  const { data: admission, error: admissionError } = await supabase
    .from("admissions")
    .select(`
      id,
      patient_id,
      encounter_id,
      ward_id,
      bed_id,
      admitting_doctor_staff_id,
      admitted_at,
      status,
      discharge_requested,
      discharge_requested_at,
      admission_reason,
      patient:patients (
        id,
        patient_number,
        first_name,
        middle_name,
        last_name,
        sex,
        phone
      ),
      ward:wards (
        id,
        name,
        code,
        ward_type
      ),
      bed:beds (
        id,
        bed_number,
        status
      ),
      admitting_doctor:staff!admissions_admitting_doctor_staff_id_fkey (
        id,
        full_name,
        specialty
      )
    `)
    .eq("hospital_id", hospital.id)
    .eq("id", admissionId)
    .eq("status", "admitted")
    .maybeSingle<AdmissionRow>();

  if (admissionError) throw new Error(admissionError.message);
  if (!admission) throw new Error("Admission not found");

  const normalizedAdmission = {
    ...admission,
    patient: takeOne(admission.patient),
    ward: takeOne(admission.ward),
    bed: takeOne(admission.bed),
    admitting_doctor: takeOne(admission.admitting_doctor),
  };

  const { data: vitals, error: vitalsError } = await supabase
    .from("patient_vitals")
    .select(`
      id,
      recorded_at,
      temperature_c,
      blood_pressure_systolic,
      blood_pressure_diastolic,
      pulse_bpm,
      respiratory_rate,
      spo2,
      pain_score,
      weight_kg,
      height_cm,
      notes
    `)
    .eq("hospital_id", hospital.id)
    .eq("admission_id", admissionId)
    .order("recorded_at", { ascending: false })
    .limit(20)
    .returns<VitalRow[]>();

  if (vitalsError) throw new Error(vitalsError.message);

  const { data: notes, error: notesError } = await supabase
    .from("nurse_notes")
    .select(`
      id,
      note_type,
      note_text,
      created_at,
      recorded_by_staff:staff!nurse_notes_recorded_by_staff_id_fkey (
        id,
        full_name
      )
    `)
    .eq("hospital_id", hospital.id)
    .eq("admission_id", admissionId)
    .order("created_at", { ascending: false })
    .limit(20)
    .returns<NurseNoteRow[]>();

  if (notesError) throw new Error(notesError.message);

  const checklist = await getAdmissionDischargeChecklist(hospital.id, admissionId);

  return {
    hospital,
    admission: normalizedAdmission,
    vitals: vitals ?? [],
    notes: (notes ?? []).map((note) => ({
      ...note,
      recorded_by_staff: takeOne(note.recorded_by_staff),
    })),
    checklist,
  };
}
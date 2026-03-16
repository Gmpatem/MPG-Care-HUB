import { createClient } from "@/lib/supabase/server";

type HospitalRow = {
  id: string;
  slug: string;
  name: string;
};

type StaffRow = {
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
  discharge_requested: boolean;
  discharge_requested_at: string | null;
  admission_reason: string | null;
  patient: {
    id: string;
    patient_number: string | null;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    sex: string | null;
    phone: string | null;
  } | {
    id: string;
    patient_number: string | null;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    sex: string | null;
    phone: string | null;
  }[] | null;
  ward: {
    id: string;
    name: string;
    code: string | null;
  } | {
    id: string;
    name: string;
    code: string | null;
  }[] | null;
  bed: {
    id: string;
    bed_number: string;
  } | {
    id: string;
    bed_number: string;
  }[] | null;
};

type VitalRow = {
  admission_id: string | null;
  recorded_at: string;
  temperature_c: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  pulse_bpm: number | null;
  respiratory_rate: number | null;
  spo2: number | null;
  pain_score: number | null;
};

type NurseNoteRow = {
  admission_id: string;
  created_at: string;
  note_type: string;
  note_text: string;
};

function takeOne<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function fullName(patient: {
  first_name: string;
  middle_name: string | null;
  last_name: string;
} | null) {
  if (!patient) return "Unknown patient";
  return [patient.first_name, patient.middle_name, patient.last_name].filter(Boolean).join(" ");
}

function hoursSince(iso: string) {
  const value = new Date(iso).getTime();
  const now = Date.now();
  if (Number.isNaN(value)) return null;
  return Math.floor((now - value) / (1000 * 60 * 60));
}

export async function getDoctorRoundsWorkspaceData(hospitalSlug: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be signed in.");
  }

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug, name")
    .eq("slug", hospitalSlug)
    .maybeSingle<HospitalRow>();

  if (hospitalError) throw new Error(hospitalError.message);
  if (!hospital) throw new Error("Hospital not found.");

  const { data: doctorStaff, error: doctorStaffError } = await supabase
    .from("staff")
    .select("id, full_name, specialty")
    .eq("hospital_id", hospital.id)
    .eq("hospital_user_id", user.id)
    .maybeSingle<StaffRow>();

  if (doctorStaffError) throw new Error(doctorStaffError.message);
  if (!doctorStaff) throw new Error("Doctor staff profile not found.");

  const { data: admissions, error: admissionsError } = await supabase
    .from("admissions")
    .select(`
      id,
      patient_id,
      encounter_id,
      ward_id,
      bed_id,
      admitting_doctor_staff_id,
      admitted_at,
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
        code
      ),
      bed:beds (
        id,
        bed_number
      )
    `)
    .eq("hospital_id", hospital.id)
    .eq("status", "admitted")
    .eq("admitting_doctor_staff_id", doctorStaff.id)
    .order("admitted_at", { ascending: false })
    .returns<AdmissionRow[]>();

  if (admissionsError) throw new Error(admissionsError.message);

  const normalizedAdmissions = (admissions ?? []).map((row) => ({
    ...row,
    patient: takeOne(row.patient),
    ward: takeOne(row.ward),
    bed: takeOne(row.bed),
  }));

  const admissionIds = normalizedAdmissions.map((row) => row.id);

  let vitals: VitalRow[] = [];
  let nurseNotes: NurseNoteRow[] = [];

  if (admissionIds.length > 0) {
    const [vitalsRes, nurseNotesRes] = await Promise.all([
      supabase
        .from("patient_vitals")
        .select(`
          admission_id,
          recorded_at,
          temperature_c,
          blood_pressure_systolic,
          blood_pressure_diastolic,
          pulse_bpm,
          respiratory_rate,
          spo2,
          pain_score
        `)
        .eq("hospital_id", hospital.id)
        .in("admission_id", admissionIds)
        .order("recorded_at", { ascending: false })
        .returns<VitalRow[]>(),

      supabase
        .from("nurse_notes")
        .select("admission_id, created_at, note_type, note_text")
        .eq("hospital_id", hospital.id)
        .in("admission_id", admissionIds)
        .order("created_at", { ascending: false })
        .returns<NurseNoteRow[]>(),
    ]);

    if (vitalsRes.error) throw new Error(vitalsRes.error.message);
    if (nurseNotesRes.error) throw new Error(nurseNotesRes.error.message);

    vitals = vitalsRes.data ?? [];
    nurseNotes = nurseNotesRes.data ?? [];
  }

  const latestVitalsByAdmission = new Map<string, VitalRow>();
  for (const row of vitals) {
    if (!row.admission_id) continue;
    if (!latestVitalsByAdmission.has(row.admission_id)) {
      latestVitalsByAdmission.set(row.admission_id, row);
    }
  }

  const latestNurseNoteByAdmission = new Map<string, NurseNoteRow>();
  for (const row of nurseNotes) {
    if (!latestNurseNoteByAdmission.has(row.admission_id)) {
      latestNurseNoteByAdmission.set(row.admission_id, row);
    }
  }

  const patients = normalizedAdmissions.map((admission) => {
    const latestVital = latestVitalsByAdmission.get(admission.id) ?? null;
    const latestNurseNote = latestNurseNoteByAdmission.get(admission.id) ?? null;

    return {
      id: admission.id,
      encounter_id: admission.encounter_id,
      admitted_at: admission.admitted_at,
      admission_age_hours: hoursSince(admission.admitted_at),
      admission_reason: admission.admission_reason,
      discharge_requested: admission.discharge_requested,
      discharge_requested_at: admission.discharge_requested_at,
      patient: admission.patient,
      patient_full_name: fullName(admission.patient),
      ward: admission.ward,
      bed: admission.bed,
      latest_vitals: latestVital,
      latest_nurse_note: latestNurseNote,
    };
  });

  return {
    hospital,
    doctor: doctorStaff,
    patients,
    stats: {
      total_inpatients: patients.length,
      discharge_requested: patients.filter((row) => row.discharge_requested).length,
      missing_vitals: patients.filter((row) => !row.latest_vitals).length,
      no_nurse_note: patients.filter((row) => !row.latest_nurse_note).length,
    },
  };
}
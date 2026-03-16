import { createClient } from "@/lib/supabase/server";

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

type NormalizedAdmissionRow = Omit<
  AdmissionRow,
  "patient" | "ward" | "bed" | "admitting_doctor"
> & {
  patient: PatientLite | null;
  ward: WardLite | null;
  bed: BedLite | null;
  admitting_doctor: DoctorLite | null;
};

type LatestVitalRow = {
  admission_id: string | null;
  patient_id: string;
  recorded_at: string;
  temperature_c: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  pulse_bpm: number | null;
  respiratory_rate: number | null;
  spo2: number | null;
  pain_score: number | null;
};

type VitalsState = "missing" | "overdue" | "due" | "fresh";

type EnrichedAdmissionRow = NormalizedAdmissionRow & {
  latest_vitals: LatestVitalRow | null;
  hours_since_latest_vitals: number | null;
  is_new_admission: boolean;
  vitals_state: VitalsState;
};

function hoursBetween(fromIso: string | null, toIso: string) {
  if (!fromIso) return null;
  const from = new Date(fromIso).getTime();
  const to = new Date(toIso).getTime();
  if (Number.isNaN(from) || Number.isNaN(to)) return null;
  return Math.floor((to - from) / (1000 * 60 * 60));
}

function takeOne<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export async function getNurseDashboardData(hospitalSlug: string) {
  const supabase = await createClient();

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug, name")
    .eq("slug", hospitalSlug)
    .maybeSingle<HospitalRow>();

  if (hospitalError) throw new Error(hospitalError.message);
  if (!hospital) throw new Error("Hospital not found");

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
    .eq("status", "admitted")
    .order("admitted_at", { ascending: false })
    .returns<AdmissionRow[]>();

  if (admissionsError) throw new Error(admissionsError.message);

  const admissionRows: NormalizedAdmissionRow[] = (admissions ?? []).map((row) => ({
    ...row,
    patient: takeOne(row.patient),
    ward: takeOne(row.ward),
    bed: takeOne(row.bed),
    admitting_doctor: takeOne(row.admitting_doctor),
  }));

  const admissionIds = Array.from(
    new Set(admissionRows.map((row) => row.id).filter((value): value is string => Boolean(value)))
  );

  let latestVitalsRows: LatestVitalRow[] = [];

  if (admissionIds.length > 0) {
    const { data: vitals, error: vitalsError } = await supabase
      .from("patient_vitals")
      .select(`
        admission_id,
        patient_id,
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
      .returns<LatestVitalRow[]>();

    if (vitalsError) throw new Error(vitalsError.message);

    const seen = new Set<string>();
    latestVitalsRows = (vitals ?? []).filter((row) => {
      const key = `${row.admission_id ?? "none"}:${row.patient_id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  const latestVitalsByAdmission = new Map<string, LatestVitalRow>();
  for (const row of latestVitalsRows) {
    if (row.admission_id) {
      latestVitalsByAdmission.set(row.admission_id, row);
    }
  }

  const nowIso = new Date().toISOString();

  const enrichedAdmissions: EnrichedAdmissionRow[] = admissionRows.map((row) => {
    const latestVital = latestVitalsByAdmission.get(row.id) ?? null;
    const hoursSinceLatestVitals = latestVital
      ? hoursBetween(latestVital.recorded_at, nowIso)
      : null;

    const isNewAdmission = (hoursBetween(row.admitted_at, nowIso) ?? 9999) < 24;
    const vitalsState: VitalsState =
      latestVital == null
        ? "missing"
        : (hoursSinceLatestVitals ?? 9999) >= 8
        ? "overdue"
        : (hoursSinceLatestVitals ?? 9999) >= 4
        ? "due"
        : "fresh";

    return {
      ...row,
      latest_vitals: latestVital,
      hours_since_latest_vitals: hoursSinceLatestVitals,
      is_new_admission: isNewAdmission,
      vitals_state: vitalsState,
    };
  });

  const priorityPatients: EnrichedAdmissionRow[] = [
    ...enrichedAdmissions.filter((row) => row.discharge_requested),
    ...enrichedAdmissions.filter(
      (row) => !row.discharge_requested && row.vitals_state === "overdue"
    ),
    ...enrichedAdmissions.filter(
      (row) => !row.discharge_requested && row.vitals_state === "missing"
    ),
    ...enrichedAdmissions.filter(
      (row) =>
        !row.discharge_requested &&
        row.vitals_state !== "overdue" &&
        row.vitals_state !== "missing"
    ),
  ];

  const uniquePriority = priorityPatients.filter(
    (row, index, arr) => arr.findIndex((item) => item.id === row.id) === index
  );

  return {
    hospital,
    admissions: uniquePriority,
    stats: {
      total_admissions: enrichedAdmissions.length,
      discharge_requested: enrichedAdmissions.filter((row) => row.discharge_requested).length,
      overdue_vitals: enrichedAdmissions.filter((row) => row.vitals_state === "overdue").length,
      missing_vitals: enrichedAdmissions.filter((row) => row.vitals_state === "missing").length,
      due_vitals: enrichedAdmissions.filter((row) => row.vitals_state === "due").length,
      new_admissions: enrichedAdmissions.filter((row) => row.is_new_admission).length,
    },
  };
}
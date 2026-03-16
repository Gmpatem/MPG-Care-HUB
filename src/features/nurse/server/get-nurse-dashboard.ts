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
  date_of_birth: string | null;
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

type AdmissionRow = {
  id: string;
  patient_id: string;
  encounter_id: string | null;
  ward_id: string;
  bed_id: string | null;
  admitted_at: string;
  status: string;
  patient: PatientLite | PatientLite[] | null;
  ward: WardLite | WardLite[] | null;
  bed: BedLite | BedLite[] | null;
};

type VitalRow = {
  id: string;
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

type WorkflowStateRow = {
  admission_id: string;
  workflow_config_id: string;
};

type WorkflowConfigRow = {
  id: string;
  default_vitals_frequency_hours: number | null;
};

function takeOne<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function fullName(patient: {
  first_name: string;
  middle_name: string | null;
  last_name: string;
}) {
  return [patient.first_name, patient.middle_name, patient.last_name]
    .filter(Boolean)
    .join(" ");
}

export async function getNurseDashboard(hospitalSlug: string) {
  const supabase = await createClient();

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug, name")
    .eq("slug", hospitalSlug)
    .maybeSingle<HospitalRow>();

  if (hospitalError) throw new Error(hospitalError.message);
  if (!hospital) throw new Error("Hospital not found.");

  const { data: admissions, error: admissionsError } = await supabase
    .from("admissions")
    .select(`
      id,
      patient_id,
      encounter_id,
      ward_id,
      bed_id,
      admitted_at,
      status,
      patient:patients (
        id,
        patient_number,
        first_name,
        middle_name,
        last_name,
        sex,
        date_of_birth,
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
      )
    `)
    .eq("hospital_id", hospital.id)
    .eq("status", "admitted")
    .order("admitted_at", { ascending: false })
    .returns<AdmissionRow[]>();

  if (admissionsError) throw new Error(admissionsError.message);

  const admissionIds = (admissions ?? []).map((row) => row.id);

  const safeIds = admissionIds.length
    ? admissionIds
    : ["00000000-0000-0000-0000-000000000000"];

  const { data: workflowStates, error: workflowStatesError } = await supabase
    .from("admission_workflow_state")
    .select("admission_id, workflow_config_id")
    .eq("hospital_id", hospital.id)
    .in("admission_id", safeIds)
    .returns<WorkflowStateRow[]>();

  if (workflowStatesError) throw new Error(workflowStatesError.message);

  const workflowConfigIds = Array.from(
    new Set((workflowStates ?? []).map((row) => row.workflow_config_id))
  );

  const safeWorkflowIds = workflowConfigIds.length
    ? workflowConfigIds
    : ["00000000-0000-0000-0000-000000000000"];

  const { data: workflowConfigs, error: workflowConfigsError } = await supabase
    .from("ward_workflow_configs")
    .select("id, default_vitals_frequency_hours")
    .eq("hospital_id", hospital.id)
    .in("id", safeWorkflowIds)
    .returns<WorkflowConfigRow[]>();

  if (workflowConfigsError) throw new Error(workflowConfigsError.message);

  const { data: vitals, error: vitalsError } = await supabase
    .from("patient_vitals")
    .select(`
      id,
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
    .in("admission_id", safeIds)
    .order("recorded_at", { ascending: false })
    .returns<VitalRow[]>();

  if (vitalsError) throw new Error(vitalsError.message);

  const workflowStateByAdmission = new Map(
    (workflowStates ?? []).map((row) => [row.admission_id, row])
  );

  const workflowConfigById = new Map(
    (workflowConfigs ?? []).map((row) => [row.id, row])
  );

  const latestVitalByAdmission = new Map<string, VitalRow>();
  for (const vital of vitals ?? []) {
    if (!vital.admission_id) continue;
    if (!latestVitalByAdmission.has(vital.admission_id)) {
      latestVitalByAdmission.set(vital.admission_id, vital);
    }
  }

  const now = Date.now();

  const rows = (admissions ?? []).map((admission) => {
    const patient = takeOne(admission.patient);
    const ward = takeOne(admission.ward);
    const bed = takeOne(admission.bed);
    const latestVital = latestVitalByAdmission.get(admission.id) ?? null;

    const workflowState = workflowStateByAdmission.get(admission.id) ?? null;
    const workflowConfig = workflowState
      ? workflowConfigById.get(workflowState.workflow_config_id) ?? null
      : null;

    const frequencyHours = workflowConfig?.default_vitals_frequency_hours ?? 6;

    const nextDueAt = latestVital
      ? new Date(
          new Date(latestVital.recorded_at).getTime() +
            frequencyHours * 60 * 60 * 1000
        ).toISOString()
      : admission.admitted_at;

    const nextDueMs = new Date(nextDueAt).getTime();
    const isOverdue = nextDueMs < now;
    const status = latestVital ? (isOverdue ? "overdue" : "ok") : "due";

    return {
      id: admission.id,
      patient_id: admission.patient_id,
      encounter_id: admission.encounter_id,
      admitted_at: admission.admitted_at,
      patient: patient
        ? {
            id: patient.id,
            patient_number: patient.patient_number,
            full_name: fullName(patient),
            sex: patient.sex,
            date_of_birth: patient.date_of_birth,
            phone: patient.phone,
          }
        : null,
      ward: ward
        ? {
            id: ward.id,
            name: ward.name,
            code: ward.code,
            ward_type: ward.ward_type,
          }
        : null,
      bed: bed
        ? {
            id: bed.id,
            bed_number: bed.bed_number,
            status: bed.status,
          }
        : null,
      latest_vital: latestVital,
      next_due_at: nextDueAt,
      vitals_status: status,
      vitals_frequency_hours: frequencyHours,
    };
  });

  const totals = {
    admitted: rows.length,
    due: rows.filter((row) => row.vitals_status === "due").length,
    overdue: rows.filter((row) => row.vitals_status === "overdue").length,
    stable: rows.filter((row) => row.vitals_status === "ok").length,
  };

  return {
    hospital,
    totals,
    rows,
  };
}

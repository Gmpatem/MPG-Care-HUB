import { createClient } from "@/lib/supabase/server";
import { ensureAdmissionWorkflowState } from "@/features/ward/server/ensure-admission-workflow-state";
import { ensureAdmissionDischargeChecklist } from "@/features/ward/server/ensure-admission-discharge-checklist";

type NamedStaff = {
  id: string;
  full_name: string | null;
};

type PatientLite = {
  id: string;
  patient_number: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  sex: string | null;
  phone: string | null;
  date_of_birth: string | null;
  address_text: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
};

type WardLite = {
  id: string;
  code: string | null;
  name: string;
  ward_type: string | null;
};

type BedLite = {
  id: string;
  bed_number: string;
  status: string | null;
};

type WorkflowStep = {
  id: string;
  step_key: string;
  step_name: string;
  step_type: string;
  sort_order: number;
  required: boolean;
  active: boolean;
};

type WorkflowConfig = {
  id: string;
  name: string;
  is_default: boolean;
  requires_bed_assignment: boolean;
  requires_admission_intake: boolean;
  requires_nurse_discharge_clearance: boolean;
  allow_ward_transfer: boolean;
  allow_bed_transfer: boolean;
  default_vitals_frequency_hours: number | null;
  active: boolean;
};

type ChecklistTemplate = {
  id: string;
  item_key: string;
  item_label: string;
  sort_order: number;
  required: boolean;
  active: boolean;
};

type ChecklistStateRow = {
  id: string;
  checklist_item_key: string;
  completed: boolean;
  completed_at: string | null;
  notes: string | null;
  completed_by_staff_id: string | null;
  completed_by_staff: NamedStaff | NamedStaff[] | null;
};

type TransferRow = {
  id: string;
  transfer_reason: string | null;
  transferred_at: string;
  from_ward: TransferWardLite | TransferWardLite[] | null;
  to_ward: TransferWardLite | TransferWardLite[] | null;
  from_bed: TransferBedLite | TransferBedLite[] | null;
  to_bed: TransferBedLite | TransferBedLite[] | null;
  transferred_by_staff: NamedStaff | NamedStaff[] | null;
};

type TransferWardLite = {
  id: string;
  name: string;
  code: string | null;
};

type TransferBedLite = {
  id: string;
  bed_number: string;
};

type NurseNoteRow = {
  id: string;
  note_type: string;
  note_text: string;
  created_at: string;
  recorded_by_staff_id: string | null;
  recorded_by_staff: NamedStaff | NamedStaff[] | null;
};

type VitalRow = {
  id: string;
  recorded_at: string;
  source_type: string;
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
  recorded_by_staff_id: string | null;
  recorded_by_staff: NamedStaff | NamedStaff[] | null;
};

type DoctorRoundRow = {
  id: string;
  round_datetime: string;
  subjective_notes: string | null;
  objective_notes: string | null;
  assessment_notes: string | null;
  plan_notes: string | null;
  discharge_recommended: boolean;
  doctor_staff_id: string | null;
  doctor: NamedStaff | NamedStaff[] | null;
};

type AdmissionRow = {
  id: string;
  hospital_id: string;
  patient_id: string;
  encounter_id: string | null;
  appointment_id: string | null;
  admitting_doctor_staff_id: string | null;
  ward_id: string;
  bed_id: string | null;
  status: string;
  admitted_at: string;
  discharged_at: string | null;
  admission_reason: string | null;
  discharge_notes: string | null;
  discharge_requested: boolean;
  discharge_requested_at: string | null;
  discharge_requested_by_staff_id: string | null;
  patient: PatientLite | PatientLite[] | null;
  ward: WardLite | WardLite[] | null;
  bed: BedLite | BedLite[] | null;
  doctor: NamedStaff | NamedStaff[] | null;
  discharge_requested_by: NamedStaff | NamedStaff[] | null;
};

type FlattenedAdmission = Omit<
  AdmissionRow,
  "patient" | "ward" | "bed" | "doctor" | "discharge_requested_by"
> & {
  patient: PatientLite | null;
  ward: WardLite | null;
  bed: BedLite | null;
  doctor: NamedStaff | null;
  discharge_requested_by: NamedStaff | null;
};

type StaffRow = {
  id: string;
  full_name: string | null;
  active: boolean;
};

function takeOne<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
}

export async function getAdmissionDetail(hospitalSlug: string, admissionId: string) {
  const supabase = await createClient();

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug, name")
    .eq("slug", hospitalSlug)
    .maybeSingle<{ id: string; slug: string; name: string }>();

  if (hospitalError) throw new Error(hospitalError.message);
  if (!hospital) throw new Error("Hospital not found");

  const { data: admission, error: admissionError } = await supabase
    .from("admissions")
    .select(`
      id,
      hospital_id,
      patient_id,
      encounter_id,
      appointment_id,
      admitting_doctor_staff_id,
      ward_id,
      bed_id,
      status,
      admitted_at,
      discharged_at,
      admission_reason,
      discharge_notes,
      discharge_requested,
      discharge_requested_at,
      discharge_requested_by_staff_id,
      patient:patients (
        id,
        patient_number,
        first_name,
        middle_name,
        last_name,
        sex,
        phone,
        date_of_birth,
        address_text,
        emergency_contact_name,
        emergency_contact_phone
      ),
      ward:wards (
        id,
        code,
        name,
        ward_type
      ),
      bed:beds (
        id,
        bed_number,
        status
      ),
      doctor:staff (
        id,
        full_name
      ),
      discharge_requested_by:staff (
        id,
        full_name
      )
    `)
    .eq("hospital_id", hospital.id)
    .eq("id", admissionId)
    .maybeSingle<AdmissionRow>();

  if (admissionError) throw new Error(admissionError.message);
  if (!admission) throw new Error("Admission not found");

  const workflowState = await ensureAdmissionWorkflowState(hospital.id, admissionId);

  let workflowConfig: WorkflowConfig | null = null;
  let workflowSteps: WorkflowStep[] = [];

  if (workflowState?.workflow_config_id) {
    const { data: config } = await supabase
      .from("ward_workflow_configs")
      .select(`
        id,
        name,
        is_default,
        requires_bed_assignment,
        requires_admission_intake,
        requires_nurse_discharge_clearance,
        allow_ward_transfer,
        allow_bed_transfer,
        default_vitals_frequency_hours,
        active
      `)
      .eq("hospital_id", hospital.id)
      .eq("id", workflowState.workflow_config_id)
      .maybeSingle<WorkflowConfig>();

    workflowConfig = config ?? null;

    const { data: steps } = await supabase
      .from("ward_workflow_steps")
      .select("id, step_key, step_name, step_type, sort_order, required, active")
      .eq("hospital_id", hospital.id)
      .eq("workflow_config_id", workflowState.workflow_config_id)
      .eq("active", true)
      .order("sort_order", { ascending: true })
      .returns<WorkflowStep[]>();

    workflowSteps = steps ?? [];
  }

  await ensureAdmissionDischargeChecklist(
    hospital.id,
    admissionId,
    workflowState?.workflow_config_id
  );

  const { data: checklistTemplates } = await supabase
    .from("discharge_checklists")
    .select("id, item_key, item_label, sort_order, required, active")
    .eq("hospital_id", hospital.id)
    .eq("workflow_config_id", workflowState?.workflow_config_id ?? "")
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .returns<ChecklistTemplate[]>();

  const { data: checklistState } = await supabase
    .from("admission_discharge_checklist_items")
    .select(`
      id,
      checklist_item_key,
      completed,
      completed_at,
      notes,
      completed_by_staff_id,
      completed_by_staff:staff (
        id,
        full_name
      )
    `)
    .eq("hospital_id", hospital.id)
    .eq("admission_id", admissionId)
    .returns<ChecklistStateRow[]>();

  const checklistStateMap = new Map(
    (checklistState ?? []).map((item) => [
      item.checklist_item_key,
      {
        ...item,
        completed_by_staff: takeOne(item.completed_by_staff),
      },
    ])
  );

  const dischargeChecklist = (checklistTemplates ?? []).map((template) => ({
    ...template,
    state: checklistStateMap.get(template.item_key) ?? null,
  }));

  const { data: transfers } = await supabase
    .from("admission_transfers")
    .select(`
      id,
      transfer_reason,
      transferred_at,
      from_ward:wards!admission_transfers_from_ward_id_fkey (
        id,
        name,
        code
      ),
      to_ward:wards!admission_transfers_to_ward_id_fkey (
        id,
        name,
        code
      ),
      from_bed:beds!admission_transfers_from_bed_id_fkey (
        id,
        bed_number
      ),
      to_bed:beds!admission_transfers_to_bed_id_fkey (
        id,
        bed_number
      ),
      transferred_by_staff:staff (
        id,
        full_name
      )
    `)
    .eq("hospital_id", hospital.id)
    .eq("admission_id", admissionId)
    .order("transferred_at", { ascending: false })
    .returns<TransferRow[]>();

  const { data: nurseNotes, error: notesError } = await supabase
    .from("nurse_notes")
    .select(`
      id,
      note_type,
      note_text,
      created_at,
      recorded_by_staff_id,
      recorded_by_staff:staff (
        id,
        full_name
      )
    `)
    .eq("hospital_id", hospital.id)
    .eq("admission_id", admissionId)
    .order("created_at", { ascending: false })
    .returns<NurseNoteRow[]>();

  if (notesError) throw new Error(notesError.message);

  const { data: vitals, error: vitalsError } = await supabase
    .from("patient_vitals")
    .select(`
      id,
      recorded_at,
      source_type,
      height_cm,
      weight_kg,
      temperature_c,
      blood_pressure_systolic,
      blood_pressure_diastolic,
      pulse_bpm,
      respiratory_rate,
      spo2,
      pain_score,
      notes,
      recorded_by_staff_id,
      recorded_by_staff:staff (
        id,
        full_name
      )
    `)
    .eq("hospital_id", hospital.id)
    .eq("admission_id", admissionId)
    .order("recorded_at", { ascending: false })
    .returns<VitalRow[]>();

  if (vitalsError) throw new Error(vitalsError.message);

  const { data: rounds, error: roundsError } = await supabase
    .from("doctor_rounds")
    .select(`
      id,
      round_datetime,
      subjective_notes,
      objective_notes,
      assessment_notes,
      plan_notes,
      discharge_recommended,
      doctor_staff_id,
      doctor:staff (
        id,
        full_name
      )
    `)
    .eq("hospital_id", hospital.id)
    .eq("admission_id", admissionId)
    .order("round_datetime", { ascending: false })
    .returns<DoctorRoundRow[]>();

  if (roundsError) throw new Error(roundsError.message);

  const { data: staff, error: staffError } = await supabase
    .from("staff")
    .select("id, full_name, active")
    .eq("hospital_id", hospital.id)
    .eq("active", true)
    .order("full_name", { ascending: true })
    .returns<StaffRow[]>();

  if (staffError) throw new Error(staffError.message);

  const normalizedAdmission: FlattenedAdmission = {
    ...admission,
    patient: takeOne(admission.patient),
    ward: takeOne(admission.ward),
    bed: takeOne(admission.bed),
    doctor: takeOne(admission.doctor),
    discharge_requested_by: takeOne(admission.discharge_requested_by),
  };

  return {
    hospital,
    admission: normalizedAdmission,
    workflowState,
    workflowConfig,
    workflowSteps,
    dischargeChecklist,
    transfers: (transfers ?? []).map((row) => ({
      ...row,
      from_ward: takeOne(row.from_ward),
      to_ward: takeOne(row.to_ward),
      from_bed: takeOne(row.from_bed),
      to_bed: takeOne(row.to_bed),
      transferred_by_staff: takeOne(row.transferred_by_staff),
    })),
    nurseNotes: (nurseNotes ?? []).map((note) => ({
      ...note,
      recorded_by_staff: takeOne(note.recorded_by_staff),
    })),
    vitals: (vitals ?? []).map((row) => ({
      ...row,
      recorded_by_staff: takeOne(row.recorded_by_staff),
    })),
    rounds: (rounds ?? []).map((row) => ({
      ...row,
      doctor: takeOne(row.doctor),
    })),
    staff: (staff ?? []).map((member) => ({
      id: member.id,
      full_name: member.full_name ?? "Unnamed staff",
    })),
  };
}

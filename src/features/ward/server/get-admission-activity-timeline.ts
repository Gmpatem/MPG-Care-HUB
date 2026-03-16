import { createClient } from "@/lib/supabase/server";

type HospitalRow = {
  id: string;
  slug: string;
  name: string;
};

type AdmissionBaseRow = {
  id: string;
  patient_id: string;
  encounter_id: string | null;
  appointment_id: string | null;
  ward_id: string;
  bed_id: string | null;
  admitted_at: string;
  discharged_at: string | null;
  admission_reason: string | null;
  discharge_notes: string | null;
  discharge_requested: boolean;
  discharge_requested_at: string | null;
  patient: {
    id: string;
    patient_number: string | null;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    phone: string | null;
  } | {
    id: string;
    patient_number: string | null;
    first_name: string;
    middle_name: string | null;
    last_name: string;
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

type TimelineEvent = {
  id: string;
  type:
    | "admission"
    | "transfer"
    | "vitals"
    | "nurse_note"
    | "doctor_round"
    | "lab_order"
    | "lab_result"
    | "prescription"
    | "dispensation"
    | "billing"
    | "discharge_requested"
    | "nurse_clearance"
    | "discharged";
  title: string;
  description: string;
  at: string;
  href?: string | null;
  meta?: Record<string, string | number | boolean | null>;
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

export async function getAdmissionActivityTimeline(
  hospitalSlug: string,
  admissionId: string
) {
  const supabase = await createClient();

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug, name")
    .eq("slug", hospitalSlug)
    .maybeSingle<HospitalRow>();

  if (hospitalError) throw new Error(hospitalError.message);
  if (!hospital) throw new Error("Hospital not found.");

  const { data: admission, error: admissionError } = await supabase
    .from("admissions")
    .select(`
      id,
      patient_id,
      encounter_id,
      appointment_id,
      ward_id,
      bed_id,
      admitted_at,
      discharged_at,
      admission_reason,
      discharge_notes,
      discharge_requested,
      discharge_requested_at,
      patient:patients (
        id,
        patient_number,
        first_name,
        middle_name,
        last_name,
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
    .eq("id", admissionId)
    .maybeSingle<AdmissionBaseRow>();

  if (admissionError) throw new Error(admissionError.message);
  if (!admission) throw new Error("Admission not found.");

  const normalizedAdmission = {
    ...admission,
    patient: takeOne(admission.patient),
    ward: takeOne(admission.ward),
    bed: takeOne(admission.bed),
  };

  const [
    transfersRes,
    vitalsRes,
    nurseNotesRes,
    doctorRoundsRes,
    labOrdersRes,
    prescriptionsRes,
    dispensationsRes,
    invoicesRes,
  ] = await Promise.all([
    supabase
      .from("admission_transfers")
      .select("id, from_ward_id, to_ward_id, from_bed_id, to_bed_id, transfer_reason, transferred_at")
      .eq("hospital_id", hospital.id)
      .eq("admission_id", admissionId)
      .order("transferred_at", { ascending: false }),

    supabase
      .from("patient_vitals")
      .select("id, recorded_at, temperature_c, blood_pressure_systolic, blood_pressure_diastolic, pulse_bpm, spo2")
      .eq("hospital_id", hospital.id)
      .eq("admission_id", admissionId)
      .order("recorded_at", { ascending: false }),

    supabase
      .from("nurse_notes")
      .select("id, note_type, note_text, created_at")
      .eq("hospital_id", hospital.id)
      .eq("admission_id", admissionId)
      .order("created_at", { ascending: false }),

    supabase
      .from("doctor_rounds")
      .select("id, round_datetime, subjective_notes, assessment_notes, plan_notes, discharge_recommended")
      .eq("hospital_id", hospital.id)
      .eq("admission_id", admissionId)
      .order("round_datetime", { ascending: false }),

    supabase
      .from("lab_orders")
      .select("id, ordered_at, status, priority")
      .eq("hospital_id", hospital.id)
      .eq("encounter_id", normalizedAdmission.encounter_id)
      .order("ordered_at", { ascending: false }),

    supabase
      .from("prescriptions")
      .select("id, prescribed_at, status, notes")
      .eq("hospital_id", hospital.id)
      .eq("encounter_id", normalizedAdmission.encounter_id)
      .order("prescribed_at", { ascending: false }),

    supabase
      .from("dispensations")
      .select("id, dispensed_at, status, notes")
      .eq("hospital_id", hospital.id)
      .eq("patient_id", normalizedAdmission.patient_id)
      .order("dispensed_at", { ascending: false }),

    supabase
      .from("invoices")
      .select("id, created_at, total_amount, balance_due, status")
      .eq("hospital_id", hospital.id)
      .eq("patient_id", normalizedAdmission.patient_id)
      .eq("encounter_id", normalizedAdmission.encounter_id)
      .order("created_at", { ascending: false }),
  ]);

  if (transfersRes.error) throw new Error(transfersRes.error.message);
  if (vitalsRes.error) throw new Error(vitalsRes.error.message);
  if (nurseNotesRes.error) throw new Error(nurseNotesRes.error.message);
  if (doctorRoundsRes.error) throw new Error(doctorRoundsRes.error.message);
  if (labOrdersRes.error) throw new Error(labOrdersRes.error.message);
  if (prescriptionsRes.error) throw new Error(prescriptionsRes.error.message);
  if (dispensationsRes.error) throw new Error(dispensationsRes.error.message);
  if (invoicesRes.error) throw new Error(invoicesRes.error.message);

  let nurseClearanceRows: Array<{
    id: string;
    cleared_at: string;
    clearance_notes: string | null;
  }> = [];

  try {
    const clearanceRes = await supabase
      .from("nurse_discharge_clearance")
      .select("id, cleared_at, clearance_notes")
      .eq("hospital_id", hospital.id)
      .eq("admission_id", admissionId)
      .order("cleared_at", { ascending: false });

    if (!clearanceRes.error) {
      nurseClearanceRows = clearanceRes.data ?? [];
    }
  } catch {
    nurseClearanceRows = [];
  }

  const events: TimelineEvent[] = [];

  events.push({
    id: `admission-${normalizedAdmission.id}`,
    type: "admission",
    title: "Admission created",
    description: `${fullName(normalizedAdmission.patient)} admitted to ${normalizedAdmission.ward?.name ?? "ward"}${normalizedAdmission.bed?.bed_number ? `, bed ${normalizedAdmission.bed.bed_number}` : ""}.`,
    at: normalizedAdmission.admitted_at,
    href: `/h/${hospitalSlug}/ward/admissions/${normalizedAdmission.id}`,
    meta: {
      patient_number: normalizedAdmission.patient?.patient_number ?? null,
      admission_reason: normalizedAdmission.admission_reason ?? null,
    },
  });

  if (normalizedAdmission.discharge_requested && normalizedAdmission.discharge_requested_at) {
    events.push({
      id: `discharge-request-${normalizedAdmission.id}`,
      type: "discharge_requested",
      title: "Discharge requested",
      description: "Doctor discharge request has been placed for this admission.",
      at: normalizedAdmission.discharge_requested_at,
      href: `/h/${hospitalSlug}/ward/discharges`,
      meta: {},
    });
  }

  for (const row of transfersRes.data ?? []) {
    events.push({
      id: `transfer-${row.id}`,
      type: "transfer",
      title: "Ward transfer",
      description: row.transfer_reason
        ? `Patient transferred. Reason: ${row.transfer_reason}`
        : "Patient transferred to a new ward/bed.",
      at: row.transferred_at,
      href: `/h/${hospitalSlug}/ward/admissions/${normalizedAdmission.id}`,
      meta: {
        from_ward_id: row.from_ward_id ?? null,
        to_ward_id: row.to_ward_id ?? null,
        from_bed_id: row.from_bed_id ?? null,
        to_bed_id: row.to_bed_id ?? null,
      },
    });
  }

  for (const row of vitalsRes.data ?? []) {
    events.push({
      id: `vitals-${row.id}`,
      type: "vitals",
      title: "Vitals recorded",
      description: `Temp ${row.temperature_c ?? "—"} °C · BP ${row.blood_pressure_systolic ?? "—"}/${row.blood_pressure_diastolic ?? "—"} · Pulse ${row.pulse_bpm ?? "—"} · SpO2 ${row.spo2 ?? "—"}%`,
      at: row.recorded_at,
      href: `/h/${hospitalSlug}/nurse/admissions/${normalizedAdmission.id}`,
      meta: {},
    });
  }

  for (const row of nurseNotesRes.data ?? []) {
    events.push({
      id: `nurse-note-${row.id}`,
      type: "nurse_note",
      title: `Nurse note: ${row.note_type}`,
      description: row.note_text,
      at: row.created_at,
      href: `/h/${hospitalSlug}/nurse/admissions/${normalizedAdmission.id}`,
      meta: {},
    });
  }

  for (const row of doctorRoundsRes.data ?? []) {
    events.push({
      id: `doctor-round-${row.id}`,
      type: "doctor_round",
      title: "Doctor round",
      description:
        row.plan_notes ||
        row.assessment_notes ||
        row.subjective_notes ||
        (row.discharge_recommended ? "Discharge recommended during rounds." : "Doctor round recorded."),
      at: row.round_datetime,
      href: `/h/${hospitalSlug}/doctor/rounds`,
      meta: {
        discharge_recommended: row.discharge_recommended,
      },
    });
  }

  for (const row of labOrdersRes.data ?? []) {
    events.push({
      id: `lab-order-${row.id}`,
      type: "lab_order",
      title: "Lab order",
      description: `Lab order placed. Status: ${row.status}. Priority: ${row.priority}.`,
      at: row.ordered_at,
      href: `/h/${hospitalSlug}/lab/orders/${row.id}`,
      meta: {},
    });
  }

  for (const row of prescriptionsRes.data ?? []) {
    events.push({
      id: `prescription-${row.id}`,
      type: "prescription",
      title: "Prescription created",
      description: row.notes || `Prescription status: ${row.status}`,
      at: row.prescribed_at,
      href: `/h/${hospitalSlug}/pharmacy/prescriptions/${row.id}`,
      meta: {},
    });
  }

  for (const row of dispensationsRes.data ?? []) {
    events.push({
      id: `dispensation-${row.id}`,
      type: "dispensation",
      title: "Medication dispensed",
      description: row.notes || `Dispensation status: ${row.status}`,
      at: row.dispensed_at,
      href: `/h/${hospitalSlug}/pharmacy/dispensations/${row.id}`,
      meta: {},
    });
  }

  for (const row of invoicesRes.data ?? []) {
    events.push({
      id: `invoice-${row.id}`,
      type: "billing",
      title: "Billing event",
      description: `Invoice status: ${row.status} · Total ${Number(row.total_amount ?? 0).toFixed(2)} · Balance ${Number(row.balance_due ?? 0).toFixed(2)}`,
      at: row.created_at,
      href: `/h/${hospitalSlug}/billing/invoices/${row.id}`,
      meta: {},
    });
  }

  for (const row of nurseClearanceRows) {
    events.push({
      id: `nurse-clearance-${row.id}`,
      type: "nurse_clearance",
      title: "Nurse discharge clearance",
      description: row.clearance_notes || "Patient cleared by nurse for discharge.",
      at: row.cleared_at,
      href: `/h/${hospitalSlug}/ward/discharges`,
      meta: {},
    });
  }

  if (normalizedAdmission.discharged_at) {
    events.push({
      id: `discharged-${normalizedAdmission.id}`,
      type: "discharged",
      title: "Patient discharged",
      description: normalizedAdmission.discharge_notes || "Admission closed and patient discharged.",
      at: normalizedAdmission.discharged_at,
      href: `/h/${hospitalSlug}/ward/discharges`,
      meta: {},
    });
  }

  const sortedEvents = events.sort(
    (a, b) => new Date(b.at).getTime() - new Date(a.at).getTime()
  );

  return {
    hospital,
    admission: normalizedAdmission,
    events: sortedEvents,
  };
}
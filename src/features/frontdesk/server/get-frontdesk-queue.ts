import { createClient } from "@/lib/supabase/server";

type HospitalRow = {
  id: string;
  name: string;
  slug: string;
};

export type FrontdeskQueueVitalsRow = {
  appointment_id: string | null;
  patient_id: string;
  patient_vitals_id: string;
  recorded_at: string;
  source_type: string | null;
  temperature_c: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  pulse_bpm: number | null;
  respiratory_rate: number | null;
  spo2: number | null;
  weight_kg: number | null;
  height_cm: number | null;
  pain_score: number | null;
  notes: string | null;
};

export type FrontdeskQueueRow = {
  hospital_id: string;
  appointment_id: string;
  patient_id: string;
  patient_number: string | null;
  first_name: string | null;
  last_name: string | null;
  middle_name: string | null;
  staff_name: string | null;
  appointment_type: string | null;
  visit_type: string | null;
  scheduled_at: string | null;
  check_in_at: string | null;
  queue_number: number | null;
  status: string | null;
  reason: string | null;
  arrival_notes: string | null;
  latest_vitals: FrontdeskQueueVitalsRow | null;
};

function withLatestVitals(
  rows: Omit<FrontdeskQueueRow, "latest_vitals">[],
  vitals: FrontdeskQueueVitalsRow[]
): FrontdeskQueueRow[] {
  const vitalsByAppointment = new Map<string, FrontdeskQueueVitalsRow>();

  for (const item of vitals) {
    if (item.appointment_id) {
      vitalsByAppointment.set(item.appointment_id, item);
    }
  }

  return rows.map((row) => ({
    ...row,
    latest_vitals: vitalsByAppointment.get(row.appointment_id) ?? null,
  }));
}

export async function getFrontdeskQueue(hospitalSlug: string) {
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
      queueRows: [] as FrontdeskQueueRow[],
    };
  }

  const { data: queueRowsRaw, error: queueError } = await supabase
    .from("frontdesk_today_queue_v")
    .select(
      [
        "hospital_id",
        "appointment_id",
        "patient_id",
        "patient_number",
        "first_name",
        "last_name",
        "middle_name",
        "staff_name",
        "appointment_type",
        "visit_type",
        "scheduled_at",
        "check_in_at",
        "queue_number",
        "status",
        "reason",
        "arrival_notes",
      ].join(", ")
    )
    .eq("hospital_id", hospital.id)
    .order("check_in_at",{ascending:true})
.order("scheduled_at",{ascending:true})
.returns<Omit<FrontdeskQueueRow, "latest_vitals">[]>();

  if (queueError) {
    throw new Error(queueError.message);
  }

  const appointmentIds = (queueRowsRaw ?? [])
    .map((row) => row.appointment_id)
    .filter(Boolean);

  let latestVitals: FrontdeskQueueVitalsRow[] = [];

  if (appointmentIds.length > 0) {
    const { data: vitalsRows, error: vitalsError } = await supabase
      .from("latest_appointment_vitals_v")
      .select(
        [
          "appointment_id",
          "patient_id",
          "patient_vitals_id",
          "recorded_at",
          "source_type",
          "temperature_c",
          "blood_pressure_systolic",
          "blood_pressure_diastolic",
          "pulse_bpm",
          "respiratory_rate",
          "spo2",
          "weight_kg",
          "height_cm",
          "pain_score",
          "notes",
        ].join(", ")
      )
      .in("appointment_id", appointmentIds)
      .returns<FrontdeskQueueVitalsRow[]>();

    if (vitalsError) {
      throw new Error(vitalsError.message);
    }

    latestVitals = vitalsRows ?? [];
  }

  return {
    hospital,
    queueRows: withLatestVitals(queueRowsRaw ?? [], latestVitals),
  };
}
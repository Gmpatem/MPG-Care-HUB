import { redirect, notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type PageProps = {
  params: Promise<{
    hospitalSlug: string;
    appointmentId: string;
  }>;
};

type HospitalRow = {
  id: string;
  slug: string;
};

type AppointmentRow = {
  id: string;
  hospital_id: string;
  patient_id: string;
  staff_id: string | null;
  reason: string | null;
  visit_type: string | null;
  scheduled_at: string;
  status: string | null;
};

type EncounterRow = {
  id: string;
};

type LatestAppointmentVitalsRow = {
  appointment_id: string | null;
  patient_id: string;
  recorded_at: string;
  source_type: string | null;
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

function buildVitalsJson(vitals: LatestAppointmentVitalsRow | null) {
  if (!vitals) return {};

  return {
    source_type: vitals.source_type,
    recorded_at: vitals.recorded_at,
    height_cm: vitals.height_cm,
    weight_kg: vitals.weight_kg,
    temperature_c: vitals.temperature_c,
    blood_pressure_systolic: vitals.blood_pressure_systolic,
    blood_pressure_diastolic: vitals.blood_pressure_diastolic,
    pulse_bpm: vitals.pulse_bpm,
    respiratory_rate: vitals.respiratory_rate,
    spo2: vitals.spo2,
    pain_score: vitals.pain_score,
    notes: vitals.notes,
  };
}

export default async function DoctorOpenAppointmentEncounterPage({ params }: PageProps) {
  const { hospitalSlug, appointmentId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug")
    .eq("slug", hospitalSlug)
    .maybeSingle<HospitalRow>();

  if (hospitalError) {
    throw new Error(hospitalError.message);
  }

  if (!hospital) {
    notFound();
  }

  const { data: appointment, error: appointmentError } = await supabase
    .from("appointments")
    .select("id, hospital_id, patient_id, staff_id, reason, visit_type, scheduled_at, status")
    .eq("hospital_id", hospital.id)
    .eq("id", appointmentId)
    .maybeSingle<AppointmentRow>();

  if (appointmentError) {
    throw new Error(appointmentError.message);
  }

  if (!appointment) {
    notFound();
  }

  const { data: existingEncounter, error: existingEncounterError } = await supabase
    .from("encounters")
    .select("id")
    .eq("hospital_id", hospital.id)
    .eq("appointment_id", appointment.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle<EncounterRow>();

  if (existingEncounterError) {
    throw new Error(existingEncounterError.message);
  }

  if (existingEncounter) {
    redirect(`/h/${hospital.slug}/encounters/${existingEncounter.id}`);
  }

  const { data: latestVitals, error: vitalsError } = await supabase
    .from("latest_appointment_vitals_v")
    .select(
      [
        "appointment_id",
        "patient_id",
        "recorded_at",
        "source_type",
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
    .eq("appointment_id", appointment.id)
    .maybeSingle<LatestAppointmentVitalsRow>();

  if (vitalsError) {
    throw new Error(vitalsError.message);
  }

  const vitalsJson = buildVitalsJson(latestVitals ?? null);

  const { data: insertedEncounter, error: insertError } = await supabase
    .from("encounters")
    .insert({
      hospital_id: hospital.id,
      patient_id: appointment.patient_id,
      appointment_id: appointment.id,
      provider_staff_id: appointment.staff_id,
      encounter_datetime: new Date().toISOString(),
      started_at: new Date().toISOString(),
      status: "draft",
      stage: "initial_review",
      chief_complaint: appointment.reason ?? null,
      plan_notes: appointment.visit_type
        ? `Visit type: ${appointment.visit_type}`
        : null,
      vitals_json: vitalsJson,
      created_by_user_id: user.id,
    })
    .select("id")
    .single<EncounterRow>();

  if (insertError) {
    throw new Error(insertError.message);
  }

  redirect(`/h/${hospital.slug}/encounters/${insertedEncounter.id}`);
}
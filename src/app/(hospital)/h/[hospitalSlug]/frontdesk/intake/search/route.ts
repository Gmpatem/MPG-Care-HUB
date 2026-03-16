import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type PatientSearchRow = {
  id: string;
  patient_number: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  sex: string | null;
  date_of_birth: string | null;
  phone: string | null;
  email: string | null;
  address_text: string | null;
  status: string | null;
};

type FollowUpRow = {
  id: string;
  patient_id: string;
  follow_up_date: string;
  reason: string | null;
  status: string;
  doctor_staff_id: string | null;
  doctor: { id: string; full_name: string | null } | { id: string; full_name: string | null }[] | null;
};

function takeOne<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ hospitalSlug: string }> }
) {
  const { hospitalSlug } = await params;
  const query = request.nextUrl.searchParams.get("q")?.trim() ?? "";

  if (query.length < 2) {
    return NextResponse.json({ patients: [] });
  }

  const supabase = await createClient();

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id")
    .eq("slug", hospitalSlug)
    .maybeSingle<{ id: string }>();

  if (hospitalError) {
    return NextResponse.json({ error: hospitalError.message }, { status: 500 });
  }

  if (!hospital) {
    return NextResponse.json({ patients: [] }, { status: 404 });
  }

  const q = query.replace(/[%_]/g, "");

  const { data: patients, error: patientsError } = await supabase
    .from("patients")
    .select(`
      id,
      patient_number,
      first_name,
      middle_name,
      last_name,
      sex,
      date_of_birth,
      phone,
      email,
      address_text,
      status
    `)
    .eq("hospital_id", hospital.id)
    .or(
      [
        `patient_number.ilike.%${q}%`,
        `phone.ilike.%${q}%`,
        `first_name.ilike.%${q}%`,
        `last_name.ilike.%${q}%`,
        `middle_name.ilike.%${q}%`,
      ].join(",")
    )
    .order("created_at", { ascending: false })
    .limit(8)
    .returns<PatientSearchRow[]>();

  if (patientsError) {
    return NextResponse.json({ error: patientsError.message }, { status: 500 });
  }

  const patientIds = (patients ?? []).map((p) => p.id);
  const nowIso = new Date().toISOString();

  let followUps: FollowUpRow[] = [];
  if (patientIds.length > 0) {
    const { data } = await supabase
      .from("patient_follow_ups")
      .select(`
        id,
        patient_id,
        follow_up_date,
        reason,
        status,
        doctor_staff_id,
        doctor:staff (
          id,
          full_name
        )
      `)
      .eq("hospital_id", hospital.id)
      .eq("status", "planned")
      .gte("follow_up_date", nowIso)
      .in("patient_id", patientIds)
      .order("follow_up_date", { ascending: true })
      .returns<FollowUpRow[]>();

    followUps = data ?? [];
  }

  const followUpByPatientId = new Map<string, FollowUpRow>();
  for (const followUp of followUps) {
    if (!followUpByPatientId.has(followUp.patient_id)) {
      followUpByPatientId.set(followUp.patient_id, followUp);
    }
  }

  return NextResponse.json({
    patients: (patients ?? []).map((patient) => {
      const followUp = followUpByPatientId.get(patient.id) ?? null;
      const doctor = followUp ? takeOne(followUp.doctor) : null;

      return {
        ...patient,
        follow_up: followUp
          ? {
              id: followUp.id,
              follow_up_date: followUp.follow_up_date,
              reason: followUp.reason,
              doctor_staff_id: followUp.doctor_staff_id,
              doctor_name: doctor?.full_name ?? null,
            }
          : null,
      };
    }),
  });
}

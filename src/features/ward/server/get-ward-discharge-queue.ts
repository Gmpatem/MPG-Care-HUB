import { createClient } from "@/lib/supabase/server";
import { getDischargeReadiness } from "@/features/ward/server/get-discharge-readiness";
import { getAdmissionBillingSummary } from "@/features/billing/server/get-admission-billing-summary";

type HospitalRow = {
  id: string;
  slug: string;
  name: string;
};

type QueueAdmissionRow = {
  id: string;
  patient_id: string;
  encounter_id: string | null;
  ward_id: string;
  bed_id: string | null;
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
  admitting_doctor: {
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

export async function getWardDischargeQueue(hospitalSlug: string) {
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
      discharge_requested,
      discharge_requested_at,
      admission_reason,
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
      ),
      admitting_doctor:staff!admissions_admitting_doctor_staff_id_fkey (
        id,
        full_name
      )
    `)
    .eq("hospital_id", hospital.id)
    .eq("status", "admitted")
    .eq("discharge_requested", true)
    .order("discharge_requested_at", { ascending: true })
    .returns<QueueAdmissionRow[]>();

  if (admissionsError) throw new Error(admissionsError.message);

  const enriched = [];
  for (const row of admissions ?? []) {
    const normalized = {
      ...row,
      patient: takeOne(row.patient),
      ward: takeOne(row.ward),
      bed: takeOne(row.bed),
      admitting_doctor: takeOne(row.admitting_doctor),
    };

    const readiness = await getDischargeReadiness(
      hospital.id,
      row.id,
      row.patient_id,
      row.encounter_id
    );

    const billing = await getAdmissionBillingSummary(
      hospital.id,
      row.patient_id,
      row.encounter_id
    );

    enriched.push({
      ...normalized,
      readiness,
      billing,
    });
  }

  return {
    hospital,
    admissions: enriched,
  };
}
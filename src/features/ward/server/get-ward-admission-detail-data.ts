import { createClient } from "@/lib/supabase/server";
import { getAdmissionDischargeChecklist } from "@/features/ward/server/get-admission-discharge-checklist";
import { getAdmissionBillingSummary } from "@/features/billing/server/get-admission-billing-summary";

type HospitalRow = {
  id: string;
  slug: string;
  name: string;
};

export async function getWardAdmissionDetailData(
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
      ward_id,
      bed_id,
      admitted_at,
      discharge_requested,
      discharge_requested_at,
      admission_reason,
      discharge_notes,
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
    .maybeSingle();

  if (admissionError) throw new Error(admissionError.message);
  if (!admission) throw new Error("Admission not found.");

  const normalize = <T,>(value: T | T[] | null) =>
    Array.isArray(value) ? value[0] ?? null : value ?? null;

  const checklist = await getAdmissionDischargeChecklist(hospital.id, admissionId);
  const billing = await getAdmissionBillingSummary(
    hospital.id,
    admission.patient_id,
    admission.encounter_id
  );

  return {
    hospital,
    admission: {
      ...admission,
      patient: normalize(admission.patient),
      ward: normalize(admission.ward),
      bed: normalize(admission.bed),
      admitting_doctor: normalize(admission.admitting_doctor),
    },
    checklist,
    billing,
  };
}
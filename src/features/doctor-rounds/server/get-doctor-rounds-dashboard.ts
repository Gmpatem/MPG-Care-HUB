import { createClient } from "@/lib/supabase/server";

type HospitalRow = {
  id: string;
  name: string;
  slug: string;
};

type DoctorRoundDashboardRow = {
  admission_id: string;
  hospital_id: string;
  patient_id: string;
  patient_number: string | null;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  encounter_id: string | null;
  appointment_id: string | null;
  admitting_doctor_staff_id: string | null;
  admitting_doctor_name: string | null;
  ward_id: string | null;
  ward_name: string | null;
  ward_type: string | null;
  bed_id: string | null;
  bed_number: string | null;
  admission_status: string | null;
  admitted_at: string | null;
  discharge_requested: boolean | null;
  discharge_requested_at: string | null;
  discharge_notes: string | null;
  latest_round_id: string | null;
  latest_round_datetime: string | null;
  latest_round_discharge_recommended: boolean | null;
  latest_round_assessment_notes: string | null;
  latest_round_plan_notes: string | null;
};

export async function getDoctorRoundsDashboard(hospitalSlug: string) {
  const supabase = await createClient();

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, name, slug")
    .eq("slug", hospitalSlug)
    .maybeSingle<HospitalRow>();

  if (hospitalError) throw new Error(hospitalError.message);

  if (!hospital) {
    return {
      hospital: null,
      rows: [] as DoctorRoundDashboardRow[],
    };
  }

  const { data, error } = await supabase
    .from("doctor_inpatient_rounds_v")
    .select("*")
    .eq("hospital_id", hospital.id)
    .order("admitted_at", { ascending: false })
    .returns<DoctorRoundDashboardRow[]>();

  if (error) throw new Error(error.message);

  return {
    hospital,
    rows: data ?? [],
  };
}
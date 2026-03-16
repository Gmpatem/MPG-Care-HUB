import { createClient } from "@/lib/supabase/server";

type HospitalRow = {
  id: string;
  name: string;
  slug: string;
};

type AdmissionRow = {
  id: string;
  hospital_id: string;
  patient_id: string;
  encounter_id: string | null;
  ward_id: string | null;
  bed_id: string | null;
  admitted_at: string | null;
  status: string | null;
  patients: {
    id: string;
    patient_number: string | null;
    first_name: string;
    middle_name: string | null;
    last_name: string;
  } | null;
  wards: {
    id: string;
    name: string | null;
    ward_type: string | null;
  } | null;
  beds: {
    id: string;
    bed_number: string | null;
  } | null;
};

type StaffRow = {
  id: string;
  full_name: string;
  staff_type: string | null;
};

export async function getDoctorRoundFormData({
  hospitalSlug,
  admissionId,
}: {
  hospitalSlug: string;
  admissionId: string;
}) {
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
      admission: null as AdmissionRow | null,
      doctorStaff: [] as StaffRow[],
    };
  }

  const [admissionResult, staffResult] = await Promise.all([
    supabase
      .from("admissions")
      .select(`
        id,
        hospital_id,
        patient_id,
        encounter_id,
        ward_id,
        bed_id,
        admitted_at,
        status,
        patients (
          id,
          patient_number,
          first_name,
          middle_name,
          last_name
        ),
        wards (
          id,
          name,
          ward_type
        ),
        beds (
          id,
          bed_number
        )
      `)
      .eq("hospital_id", hospital.id)
      .eq("id", admissionId)
      .maybeSingle<AdmissionRow>(),

    supabase
      .from("staff")
      .select("id, full_name, staff_type")
      .eq("hospital_id", hospital.id)
      .eq("active", true)
      .order("full_name", { ascending: true })
      .returns<StaffRow[]>(),
  ]);

  if (admissionResult.error) throw new Error(admissionResult.error.message);
  if (staffResult.error) throw new Error(staffResult.error.message);

  return {
    hospital,
    admission: admissionResult.data ?? null,
    doctorStaff: (staffResult.data ?? []).filter(
      (s) => s.staff_type === "doctor" || s.staff_type === "general" || s.staff_type === null
    ),
  };
}
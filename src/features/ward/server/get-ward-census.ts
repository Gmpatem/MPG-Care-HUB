import { createClient } from "@/lib/supabase/server";

export async function getWardCensus(hospitalSlug: string) {
  const supabase = await createClient();

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug, name")
    .eq("slug", hospitalSlug)
    .maybeSingle<{ id: string; slug: string; name: string }>();

  if (hospitalError) throw new Error(hospitalError.message);
  if (!hospital) throw new Error("Hospital not found");

  const { data: wards, error: wardsError } = await supabase
    .from("wards")
    .select("id, code, name, ward_type, active")
    .eq("hospital_id", hospital.id)
    .order("name", { ascending: true });

  if (wardsError) throw new Error(wardsError.message);

  const { data: beds, error: bedsError } = await supabase
    .from("beds")
    .select("id, ward_id, bed_number, status, active")
    .eq("hospital_id", hospital.id)
    .order("bed_number", { ascending: true });

  if (bedsError) throw new Error(bedsError.message);

  const { data: admissions, error: admissionsError } = await supabase
    .from("admissions")
    .select(`
      id,
      patient_id,
      encounter_id,
      appointment_id,
      ward_id,
      bed_id,
      status,
      admitted_at,
      discharge_requested,
      discharge_requested_at,
      patient:patients (
        id,
        patient_number,
        first_name,
        middle_name,
        last_name,
        sex,
        phone
      ),
      bed:beds (
        id,
        bed_number
      ),
      ward:wards (
        id,
        name,
        code
      )
    `)
    .eq("hospital_id", hospital.id)
    .in("status", ["admitted"])
    .order("admitted_at", { ascending: false });

  if (admissionsError) throw new Error(admissionsError.message);

  const wardsWithStats = (wards ?? []).map((ward: any) => {
    const wardBeds = (beds ?? []).filter((bed: any) => bed.ward_id === ward.id);
    const wardAdmissions = (admissions ?? []).filter((admission: any) => admission.ward_id === ward.id);

    return {
      ...ward,
      total_beds: wardBeds.length,
      active_beds: wardBeds.filter((bed: any) => bed.active).length,
      occupied_beds: wardAdmissions.filter((admission: any) => admission.bed_id).length,
      patients: wardAdmissions.map((admission: any) => ({
        ...admission,
        patient: Array.isArray(admission.patient) ? admission.patient[0] ?? null : admission.patient ?? null,
        bed: Array.isArray(admission.bed) ? admission.bed[0] ?? null : admission.bed ?? null,
        ward: Array.isArray(admission.ward) ? admission.ward[0] ?? null : admission.ward ?? null,
      })),
    };
  });

  return {
    hospital,
    wards: wardsWithStats,
    admissions: (admissions ?? []).map((admission: any) => ({
      ...admission,
      patient: Array.isArray(admission.patient) ? admission.patient[0] ?? null : admission.patient ?? null,
      bed: Array.isArray(admission.bed) ? admission.bed[0] ?? null : admission.bed ?? null,
      ward: Array.isArray(admission.ward) ? admission.ward[0] ?? null : admission.ward ?? null,
    })),
  };
}
import { createClient } from "@/lib/supabase/server";

export async function getCreatePrescriptionPageData(
  hospitalSlug: string,
  patientId: string
) {
  const supabase = await createClient();

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug, name")
    .eq("slug", hospitalSlug)
    .maybeSingle<{ id: string; slug: string; name: string }>();

  if (hospitalError) throw new Error(hospitalError.message);
  if (!hospital) throw new Error("Hospital not found.");

  const { data: patient, error: patientError } = await supabase
    .from("patients")
    .select("id, patient_number, first_name, middle_name, last_name")
    .eq("hospital_id", hospital.id)
    .eq("id", patientId)
    .maybeSingle();

  if (patientError) throw new Error(patientError.message);
  if (!patient) throw new Error("Patient not found.");

  const { data: staff, error: staffError } = await supabase
    .from("staff")
    .select("id, full_name, staff_type, active")
    .eq("hospital_id", hospital.id)
    .eq("active", true)
    .order("full_name", { ascending: true });

  if (staffError) throw new Error(staffError.message);

  const { data: medications, error: medicationsError } = await supabase
    .from("medications")
    .select("id, code, generic_name, brand_name, form, strength, route, active")
    .eq("hospital_id", hospital.id)
    .eq("active", true)
    .order("generic_name", { ascending: true });

  if (medicationsError) throw new Error(medicationsError.message);

  const { data: encounters, error: encountersError } = await supabase
    .from("encounters")
    .select("id, encounter_datetime, status")
    .eq("hospital_id", hospital.id)
    .eq("patient_id", patientId)
    .order("encounter_datetime", { ascending: false });

  if (encountersError) throw new Error(encountersError.message);

  return {
    hospital,
    patient,
    staff: (staff ?? []).map((member) => ({
      id: member.id,
      full_name: member.full_name ?? "Unnamed staff",
    })),
    medications: medications ?? [],
    encounters: (encounters ?? []).map((encounter) => ({
      id: encounter.id,
      encounter_datetime: encounter.encounter_datetime,
      status: encounter.status,
    })),
  };
}

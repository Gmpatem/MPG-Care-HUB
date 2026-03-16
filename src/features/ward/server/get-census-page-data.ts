import { createClient } from "@/lib/supabase/server";

type HospitalRow = {
  id: string;
  slug: string;
  name: string;
};

type WardRow = {
  id: string;
  name: string;
  code: string | null;
  ward_type: string | null;
  active: boolean;
};

type BedRow = {
  id: string;
  ward_id: string;
  bed_number: string;
  status: string;
  active: boolean;
};

type AdmissionRow = {
  id: string;
  patient_id: string;
  encounter_id: string | null;
  ward_id: string;
  bed_id: string | null;
  admitting_doctor_staff_id: string | null;
  status: string;
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
    sex: string | null;
    phone: string | null;
  } | {
    id: string;
    patient_number: string | null;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    sex: string | null;
    phone: string | null;
  }[] | null;
  bed: {
    id: string;
    bed_number: string;
    status: string | null;
  } | {
    id: string;
    bed_number: string;
    status: string | null;
  }[] | null;
  ward: {
    id: string;
    name: string;
    code: string | null;
    ward_type: string | null;
  } | {
    id: string;
    name: string;
    code: string | null;
    ward_type: string | null;
  }[] | null;
  admitting_doctor: {
    id: string;
    full_name: string;
    specialty: string | null;
  } | {
    id: string;
    full_name: string;
    specialty: string | null;
  }[] | null;
};

function takeOne<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

export async function getCensusPageData(hospitalSlug: string) {
  const supabase = await createClient();

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug, name")
    .eq("slug", hospitalSlug)
    .maybeSingle<HospitalRow>();

  if (hospitalError) throw new Error(hospitalError.message);
  if (!hospital) throw new Error("Hospital not found");

  const [{ data: wards, error: wardsError }, { data: beds, error: bedsError }, { data: admissions, error: admissionsError }] =
    await Promise.all([
      supabase
        .from("wards")
        .select("id, name, code, ward_type, active")
        .eq("hospital_id", hospital.id)
        .eq("active", true)
        .order("name", { ascending: true }),
      supabase
        .from("beds")
        .select("id, ward_id, bed_number, status, active")
        .eq("hospital_id", hospital.id)
        .eq("active", true)
        .order("bed_number", { ascending: true }),
      supabase
        .from("admissions")
        .select(`
          id,
          patient_id,
          encounter_id,
          ward_id,
          bed_id,
          admitting_doctor_staff_id,
          status,
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
            sex,
            phone
          ),
          bed:beds (
            id,
            bed_number,
            status
          ),
          ward:wards (
            id,
            name,
            code,
            ward_type
          ),
          admitting_doctor:staff!admissions_admitting_doctor_staff_id_fkey (
            id,
            full_name,
            specialty
          )
        `)
        .eq("hospital_id", hospital.id)
        .eq("status", "admitted")
        .order("admitted_at", { ascending: false }),
    ]);

  if (wardsError) throw new Error(wardsError.message);
  if (bedsError) throw new Error(bedsError.message);
  if (admissionsError) throw new Error(admissionsError.message);

  const wardRows = (wards ?? []) as WardRow[];
  const bedRows = (beds ?? []) as BedRow[];
  const admissionRows = ((admissions ?? []) as AdmissionRow[]).map((row) => ({
    ...row,
    patient: takeOne(row.patient),
    bed: takeOne(row.bed),
    ward: takeOne(row.ward),
    admitting_doctor: takeOne(row.admitting_doctor),
  }));

  const admissionsByWardId = new Map<string, typeof admissionRows>();
  for (const admission of admissionRows) {
    const current = admissionsByWardId.get(admission.ward_id) ?? [];
    current.push(admission);
    admissionsByWardId.set(admission.ward_id, current);
  }

  const bedsByWardId = new Map<string, BedRow[]>();
  for (const bed of bedRows) {
    const current = bedsByWardId.get(bed.ward_id) ?? [];
    current.push(bed);
    bedsByWardId.set(bed.ward_id, current);
  }

  const wardSections = wardRows.map((ward) => {
    const wardAdmissions = admissionsByWardId.get(ward.id) ?? [];
    const wardBeds = bedsByWardId.get(ward.id) ?? [];
    const occupiedBedIds = new Set(
      wardAdmissions.map((admission) => admission.bed_id).filter((value): value is string => Boolean(value))
    );

    return {
      ...ward,
      admissions: wardAdmissions,
      beds: wardBeds,
      total_beds: wardBeds.length,
      occupied_beds: wardBeds.filter((bed) => occupiedBedIds.has(bed.id)).length,
      available_beds: wardBeds.filter((bed) => !occupiedBedIds.has(bed.id)).length,
      discharge_requested_count: wardAdmissions.filter((admission) => admission.discharge_requested).length,
    };
  });

  return {
    hospital,
    wards: wardSections,
    stats: {
      total_wards: wardSections.length,
      total_admissions: admissionRows.length,
      discharge_requested: admissionRows.filter((admission) => admission.discharge_requested).length,
      total_beds: bedRows.length,
      occupied_beds: wardSections.reduce((sum, ward) => sum + ward.occupied_beds, 0),
      available_beds: wardSections.reduce((sum, ward) => sum + ward.available_beds, 0),
    },
  };
}
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
  status: string;
  active: boolean;
};

type AdmissionRow = {
  id: string;
  patient_id: string;
  encounter_id: string | null;
  appointment_id: string | null;
  admitting_doctor_staff_id: string | null;
  ward_id: string;
  bed_id: string | null;
  status: string;
  admitted_at: string;
  discharged_at: string | null;
  admission_reason: string | null;
  discharge_notes: string | null;
  discharge_requested: boolean;
  discharge_requested_at: string | null;
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
  bed: {
    id: string;
    bed_number: string;
    status: string | null;
  } | {
    id: string;
    bed_number: string;
    status: string | null;
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

export async function getWardDashboardData(hospitalSlug: string) {
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
        .select("id, ward_id, status, active")
        .eq("hospital_id", hospital.id)
        .eq("active", true),
      supabase
        .from("admissions")
        .select(`
          id,
          patient_id,
          encounter_id,
          appointment_id,
          admitting_doctor_staff_id,
          ward_id,
          bed_id,
          status,
          admitted_at,
          discharged_at,
          admission_reason,
          discharge_notes,
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
    ward: takeOne(row.ward),
    bed: takeOne(row.bed),
    admitting_doctor: takeOne(row.admitting_doctor),
  }));

  const dischargeRequested = admissionRows.filter((row) => row.discharge_requested);
  const newlyAdmitted = admissionRows.filter((row) => {
    const admittedAt = new Date(row.admitted_at).getTime();
    const now = Date.now();
    const hours24 = 24 * 60 * 60 * 1000;
    return now - admittedAt <= hours24;
  });

  const occupiedBedIds = new Set(
    admissionRows.map((row) => row.bed_id).filter((value): value is string => Boolean(value))
  );

  const wardSummaries = wardRows.map((ward) => {
    const wardBeds = bedRows.filter((bed) => bed.ward_id === ward.id);
    const wardAdmissions = admissionRows.filter((admission) => admission.ward_id === ward.id);

    const totalBeds = wardBeds.length;
    const occupiedBeds = wardBeds.filter((bed) => occupiedBedIds.has(bed.id)).length;
    const availableBeds = Math.max(totalBeds - occupiedBeds, 0);

    return {
      ...ward,
      total_beds: totalBeds,
      occupied_beds: occupiedBeds,
      available_beds: availableBeds,
      active_admissions: wardAdmissions.length,
      discharge_requested_count: wardAdmissions.filter((admission) => admission.discharge_requested).length,
    };
  });

  return {
    hospital,
    wards: wardSummaries,
    admissions: admissionRows,
    stats: {
      total_wards: wardSummaries.length,
      active_admissions: admissionRows.length,
      discharge_requested: dischargeRequested.length,
      newly_admitted: newlyAdmitted.length,
      available_beds: wardSummaries.reduce((sum, ward) => sum + ward.available_beds, 0),
      occupied_beds: wardSummaries.reduce((sum, ward) => sum + ward.occupied_beds, 0),
      total_beds: wardSummaries.reduce((sum, ward) => sum + ward.total_beds, 0),
    },
  };
}
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
  active: boolean;
  status: string;
};

type AdmissionRow = {
  id: string;
  patient_id: string;
  ward_id: string;
  bed_id: string | null;
  admitted_at: string;
  discharged_at: string | null;
  discharge_requested: boolean;
  admitting_doctor_staff_id: string | null;
  patient: {
    id: string;
    patient_number: string | null;
    first_name: string;
    middle_name: string | null;
    last_name: string;
  } | {
    id: string;
    patient_number: string | null;
    first_name: string;
    middle_name: string | null;
    last_name: string;
  }[] | null;
  ward: {
    id: string;
    name: string;
  } | {
    id: string;
    name: string;
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

type AppointmentRow = {
  id: string;
  scheduled_at: string;
  status: string;
  queue_number: number | null;
  staff_id: string | null;
};

type StaffRow = {
  id: string;
  full_name: string;
  staff_type: string | null;
  specialty: string | null;
  active: boolean;
};

type VitalRow = {
  admission_id: string | null;
  recorded_at: string;
};

function takeOne<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function startOfDayIso(date = new Date()) {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy.toISOString();
}

function endOfDayIso(date = new Date()) {
  const copy = new Date(date);
  copy.setHours(23, 59, 59, 999);
  return copy.toISOString();
}

function hoursBetween(fromIso: string | null, toIso: string) {
  if (!fromIso) return null;
  const from = new Date(fromIso).getTime();
  const to = new Date(toIso).getTime();
  if (Number.isNaN(from) || Number.isNaN(to)) return null;
  return Math.floor((to - from) / (1000 * 60 * 60));
}

export async function getHospitalCommandDashboardData(hospitalSlug: string) {
  const supabase = await createClient();

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug, name")
    .eq("slug", hospitalSlug)
    .maybeSingle<HospitalRow>();

  if (hospitalError) throw new Error(hospitalError.message);
  if (!hospital) throw new Error("Hospital not found");

  const todayStart = startOfDayIso();
  const todayEnd = endOfDayIso();

  const [
    { data: wards, error: wardsError },
    { data: beds, error: bedsError },
    { data: activeAdmissions, error: activeAdmissionsError },
    { data: dischargedToday, error: dischargedTodayError },
    { data: appointmentsToday, error: appointmentsTodayError },
    { data: staffRows, error: staffRowsError },
  ] = await Promise.all([
    supabase
      .from("wards")
      .select("id, name, code, ward_type, active")
      .eq("hospital_id", hospital.id)
      .eq("active", true)
      .order("name", { ascending: true })
      .returns<WardRow[]>(),

    supabase
      .from("beds")
      .select("id, ward_id, active, status")
      .eq("hospital_id", hospital.id)
      .eq("active", true)
      .returns<BedRow[]>(),

    supabase
      .from("admissions")
      .select(`
        id,
        patient_id,
        ward_id,
        bed_id,
        admitted_at,
        discharged_at,
        discharge_requested,
        admitting_doctor_staff_id,
        patient:patients (
          id,
          patient_number,
          first_name,
          middle_name,
          last_name
        ),
        ward:wards (
          id,
          name
        ),
        admitting_doctor:staff!admissions_admitting_doctor_staff_id_fkey (
          id,
          full_name,
          specialty
        )
      `)
      .eq("hospital_id", hospital.id)
      .eq("status", "admitted")
      .order("admitted_at", { ascending: false })
      .returns<AdmissionRow[]>(),

    supabase
      .from("admissions")
      .select("id")
      .eq("hospital_id", hospital.id)
      .gte("discharged_at", todayStart)
      .lte("discharged_at", todayEnd),

    supabase
      .from("appointments")
      .select("id, scheduled_at, status, queue_number, staff_id")
      .eq("hospital_id", hospital.id)
      .gte("scheduled_at", todayStart)
      .lte("scheduled_at", todayEnd)
      .order("queue_number", { ascending: true })
      .returns<AppointmentRow[]>(),

    supabase
      .from("staff")
      .select("id, full_name, staff_type, specialty, active")
      .eq("hospital_id", hospital.id)
      .eq("active", true)
      .returns<StaffRow[]>(),
  ]);

  if (wardsError) throw new Error(wardsError.message);
  if (bedsError) throw new Error(bedsError.message);
  if (activeAdmissionsError) throw new Error(activeAdmissionsError.message);
  if (dischargedTodayError) throw new Error(dischargedTodayError.message);
  if (appointmentsTodayError) throw new Error(appointmentsTodayError.message);
  if (staffRowsError) throw new Error(staffRowsError.message);

  const normalizedAdmissions = (activeAdmissions ?? []).map((row) => ({
    ...row,
    patient: takeOne(row.patient),
    ward: takeOne(row.ward),
    admitting_doctor: takeOne(row.admitting_doctor),
  }));

  const activeAdmissionIds = normalizedAdmissions.map((row) => row.id);

  let latestVitalsByAdmission = new Map<string, VitalRow>();
  if (activeAdmissionIds.length > 0) {
    const { data: vitals, error: vitalsError } = await supabase
      .from("patient_vitals")
      .select("admission_id, recorded_at")
      .eq("hospital_id", hospital.id)
      .in("admission_id", activeAdmissionIds)
      .order("recorded_at", { ascending: false })
      .returns<VitalRow[]>();

    if (vitalsError) throw new Error(vitalsError.message);

    for (const row of vitals ?? []) {
      if (!row.admission_id) continue;
      if (!latestVitalsByAdmission.has(row.admission_id)) {
        latestVitalsByAdmission.set(row.admission_id, row);
      }
    }
  }

  const nowIso = new Date().toISOString();

  const bedsList = beds ?? [];
  const wardsList = wards ?? [];
  const appointmentsList = appointmentsToday ?? [];
  const staffList = staffRows ?? [];

  const occupiedBedIds = new Set(
    normalizedAdmissions.map((row) => row.bed_id).filter((value): value is string => Boolean(value))
  );

  const wardLoad = wardsList.map((ward) => {
    const wardBeds = bedsList.filter((bed) => bed.ward_id === ward.id);
    const wardAdmissions = normalizedAdmissions.filter((admission) => admission.ward_id === ward.id);
    const occupiedBeds = wardBeds.filter((bed) => occupiedBedIds.has(bed.id)).length;
    const availableBeds = Math.max(wardBeds.length - occupiedBeds, 0);

    return {
      id: ward.id,
      name: ward.name,
      code: ward.code,
      ward_type: ward.ward_type,
      active_admissions: wardAdmissions.length,
      occupied_beds: occupiedBeds,
      available_beds: availableBeds,
      discharge_requested: wardAdmissions.filter((admission) => admission.discharge_requested).length,
    };
  });

  const doctorStaff = staffList.filter((row) => row.staff_type === "doctor");
  const doctorWorkload = doctorStaff.map((doctor) => {
    const activeInpatients = normalizedAdmissions.filter(
      (admission) => admission.admitting_doctor_staff_id === doctor.id
    ).length;

    const todayAppointments = appointmentsList.filter(
      (appointment) => appointment.staff_id === doctor.id
    ).length;

    return {
      id: doctor.id,
      full_name: doctor.full_name,
      specialty: doctor.specialty,
      active_inpatients: activeInpatients,
      today_queue: todayAppointments,
      total_load: activeInpatients + todayAppointments,
    };
  }).sort((a, b) => b.total_load - a.total_load);

  const nurseAttentionAdmissions = normalizedAdmissions.map((admission) => {
    const latestVital = latestVitalsByAdmission.get(admission.id) ?? null;
    const hoursSinceLatestVitals = latestVital
      ? hoursBetween(latestVital.recorded_at, nowIso)
      : null;

    const vitalsState =
      latestVital == null
        ? "missing"
        : (hoursSinceLatestVitals ?? 9999) >= 8
        ? "overdue"
        : (hoursSinceLatestVitals ?? 9999) >= 4
        ? "due"
        : "fresh";

    return {
      admission_id: admission.id,
      ward_name: admission.ward?.name ?? "Unknown",
      patient_name: admission.patient
        ? [admission.patient.first_name, admission.patient.middle_name, admission.patient.last_name]
            .filter(Boolean)
            .join(" ")
        : "Unknown patient",
      vitals_state: vitalsState,
      discharge_requested: admission.discharge_requested,
    };
  });

  const nurseWorkload = {
    discharge_requested: nurseAttentionAdmissions.filter((row) => row.discharge_requested).length,
    overdue_vitals: nurseAttentionAdmissions.filter((row) => row.vitals_state === "overdue").length,
    missing_vitals: nurseAttentionAdmissions.filter((row) => row.vitals_state === "missing").length,
    due_vitals: nurseAttentionAdmissions.filter((row) => row.vitals_state === "due").length,
  };

  const frontdeskQueue = appointmentsList.filter((row) =>
    ["scheduled", "checked_in"].includes(row.status)
  );

  return {
    hospital,
    stats: {
      active_admissions: normalizedAdmissions.length,
      discharged_today: (dischargedToday ?? []).length,
      total_beds: bedsList.length,
      occupied_beds: occupiedBedIds.size,
      available_beds: Math.max(bedsList.length - occupiedBedIds.size, 0),
      discharge_requested: normalizedAdmissions.filter((row) => row.discharge_requested).length,
      todays_queue: frontdeskQueue.length,
    },
    ward_load: wardLoad,
    doctor_workload: doctorWorkload,
    nurse_workload: nurseWorkload,
    frontdesk_queue: frontdeskQueue.slice(0, 10),
  };
}
import { createClient } from "@/lib/supabase/server";

type DoctorCandidate = {
  id: string;
  full_name: string;
  staff_type: string | null;
};

type ShiftRow = {
  staff_id: string;
  staff: DoctorCandidate | DoctorCandidate[] | null;
};

type QueueLoadRow = {
  staff_id: string | null;
};

type AvailableDoctor = {
  id: string;
  full_name: string;
  staff_type: string | null;
  queue_count: number;
};

function takeOne<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function isDoctorCandidate(
  staff: DoctorCandidate | null
): staff is DoctorCandidate {
  return (
    staff !== null &&
    (staff.staff_type === "doctor" ||
      staff.staff_type === "general" ||
      staff.staff_type === null)
  );
}

export async function getAvailableDoctors(
  hospitalId: string
): Promise<AvailableDoctor[]> {
  const supabase = await createClient();
  const nowIso = new Date().toISOString();

  const { data: shifts, error: shiftsError } = await supabase
    .from("staff_shifts")
    .select(`
      staff_id,
      staff:staff (
        id,
        full_name,
        staff_type
      )
    `)
    .eq("hospital_id", hospitalId)
    .in("status", ["scheduled", "active"])
    .lte("shift_start", nowIso)
    .gte("shift_end", nowIso)
    .returns<ShiftRow[]>();

  if (shiftsError) {
    throw new Error(shiftsError.message);
  }

  const doctors = (shifts ?? [])
    .map((row) => takeOne(row.staff))
    .filter(isDoctorCandidate);

  const doctorIds = doctors.map((doctor) => doctor.id);

  if (doctorIds.length === 0) {
    return [];
  }

  const { data: queueRows, error: queueError } = await supabase
    .from("appointments")
    .select("staff_id")
    .eq("hospital_id", hospitalId)
    .in("staff_id", doctorIds)
    .in("status", ["scheduled", "checked_in"])
    .returns<QueueLoadRow[]>();

  if (queueError) {
    throw new Error(queueError.message);
  }

  const loadMap = new Map<string, number>();

  for (const doctor of doctors) {
    loadMap.set(doctor.id, 0);
  }

  for (const row of queueRows ?? []) {
    if (!row.staff_id) continue;
    loadMap.set(row.staff_id, (loadMap.get(row.staff_id) ?? 0) + 1);
  }

  return doctors
    .map((doctor) => ({
      ...doctor,
      queue_count: loadMap.get(doctor.id) ?? 0,
    }))
    .sort(
      (a, b) =>
        a.queue_count - b.queue_count ||
        a.full_name.localeCompare(b.full_name)
    );
}

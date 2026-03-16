import { createClient } from "@/lib/supabase/server";

type HospitalRow = {
  id: string;
  slug: string;
  name: string;
};

type PrescriptionRow = {
  id: string;
  patient_id: string;
  encounter_id: string | null;
  status: string;
  prescribed_at: string;
  notes: string | null;
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
};

type PrescriptionItemRow = {
  id: string;
  prescription_id: string;
  medication_id: string | null;
  medication_name: string;
  quantity_prescribed: number | null;
  status: string;
};

type BatchRow = {
  id: string;
  medication_id: string;
  quantity_available: number;
};

type DispensationRow = {
  id: string;
  prescription_id: string | null;
  dispensed_at: string;
  status: string;
};

function takeOne<T>(value: T | T[] | null): T | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

function fullName(patient: {
  first_name: string;
  middle_name: string | null;
  last_name: string;
} | null) {
  if (!patient) return "Unknown patient";
  return [patient.first_name, patient.middle_name, patient.last_name].filter(Boolean).join(" ");
}

export async function getPharmacyDashboardData(hospitalSlug: string) {
  const supabase = await createClient();

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug, name")
    .eq("slug", hospitalSlug)
    .maybeSingle<HospitalRow>();

  if (hospitalError) throw new Error(hospitalError.message);
  if (!hospital) throw new Error("Hospital not found.");

  const [prescriptionsRes, itemsRes, batchesRes, dispensationsRes] = await Promise.all([
    supabase
      .from("prescriptions")
      .select(`
        id,
        patient_id,
        encounter_id,
        status,
        prescribed_at,
        notes,
        patient:patients (
          id,
          patient_number,
          first_name,
          middle_name,
          last_name
        )
      `)
      .eq("hospital_id", hospital.id)
      .order("prescribed_at", { ascending: false })
      .returns<PrescriptionRow[]>(),

    supabase
      .from("prescription_items")
      .select("id, prescription_id, medication_id, medication_name, quantity_prescribed, status")
      .eq("hospital_id", hospital.id)
      .returns<PrescriptionItemRow[]>(),

    supabase
      .from("pharmacy_stock_batches")
      .select("id, medication_id, quantity_available")
      .eq("hospital_id", hospital.id)
      .returns<BatchRow[]>(),

    supabase
      .from("dispensations")
      .select("id, prescription_id, dispensed_at, status")
      .eq("hospital_id", hospital.id)
      .order("dispensed_at", { ascending: false })
      .returns<DispensationRow[]>(),
  ]);

  if (prescriptionsRes.error) throw new Error(prescriptionsRes.error.message);
  if (itemsRes.error) throw new Error(itemsRes.error.message);
  if (batchesRes.error) throw new Error(batchesRes.error.message);
  if (dispensationsRes.error) throw new Error(dispensationsRes.error.message);

  const itemsByPrescriptionId = new Map<string, PrescriptionItemRow[]>();
  for (const item of itemsRes.data ?? []) {
    const current = itemsByPrescriptionId.get(item.prescription_id) ?? [];
    current.push(item);
    itemsByPrescriptionId.set(item.prescription_id, current);
  }

  const stockByMedicationId = new Map<string, number>();
  for (const batch of batchesRes.data ?? []) {
    const current = stockByMedicationId.get(batch.medication_id) ?? 0;
    stockByMedicationId.set(batch.medication_id, current + Number(batch.quantity_available ?? 0));
  }

  const completedTodayStart = new Date();
  completedTodayStart.setHours(0, 0, 0, 0);

  const completedToday = (dispensationsRes.data ?? []).filter(
    (row) =>
      row.status === "completed" &&
      new Date(row.dispensed_at).getTime() >= completedTodayStart.getTime()
  );

  const rows = (prescriptionsRes.data ?? []).map((row) => {
    const patient = takeOne(row.patient);
    const items = itemsByPrescriptionId.get(row.id) ?? [];

    const stockReady = items.length > 0 && items.every((item) => {
      if (!item.medication_id) return false;
      const available = stockByMedicationId.get(item.medication_id) ?? 0;
      const needed = Number(item.quantity_prescribed ?? 0);
      return available > 0 && available >= needed;
    });

    const stockBlocked = items.some((item) => {
      if (!item.medication_id) return true;
      const available = stockByMedicationId.get(item.medication_id) ?? 0;
      const needed = Number(item.quantity_prescribed ?? 0);
      return available <= 0 || available < needed;
    });

    return {
      id: row.id,
      status: row.status,
      prescribed_at: row.prescribed_at,
      patient_full_name: fullName(patient),
      patient_number: patient?.patient_number ?? null,
      item_count: items.length,
      stock_ready: stockReady,
      stock_blocked: stockBlocked,
    };
  });

  return {
    hospital,
    stats: {
      total_prescriptions: rows.length,
      ready_to_dispense: rows.filter((row) => row.stock_ready).length,
      stock_blocked: rows.filter((row) => row.stock_blocked).length,
      completed_today: completedToday.length,
    },
    rows,
  };
}
import { createClient } from "@/lib/supabase/server";

type HospitalRow = {
  id: string;
  slug: string;
  name: string;
};

type PatientLite =
  | {
      id: string;
      patient_number: string | null;
      first_name: string;
      middle_name: string | null;
      last_name: string;
    }
  | {
      id: string;
      patient_number: string | null;
      first_name: string;
      middle_name: string | null;
      last_name: string;
    }[]
  | null;

type PrescriptionItemLiteRow = {
  id: string;
  prescription_id: string;
  status: string;
  medication_id: string | null;
};

type BatchStockRow = {
  medication_id: string;
  quantity_available: number | null;
};

function fullName(patient: PatientLite) {
  const value = Array.isArray(patient) ? patient[0] ?? null : patient;
  if (!value) return "Unknown patient";

  return [value.first_name, value.middle_name, value.last_name]
    .filter(Boolean)
    .join(" ");
}

export async function getPharmacyDashboardData(hospitalSlug: string) {
  const supabase = await createClient();
  const startedAt = Date.now();

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug, name")
    .eq("slug", hospitalSlug)
    .maybeSingle<HospitalRow>();

  if (hospitalError) throw new Error(hospitalError.message);
  if (!hospital) throw new Error("Hospital not found.");

  const hospitalId = hospital.id;

  const [prescriptionsResult, dispensationsResult] = await Promise.all([
    supabase
      .from("prescriptions")
      .select(`
        id,
        patient_id,
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
      .eq("hospital_id", hospitalId)
      .order("prescribed_at", { ascending: false })
      .limit(16),

    supabase
      .from("dispensations")
      .select("id, status, dispensed_at")
      .eq("hospital_id", hospitalId)
      .order("dispensed_at", { ascending: false })
      .limit(100),
  ]);

  if (prescriptionsResult.error) throw new Error(prescriptionsResult.error.message);
  if (dispensationsResult.error) throw new Error(dispensationsResult.error.message);

  const prescriptions = prescriptionsResult.data ?? [];
  const dispensations = dispensationsResult.data ?? [];

  const prescriptionIds = prescriptions.map((row) => row.id);

  let itemRows: PrescriptionItemLiteRow[] = [];

  if (prescriptionIds.length > 0) {
    const { data, error } = await supabase
      .from("prescription_items")
      .select("id, prescription_id, status, medication_id")
      .eq("hospital_id", hospitalId)
      .in("prescription_id", prescriptionIds);

    if (error) throw new Error(error.message);
    itemRows = (data ?? []) as PrescriptionItemLiteRow[];
  }

  const medicationIds = Array.from(
    new Set(
      itemRows
        .map((item) => item.medication_id)
        .filter((value): value is string => Boolean(value))
    )
  );

  let batchRows: BatchStockRow[] = [];

  if (medicationIds.length > 0) {
    const { data, error } = await supabase
      .from("pharmacy_stock_batches")
      .select("medication_id, quantity_available")
      .eq("hospital_id", hospitalId)
      .in("medication_id", medicationIds)
      .gt("quantity_available", 0);

    if (error) throw new Error(error.message);
    batchRows = (data ?? []) as BatchStockRow[];
  }

  const stockByMedication = new Map<string, number>();
  for (const row of batchRows) {
    const current = stockByMedication.get(row.medication_id) ?? 0;
    stockByMedication.set(
      row.medication_id,
      current + Number(row.quantity_available ?? 0)
    );
  }

  const itemsByPrescription = new Map<string, PrescriptionItemLiteRow[]>();
  for (const item of itemRows) {
    const current = itemsByPrescription.get(item.prescription_id) ?? [];
    current.push(item);
    itemsByPrescription.set(item.prescription_id, current);
  }

  const normalized = prescriptions.map((row) => {
    const patient = Array.isArray(row.patient) ? row.patient[0] ?? null : row.patient ?? null;
    const items = itemsByPrescription.get(row.id) ?? [];

    const itemCount = items.length;
    const dispensedCount = items.filter((item) => item.status === "dispensed").length;
    const partialCount = items.filter((item) => item.status === "partially_dispensed").length;
    const pendingCount = items.filter((item) => item.status === "pending").length;

    const stockReadyCount = items.filter((item) => {
      if (!item.medication_id) return false;
      return (stockByMedication.get(item.medication_id) ?? 0) > 0;
    }).length;

    const noStockCount = items.filter((item) => {
      if (!item.medication_id) return true;
      return (stockByMedication.get(item.medication_id) ?? 0) <= 0;
    }).length;

    const completionRatio =
      itemCount > 0 ? Math.round((dispensedCount / itemCount) * 100) : 0;

    return {
      ...row,
      patient,
      patient_full_name: fullName(patient),
      patient_number: patient?.patient_number ?? "No patient number",
      item_count: itemCount,
      dispensed_count: dispensedCount,
      partial_count: partialCount,
      pending_count: pendingCount,
      stock_ready_count: stockReadyCount,
      no_stock_count: noStockCount,
      stock_ready: itemCount > 0 && noStockCount === 0,
      stock_blocked: noStockCount > 0,
      completion_ratio: completionRatio,
    };
  });

  const readyToDispense = normalized.filter(
    (row) => row.status === "active" || row.status === "pending"
  ).length;

  const stockBlocked = normalized.filter((row) => row.stock_blocked).length;

  const completedTodayCount = dispensations.filter((row) => {
    if (!row.dispensed_at) return false;

    const today = new Date();
    const value = new Date(row.dispensed_at);

    return (
      value.getFullYear() === today.getFullYear() &&
      value.getMonth() === today.getMonth() &&
      value.getDate() === today.getDate()
    );
  }).length;

  const rows = normalized.slice(0, 8);

  console.log("[perf] getPharmacyDashboardData", Date.now() - startedAt, "ms");

  return {
    hospital,
    stats: {
      total_prescriptions: normalized.length,
      ready_to_dispense: readyToDispense,
      stock_blocked: stockBlocked,
      completed_today: completedTodayCount,
    },
    rows,
    queue: rows,
    recentDispensations: dispensations.slice(0, 8),
  };
}

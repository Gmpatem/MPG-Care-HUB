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
  prescribed_by_staff_id: string | null;
  status: string;
  notes: string | null;
  prescribed_at: string;
  patient: any;
  prescribed_by_staff: any;
  prescription_items:
    | Array<{
        id: string;
        status: string;
        medication_id: string | null;
        medication_name: string;
        quantity_prescribed: number | null;
      }>
    | null;
};

type BatchStockRow = {
  medication_id: string;
  quantity_available: number | null;
};

export async function getPharmacyQueueData(hospitalSlug: string) {
  const supabase = await createClient();

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug, name")
    .eq("slug", hospitalSlug)
    .maybeSingle<HospitalRow>();

  if (hospitalError) throw new Error(hospitalError.message);
  if (!hospital) throw new Error("Hospital not found");

  const { data: prescriptions, error: prescriptionsError } = await supabase
    .from("prescriptions")
    .select(`
      id,
      patient_id,
      encounter_id,
      prescribed_by_staff_id,
      status,
      notes,
      prescribed_at,
      patient:patients (
        id,
        patient_number,
        first_name,
        middle_name,
        last_name,
        sex,
        phone
      ),
      prescribed_by_staff:staff (
        id,
        full_name
      ),
      prescription_items (
        id,
        status,
        medication_id,
        medication_name,
        quantity_prescribed
      )
    `)
    .eq("hospital_id", hospital.id)
    .order("prescribed_at", { ascending: false });

  if (prescriptionsError) throw new Error(prescriptionsError.message);

  const rows = (prescriptions ?? []) as PrescriptionRow[];

  const medicationIds = Array.from(
    new Set(
      rows.flatMap((row) =>
        (row.prescription_items ?? [])
          .map((item) => item.medication_id)
          .filter((value): value is string => Boolean(value))
      )
    )
  );

  let batchRows: BatchStockRow[] = [];

  if (medicationIds.length > 0) {
    const { data, error } = await supabase
      .from("pharmacy_stock_batches")
      .select("medication_id, quantity_available")
      .eq("hospital_id", hospital.id)
      .in("medication_id", medicationIds)
      .gt("quantity_available", 0);

    if (error) throw new Error(error.message);
    batchRows = (data ?? []) as BatchStockRow[];
  }

  const stockByMedication = new Map<string, number>();
  for (const row of batchRows) {
    const current = stockByMedication.get(row.medication_id) ?? 0;
    stockByMedication.set(row.medication_id, current + Number(row.quantity_available ?? 0));
  }

  const normalized = rows.map((row) => {
    const patient = Array.isArray(row.patient) ? row.patient[0] ?? null : row.patient ?? null;
    const prescribedByStaff = Array.isArray(row.prescribed_by_staff)
      ? row.prescribed_by_staff[0] ?? null
      : row.prescribed_by_staff ?? null;
    const items = Array.isArray(row.prescription_items) ? row.prescription_items : [];

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

    const completionRatio = items.length > 0 ? Math.round((dispensedCount / items.length) * 100) : 0;

    let workflowBucket: "incoming" | "partial" | "completed" = "incoming";
    if (row.status === "dispensed" || (items.length > 0 && dispensedCount === items.length)) {
      workflowBucket = "completed";
    } else if (partialCount > 0 || dispensedCount > 0 || row.status === "partially_dispensed") {
      workflowBucket = "partial";
    }

    return {
      ...row,
      patient,
      prescribed_by_staff: prescribedByStaff,
      prescription_items: items,
      item_count: items.length,
      dispensed_count: dispensedCount,
      partial_count: partialCount,
      pending_count: pendingCount,
      stock_ready_count: stockReadyCount,
      no_stock_count: noStockCount,
      completion_ratio: completionRatio,
      workflow_bucket: workflowBucket,
      source_label: prescribedByStaff?.full_name ? "doctor_prescribed" : "prescription_received",
    };
  });

  return {
    hospital,
    prescriptions: normalized,
  };
}
import { createClient } from "@/lib/supabase/server";

type HospitalRow = {
  id: string;
  slug: string;
  name: string;
};

type PrescriptionBaseRow = {
  id: string;
  patient_id: string;
  encounter_id: string | null;
  prescribed_by_staff_id: string | null;
  status: string;
  notes: string | null;
  prescribed_at: string;
  patient: any;
  prescribed_by_staff: any;
};

type PrescriptionItemRow = {
  id: string;
  prescription_id: string;
  medication_id: string | null;
  medication_name: string;
  dose: string | null;
  frequency: string | null;
  duration: string | null;
  route: string | null;
  quantity_prescribed: number | null;
  instructions: string | null;
  status: string;
  medication: any;
};

type BatchRow = {
  id: string;
  medication_id: string;
  batch_number: string;
  expiry_date: string | null;
  quantity_available: number | null;
  selling_price: number | null;
  supplier_name: string | null;
  received_at: string | null;
};

export async function getPrescriptionDetailData(hospitalSlug: string, prescriptionId: string) {
  const supabase = await createClient();

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug, name")
    .eq("slug", hospitalSlug)
    .maybeSingle<HospitalRow>();

  if (hospitalError) throw new Error(hospitalError.message);
  if (!hospital) throw new Error("Hospital not found");

  const { data: prescription, error: prescriptionError } = await supabase
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
      )
    `)
    .eq("hospital_id", hospital.id)
    .eq("id", prescriptionId)
    .maybeSingle<PrescriptionBaseRow>();

  if (prescriptionError) throw new Error(prescriptionError.message);
  if (!prescription) throw new Error("Prescription not found");

  const { data: items, error: itemsError } = await supabase
    .from("prescription_items")
    .select(`
      id,
      prescription_id,
      medication_id,
      medication_name,
      dose,
      frequency,
      duration,
      route,
      quantity_prescribed,
      instructions,
      status,
      medication:medications (
        id,
        code,
        generic_name,
        brand_name,
        form,
        strength,
        unit,
        route
      )
    `)
    .eq("hospital_id", hospital.id)
    .eq("prescription_id", prescriptionId)
    .order("created_at", { ascending: true });

  if (itemsError) throw new Error(itemsError.message);

  const itemRows = (items ?? []) as PrescriptionItemRow[];

  const medicationIds = Array.from(
    new Set(itemRows.map((item) => item.medication_id).filter((value): value is string => Boolean(value)))
  );

  let batches: BatchRow[] = [];
  if (medicationIds.length > 0) {
    const { data: batchRows, error: batchError } = await supabase
      .from("pharmacy_stock_batches")
      .select(`
        id,
        medication_id,
        batch_number,
        expiry_date,
        quantity_available,
        selling_price,
        supplier_name,
        received_at
      `)
      .eq("hospital_id", hospital.id)
      .in("medication_id", medicationIds)
      .gt("quantity_available", 0)
      .order("expiry_date", { ascending: true, nullsFirst: false })
      .order("received_at", { ascending: true, nullsFirst: true });

    if (batchError) throw new Error(batchError.message);
    batches = (batchRows ?? []) as BatchRow[];
  }

  const { data: dispensations, error: dispensationsError } = await supabase
    .from("dispensations")
    .select(`
      id,
      prescription_id,
      status,
      dispensed_at,
      notes,
      dispensed_by_staff_id,
      dispensed_by_staff:staff (
        id,
        full_name
      ),
      dispensation_items (
        id,
        prescription_item_id,
        medication_id,
        batch_id,
        quantity_dispensed,
        unit_price,
        line_total
      )
    `)
    .eq("hospital_id", hospital.id)
    .eq("prescription_id", prescriptionId)
    .order("dispensed_at", { ascending: false });

  if (dispensationsError) throw new Error(dispensationsError.message);

  const normalizedDispensations = (dispensations ?? []).map((row: any) => ({
    ...row,
    dispensed_by_staff: Array.isArray(row.dispensed_by_staff)
      ? row.dispensed_by_staff[0] ?? null
      : row.dispensed_by_staff ?? null,
  }));

  const dispensedByItemId = new Map<string, number>();

  for (const dispensation of normalizedDispensations) {
    const dispensationItems = Array.isArray(dispensation.dispensation_items)
      ? dispensation.dispensation_items
      : [];

    for (const entry of dispensationItems) {
      const key = String(entry.prescription_item_id ?? "");
      if (!key) continue;
      const current = dispensedByItemId.get(key) ?? 0;
      dispensedByItemId.set(key, current + Number(entry.quantity_dispensed ?? 0));
    }
  }

  const itemsWithBatches = itemRows.map((item) => {
    const availableBatches = batches.filter((batch) => batch.medication_id === item.medication_id);
    const totalAvailableStock = availableBatches.reduce(
      (sum, batch) => sum + Number(batch.quantity_available ?? 0),
      0
    );
    const alreadyDispensed = dispensedByItemId.get(item.id) ?? 0;
    const prescribedQty = Number(item.quantity_prescribed ?? 0);
    const remainingQuantity = Math.max(prescribedQty - alreadyDispensed, 0);

    return {
      ...item,
      medication: Array.isArray(item.medication) ? item.medication[0] ?? null : item.medication ?? null,
      available_batches: availableBatches,
      total_available_stock: totalAvailableStock,
      already_dispensed_quantity: alreadyDispensed,
      remaining_quantity: prescribedQty > 0 ? remainingQuantity : 0,
      preferred_batch_id: availableBatches[0]?.id ?? null,
      is_fully_dispensed: item.status === "dispensed" || (prescribedQty > 0 && alreadyDispensed >= prescribedQty),
    };
  });

  return {
    hospital,
    prescription: {
      ...prescription,
      patient: Array.isArray((prescription as any).patient)
        ? (prescription as any).patient[0] ?? null
        : (prescription as any).patient ?? null,
      prescribed_by_staff: Array.isArray((prescription as any).prescribed_by_staff)
        ? (prescription as any).prescribed_by_staff[0] ?? null
        : (prescription as any).prescribed_by_staff ?? null,
    },
    items: itemsWithBatches,
    dispensations: normalizedDispensations,
  };
}
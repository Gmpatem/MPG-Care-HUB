import { createClient } from "@/lib/supabase/server";

type MedicationRow = {
  id: string;
  code: string | null;
  generic_name: string;
  brand_name: string | null;
  form: string;
  strength: string | null;
  unit: string | null;
  route: string | null;
  reorder_level: number | null;
  active: boolean;
};

type BatchRow = {
  id: string;
  medication_id: string;
  batch_number: string;
  expiry_date: string | null;
  quantity_received: number;
  quantity_available: number;
  unit_cost: number;
  selling_price: number;
  supplier_name: string | null;
  received_at: string;
};

export async function getPharmacySetupData(hospitalSlug: string) {
  const supabase = await createClient();

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug, name")
    .eq("slug", hospitalSlug)
    .maybeSingle<{ id: string; slug: string; name: string }>();

  if (hospitalError) throw new Error(hospitalError.message);
  if (!hospital) throw new Error("Hospital not found.");

  const [medicationsRes, batchesRes] = await Promise.all([
    supabase
      .from("medications")
      .select("id, code, generic_name, brand_name, form, strength, unit, route, reorder_level, active")
      .eq("hospital_id", hospital.id)
      .order("generic_name", { ascending: true })
      .returns<MedicationRow[]>(),

    supabase
      .from("pharmacy_stock_batches")
      .select("id, medication_id, batch_number, expiry_date, quantity_received, quantity_available, unit_cost, selling_price, supplier_name, received_at")
      .eq("hospital_id", hospital.id)
      .order("received_at", { ascending: false })
      .returns<BatchRow[]>(),
  ]);

  if (medicationsRes.error) throw new Error(medicationsRes.error.message);
  if (batchesRes.error) throw new Error(batchesRes.error.message);

  return {
    hospital,
    medications: medicationsRes.data ?? [],
    batches: batchesRes.data ?? [],
  };
}
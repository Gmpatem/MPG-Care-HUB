"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type CreatePharmacyStockBatchState = {
  success?: boolean;
  error?: string;
};

export async function createPharmacyStockBatch(
  hospitalSlug: string,
  _prevState: CreatePharmacyStockBatchState,
  formData: FormData
): Promise<CreatePharmacyStockBatchState> {
  const supabase = await createClient();

  const medicationId = String(formData.get("medication_id") ?? "").trim();
  const batchNumber = String(formData.get("batch_number") ?? "").trim();
  const expiryDate = String(formData.get("expiry_date") ?? "").trim() || null;
  const quantityReceivedRaw = String(formData.get("quantity_received") ?? "0").trim();
  const quantityAvailableRaw = String(formData.get("quantity_available") ?? "").trim();
  const unitCostRaw = String(formData.get("unit_cost") ?? "0").trim();
  const sellingPriceRaw = String(formData.get("selling_price") ?? "0").trim();
  const supplierName = String(formData.get("supplier_name") ?? "").trim() || null;

  if (!medicationId) return { error: "Medication is required." };
  if (!batchNumber) return { error: "Batch number is required." };

  const quantityReceived = Number.parseFloat(quantityReceivedRaw);
  const quantityAvailable = quantityAvailableRaw
    ? Number.parseFloat(quantityAvailableRaw)
    : quantityReceived;
  const unitCost = Number.parseFloat(unitCostRaw);
  const sellingPrice = Number.parseFloat(sellingPriceRaw);

  if (Number.isNaN(quantityReceived) || quantityReceived < 0) {
    return { error: "Quantity received must be zero or greater." };
  }
  if (Number.isNaN(quantityAvailable) || quantityAvailable < 0) {
    return { error: "Quantity available must be zero or greater." };
  }
  if (Number.isNaN(unitCost) || unitCost < 0) {
    return { error: "Unit cost must be zero or greater." };
  }
  if (Number.isNaN(sellingPrice) || sellingPrice < 0) {
    return { error: "Selling price must be zero or greater." };
  }

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug")
    .eq("slug", hospitalSlug)
    .maybeSingle<{ id: string; slug: string }>();

  if (hospitalError) return { error: hospitalError.message };
  if (!hospital) return { error: "Hospital not found." };

  const { data: medication, error: medicationError } = await supabase
    .from("medications")
    .select("id")
    .eq("hospital_id", hospital.id)
    .eq("id", medicationId)
    .maybeSingle();

  if (medicationError) return { error: medicationError.message };
  if (!medication) return { error: "Selected medication was not found." };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error: insertError } = await supabase
    .from("pharmacy_stock_batches")
    .insert({
      hospital_id: hospital.id,
      medication_id: medicationId,
      batch_number: batchNumber,
      expiry_date: expiryDate,
      quantity_received: quantityReceived,
      quantity_available: quantityAvailable,
      unit_cost: unitCost,
      selling_price: sellingPrice,
      supplier_name: supplierName,
      created_by_user_id: user?.id ?? null,
    });

  if (insertError) return { error: insertError.message };

  revalidatePath(`/h/${hospital.slug}/admin/pharmacy-stock`);
  revalidatePath(`/h/${hospital.slug}/pharmacy`);

  return { success: true };
}
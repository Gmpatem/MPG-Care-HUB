"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { addAutomatedCharge } from "@/features/billing/server/automation";

export type DispensePrescriptionItemState = {
  success?: boolean;
  message?: string;
};

async function getScopedHospital(hospitalSlug: string) {
  const supabase = await createClient();

  const { data: hospital, error } = await supabase
    .from("hospitals")
    .select("id, slug")
    .eq("slug", hospitalSlug)
    .maybeSingle<{ id: string; slug: string }>();

  if (error) throw new Error(error.message);
  if (!hospital) throw new Error("Hospital not found");

  return { supabase, hospital };
}

export async function dispensePrescriptionItem(
  hospitalSlug: string,
  prescriptionId: string,
  prescriptionItemId: string,
  _prevState: DispensePrescriptionItemState,
  formData: FormData,
): Promise<DispensePrescriptionItemState> {
  try {
    const { supabase, hospital } = await getScopedHospital(hospitalSlug);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, message: "You must be signed in." };
    }

    const { data: membership, error: membershipError } = await supabase
      .from("hospital_users")
      .select("id, status")
      .eq("hospital_id", hospital.id)
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle<{ id: string; status: string }>();

    if (membershipError) return { success: false, message: membershipError.message };
    if (!membership) return { success: false, message: "You do not have access to this hospital." };

    const { data: pharmacistStaff } = await supabase
      .from("staff")
      .select("id")
      .eq("hospital_id", hospital.id)
      .eq("hospital_user_id", membership.id)
      .maybeSingle<{ id: string }>();

    const batchId = String(formData.get("batch_id") ?? "").trim();
    const quantityDispensed = Number(formData.get("quantity_dispensed") ?? 0);
    const notes = String(formData.get("notes") ?? "").trim() || null;

    if (!batchId) {
      return { success: false, message: "Select a stock batch." };
    }

    if (!Number.isFinite(quantityDispensed) || quantityDispensed <= 0) {
      return { success: false, message: "Quantity dispensed must be greater than zero." };
    }

    const { data: prescription, error: prescriptionError } = await supabase
      .from("prescriptions")
      .select("id, patient_id, status")
      .eq("hospital_id", hospital.id)
      .eq("id", prescriptionId)
      .maybeSingle<{ id: string; patient_id: string; status: string }>();

    if (prescriptionError) return { success: false, message: prescriptionError.message };
    if (!prescription) return { success: false, message: "Prescription not found." };

    const { data: item, error: itemError } = await supabase
      .from("prescription_items")
      .select("id, medication_id, medication_name, quantity_prescribed, status")
      .eq("hospital_id", hospital.id)
      .eq("prescription_id", prescriptionId)
      .eq("id", prescriptionItemId)
      .maybeSingle<{
        id: string;
        medication_id: string | null;
        medication_name: string;
        quantity_prescribed: number | null;
        status: string;
      }>();

    if (itemError) return { success: false, message: itemError.message };
    if (!item) return { success: false, message: "Prescription item not found." };

    const { data: batch, error: batchError } = await supabase
      .from("pharmacy_stock_batches")
      .select("id, medication_id, quantity_available, selling_price")
      .eq("hospital_id", hospital.id)
      .eq("id", batchId)
      .maybeSingle<{
        id: string;
        medication_id: string;
        quantity_available: number;
        selling_price: number;
      }>();

    if (batchError) return { success: false, message: batchError.message };
    if (!batch) return { success: false, message: "Selected stock batch not found." };

    if (item.medication_id && batch.medication_id !== item.medication_id) {
      return { success: false, message: "Selected batch does not belong to this medication." };
    }

    if (Number(batch.quantity_available) < quantityDispensed) {
      return { success: false, message: "Not enough stock in the selected batch." };
    }

    const prescribedQty = Number(item.quantity_prescribed ?? 0);

    const { data: previousDispensedRows, error: previousDispensedError } = await supabase
      .from("dispensation_items")
      .select("quantity_dispensed")
      .eq("hospital_id", hospital.id)
      .eq("prescription_item_id", prescriptionItemId);

    if (previousDispensedError) {
      return { success: false, message: previousDispensedError.message };
    }

    const alreadyDispensed = (previousDispensedRows ?? []).reduce(
      (sum: number, row: any) => sum + Number(row.quantity_dispensed ?? 0),
      0
    );

    const newTotalDispensed = alreadyDispensed + quantityDispensed;

    let nextItemStatus: "pending" | "partially_dispensed" | "dispensed" = "pending";
    if (newTotalDispensed <= 0) {
      nextItemStatus = "pending";
    } else if (prescribedQty > 0 && newTotalDispensed < prescribedQty) {
      nextItemStatus = "partially_dispensed";
    } else {
      nextItemStatus = "dispensed";
    }

    const unitPrice = Number(batch.selling_price ?? 0);
    const lineTotal = unitPrice * quantityDispensed;

    const { data: dispensation, error: dispensationError } = await supabase
      .from("dispensations")
      .insert({
        hospital_id: hospital.id,
        patient_id: prescription.patient_id,
        prescription_id: prescription.id,
        dispensed_by_staff_id: pharmacistStaff?.id ?? null,
        status: "completed",
        dispensed_at: new Date().toISOString(),
        notes,
        created_by_user_id: user.id,
      })
      .select("id")
      .maybeSingle<{ id: string }>();

    if (dispensationError) {
      return { success: false, message: dispensationError.message };
    }

    if (!dispensation) {
      return { success: false, message: "Failed to create dispensation record." };
    }

    const { data: dispensationItem, error: dispensationItemError } = await supabase
      .from("dispensation_items")
      .insert({
        hospital_id: hospital.id,
        dispensation_id: dispensation.id,
        prescription_item_id: prescriptionItemId,
        medication_id: batch.medication_id,
        batch_id: batch.id,
        quantity_dispensed: quantityDispensed,
        unit_price: unitPrice,
        line_total: lineTotal,
      })
      .select("id, medication_id")
      .maybeSingle<{ id: string; medication_id: string }>();

    if (dispensationItemError) {
      return { success: false, message: dispensationItemError.message };
    }

    if (!dispensationItem) {
      return { success: false, message: "Failed to create dispensation item." };
    }

    try {
      await addAutomatedCharge({
        hospitalId: hospital.id,
        patientId: prescription.patient_id,
        createdByUserId: user.id,
        itemType: "pharmacy",
        description: item.medication_name,
        quantity: quantityDispensed,
        unitPrice,
        sourceEntityType: "dispensation_item",
        sourceEntityId: dispensationItem.id,
        catalogItemId: dispensationItem.medication_id,
      });
    } catch (billingError) {
      return {
        success: false,
        message:
          billingError instanceof Error
            ? `Medication dispensed, but billing sync failed: ${billingError.message}`
            : "Medication dispensed, but billing sync failed.",
      };
    }

    const { error: stockError } = await supabase
      .from("pharmacy_stock_batches")
      .update({
        quantity_available: Number(batch.quantity_available) - quantityDispensed,
        updated_at: new Date().toISOString(),
      })
      .eq("hospital_id", hospital.id)
      .eq("id", batch.id);

    if (stockError) {
      return { success: false, message: stockError.message };
    }

    const { error: itemUpdateError } = await supabase
      .from("prescription_items")
      .update({
        status: nextItemStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("hospital_id", hospital.id)
      .eq("id", prescriptionItemId);

    if (itemUpdateError) {
      return { success: false, message: itemUpdateError.message };
    }

    const { data: refreshedItems, error: refreshedItemsError } = await supabase
      .from("prescription_items")
      .select("id, status")
      .eq("hospital_id", hospital.id)
      .eq("prescription_id", prescriptionId);

    if (refreshedItemsError) {
      return { success: false, message: refreshedItemsError.message };
    }

    const statuses = (refreshedItems ?? []).map((row: any) => row.status);

    let nextPrescriptionStatus: "active" | "partially_dispensed" | "dispensed" | "cancelled" = "active";
    if (statuses.length > 0 && statuses.every((status: string) => status === "dispensed")) {
      nextPrescriptionStatus = "dispensed";
    } else if (statuses.some((status: string) => status === "partially_dispensed" || status === "dispensed")) {
      nextPrescriptionStatus = "partially_dispensed";
    } else if (statuses.every((status: string) => status === "cancelled")) {
      nextPrescriptionStatus = "cancelled";
    }

    const { error: prescriptionUpdateError } = await supabase
      .from("prescriptions")
      .update({
        status: nextPrescriptionStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("hospital_id", hospital.id)
      .eq("id", prescriptionId);

    if (prescriptionUpdateError) {
      return { success: false, message: prescriptionUpdateError.message };
    }

    revalidatePath(`/h/${hospital.slug}/pharmacy`);
    revalidatePath(`/h/${hospital.slug}/pharmacy/prescriptions/${prescriptionId}`);
    revalidatePath(`/h/${hospital.slug}/billing`);
    revalidatePath(`/h/${hospital.slug}/billing/invoices`);
    revalidatePath(`/h/${hospital.slug}/billing/payments`);
    revalidatePath(`/h/${hospital.slug}/billing`);
    revalidatePath(`/h/${hospital.slug}/billing/invoices`);
    revalidatePath(`/h/${hospital.slug}/billing/payments`);

    return {
      success: true,
      message: "Medication dispensed successfully.",
    };
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to dispense prescription item.",
    };
  }
}




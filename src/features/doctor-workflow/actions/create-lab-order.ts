"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { addAutomatedCharge } from "@/features/billing/server/automation";

type ActionState = {
  error?: string;
};

function readSelectedTests(formData: FormData) {
  const values = formData.getAll("lab_test_ids").map((v) => String(v).trim()).filter(Boolean);
  return Array.from(new Set(values));
}

export async function createLabOrder(
  hospitalSlug: string,
  patientId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();

  const ordered_by_staff_id = String(formData.get("ordered_by_staff_id") ?? "").trim() || null;
  const encounter_id = String(formData.get("encounter_id") ?? "").trim() || null;
  const appointment_id = String(formData.get("appointment_id") ?? "").trim() || null;
  const priority = String(formData.get("priority") ?? "routine").trim() || "routine";
  const clinical_notes = String(formData.get("clinical_notes") ?? "").trim() || null;
  const selectedLabTestIds = readSelectedTests(formData);

  if (!patientId) {
    return { error: "Patient is required." };
  }

  if (selectedLabTestIds.length === 0) {
    return { error: "Select at least one lab test." };
  }

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug")
    .eq("slug", hospitalSlug)
    .maybeSingle<{ id: string; slug: string }>();

  if (hospitalError) {
    return { error: hospitalError.message };
  }

  if (!hospital) {
    return { error: "Hospital not found." };
  }

  const { data: tests, error: testsError } = await supabase
    .from("lab_test_catalog")
    .select("id, name, price")
    .eq("hospital_id", hospital.id)
    .in("id", selectedLabTestIds)
    .returns<{ id: string; name: string; price: number | null }[]>();

  if (testsError) {
    return { error: testsError.message };
  }

  if (!tests || tests.length === 0) {
    return { error: "Selected lab tests were not found." };
  }

  const { data: labOrder, error: labOrderError } = await supabase
    .from("lab_orders")
    .insert({
      hospital_id: hospital.id,
      patient_id: patientId,
      encounter_id,
      appointment_id,
      ordered_by_staff_id,
      priority,
      clinical_notes,
      status: "ordered",
      created_by_user_id: null,
    })
    .select("id")
    .maybeSingle<{ id: string }>();

  if (labOrderError) {
    return { error: labOrderError.message };
  }

  if (!labOrder) {
    return { error: "Lab order could not be created." };
  }

  const itemPayload = tests.map((test) => ({
    hospital_id: hospital.id,
    lab_order_id: labOrder.id,
    lab_test_id: test.id,
    test_name: test.name,
    status: "pending",
  }));

  const { data: createdItems, error: itemsError } = await supabase
    .from("lab_order_items")
    .insert(itemPayload)
    .select("id, lab_test_id, test_name")
    .returns<{ id: string; lab_test_id: string | null; test_name: string }[]>();

  if (itemsError) {
    return { error: itemsError.message };
  }

  const priceByTestId = new Map(
    (tests ?? []).map((test) => [test.id, Number(test.price ?? 0)])
  );

  try {
    for (const createdItem of createdItems ?? []) {
      await addAutomatedCharge({
        hospitalId: hospital.id,
        patientId,
        appointmentId: appointment_id,
        encounterId: encounter_id,
        itemType: "lab",
        description: createdItem.test_name,
        quantity: 1,
        unitPrice: Number(
          createdItem.lab_test_id ? priceByTestId.get(createdItem.lab_test_id) ?? 0 : 0
        ),
        sourceEntityType: "lab_order_item",
        sourceEntityId: createdItem.id,
        catalogItemId: createdItem.lab_test_id ?? null,
      });
    }
  } catch (billingError) {
    return {
      error:
        billingError instanceof Error
          ? `Lab order created, but billing sync failed: ${billingError.message}`
          : "Lab order created, but billing sync failed.",
    };
  }

  revalidatePath(`/h/${hospitalSlug}/doctor`);
  revalidatePath(`/h/${hospitalSlug}/doctor/patients/${patientId}`);
  revalidatePath(`/h/${hospitalSlug}/frontdesk`);
  revalidatePath(`/h/${hospitalSlug}/frontdesk/queue`);
  revalidatePath(`/h/${hospitalSlug}/billing`);
  revalidatePath(`/h/${hospitalSlug}/billing/invoices`);
  revalidatePath(`/h/${hospitalSlug}/billing/payments`);

  redirect(`/h/${hospitalSlug}/doctor/patients/${patientId}`);
}





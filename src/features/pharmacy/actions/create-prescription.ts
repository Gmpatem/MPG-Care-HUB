"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

type ActionState = {
  error?: string;
};

function readItems(formData: FormData) {
  const medicationIds = formData.getAll("medication_id").map(String);
  const medicationNames = formData.getAll("medication_name").map(String);
  const doses = formData.getAll("dose").map(String);
  const frequencies = formData.getAll("frequency").map(String);
  const durations = formData.getAll("duration").map(String);
  const routes = formData.getAll("route").map(String);
  const quantities = formData
    .getAll("quantity_prescribed")
    .map((value) => Number(value));
  const instructions = formData.getAll("instructions").map(String);

  return medicationNames
    .map((medication_name, index) => ({
      medication_id: medicationIds[index]?.trim() || null,
      medication_name: medication_name.trim(),
      dose: doses[index]?.trim() || null,
      frequency: frequencies[index]?.trim() || null,
      duration: durations[index]?.trim() || null,
      route: routes[index]?.trim() || null,
      quantity_prescribed:
        Number.isFinite(quantities[index]) && quantities[index] > 0
          ? quantities[index]
          : null,
      instructions: instructions[index]?.trim() || null,
    }))
    .filter((item) => item.medication_name.length > 0);
}

export async function createPrescription(
  hospitalSlug: string,
  patientId: string,
  _prevState: ActionState,
  formData: FormData
): Promise<ActionState> {
  const supabase = await createClient();

  const prescribed_by_staff_id =
    String(formData.get("prescribed_by_staff_id") ?? "").trim() || null;
  const encounter_id =
    String(formData.get("encounter_id") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;
  const items = readItems(formData);

  if (!patientId) return { error: "Patient is required." };
  if (items.length === 0) return { error: "Add at least one medication item." };

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "You must be signed in." };

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug")
    .eq("slug", hospitalSlug)
    .maybeSingle<{ id: string; slug: string }>();

  if (hospitalError) return { error: hospitalError.message };
  if (!hospital) return { error: "Hospital not found." };

  const { data: prescription, error: prescriptionError } = await supabase
    .from("prescriptions")
    .insert({
      hospital_id: hospital.id,
      patient_id: patientId,
      encounter_id,
      prescribed_by_staff_id,
      status: "active",
      notes,
      prescribed_at: new Date().toISOString(),
      created_by_user_id: user.id,
    })
    .select("id")
    .maybeSingle<{ id: string }>();

  if (prescriptionError) return { error: prescriptionError.message };
  if (!prescription) return { error: "Prescription could not be created." };

  const itemPayload = items.map((item) => ({
    hospital_id: hospital.id,
    prescription_id: prescription.id,
    medication_id: item.medication_id,
    medication_name: item.medication_name,
    dose: item.dose,
    frequency: item.frequency,
    duration: item.duration,
    route: item.route,
    quantity_prescribed: item.quantity_prescribed,
    instructions: item.instructions,
    status: "pending",
  }));

  const { error: itemsError } = await supabase
    .from("prescription_items")
    .insert(itemPayload);

  if (itemsError) return { error: itemsError.message };

  revalidatePath(`/h/${hospitalSlug}/doctor`);
  revalidatePath(`/h/${hospitalSlug}/doctor/patients/${patientId}`);
  revalidatePath(`/h/${hospitalSlug}/pharmacy`);

  redirect(`/h/${hospitalSlug}/doctor/patients/${patientId}`);
}

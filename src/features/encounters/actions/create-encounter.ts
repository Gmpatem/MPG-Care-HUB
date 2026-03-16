"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { createEncounterSchema } from "@/features/encounters/schemas/encounter.schema";

export async function createEncounter(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const values = {
    hospital_id: String(formData.get("hospital_id") ?? ""),
    patient_id: String(formData.get("patient_id") ?? ""),
    appointment_id: String(formData.get("appointment_id") ?? ""),
    chief_complaint: String(formData.get("chief_complaint") ?? ""),
    history_notes: String(formData.get("history_notes") ?? ""),
    assessment_notes: String(formData.get("assessment_notes") ?? ""),
    plan_notes: String(formData.get("plan_notes") ?? ""),
    diagnosis_text: String(formData.get("diagnosis_text") ?? ""),
    final_notes: String(formData.get("final_notes") ?? ""),
    requires_lab: String(formData.get("requires_lab") ?? ""),
    temperature: String(formData.get("temperature") ?? ""),
    blood_pressure: String(formData.get("blood_pressure") ?? ""),
    pulse_rate: String(formData.get("pulse_rate") ?? ""),
    respiratory_rate: String(formData.get("respiratory_rate") ?? ""),
    oxygen_saturation: String(formData.get("oxygen_saturation") ?? ""),
    weight_kg: String(formData.get("weight_kg") ?? ""),
  };

  const parsed = createEncounterSchema.safeParse(values);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid encounter data");
  }

  const { data: hospital } = await supabase
    .from("hospitals")
    .select("id, slug")
    .eq("id", parsed.data.hospital_id)
    .maybeSingle();

  if (!hospital) {
    throw new Error("Hospital not found");
  }

  const { data: patient } = await supabase
    .from("patients")
    .select("id")
    .eq("id", parsed.data.patient_id)
    .eq("hospital_id", parsed.data.hospital_id)
    .maybeSingle();

  if (!patient) {
    throw new Error("Patient not found in this hospital");
  }

  if (parsed.data.appointment_id) {
    const { data: appointment } = await supabase
      .from("appointments")
      .select("id")
      .eq("id", parsed.data.appointment_id)
      .eq("hospital_id", parsed.data.hospital_id)
      .eq("patient_id", parsed.data.patient_id)
      .maybeSingle();

    if (!appointment) {
      throw new Error("Appointment not found for this patient in this hospital");
    }
  }

  const vitals = {
    temperature: parsed.data.temperature || null,
    blood_pressure: parsed.data.blood_pressure || null,
    pulse_rate: parsed.data.pulse_rate || null,
    respiratory_rate: parsed.data.respiratory_rate || null,
    oxygen_saturation: parsed.data.oxygen_saturation || null,
    weight_kg: parsed.data.weight_kg || null,
  };

  const requiresLab = parsed.data.requires_lab === "on";

  const { data: inserted, error } = await supabase
    .from("encounters")
    .insert({
      hospital_id: parsed.data.hospital_id,
      patient_id: parsed.data.patient_id,
      appointment_id: parsed.data.appointment_id || null,
      encounter_datetime: new Date().toISOString(),
      started_at: new Date().toISOString(),
      status: "draft",
      stage: requiresLab ? "awaiting_results" : "initial_review",
      requires_lab: requiresLab,
      chief_complaint: parsed.data.chief_complaint || null,
      history_notes: parsed.data.history_notes || null,
      assessment_notes: parsed.data.assessment_notes || null,
      plan_notes: parsed.data.plan_notes || null,
      diagnosis_text: parsed.data.diagnosis_text || null,
      final_notes: parsed.data.final_notes || null,
      vitals_json: vitals,
      created_by_user_id: user.id,
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/h/${hospital.slug}/encounters`);
  redirect(`/h/${hospital.slug}/encounters/${inserted.id}`);
}
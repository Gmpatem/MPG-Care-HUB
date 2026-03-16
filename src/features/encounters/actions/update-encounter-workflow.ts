"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

async function getHospitalBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hospitals")
    .select("id, slug")
    .eq("slug", slug)
    .maybeSingle<{ id: string; slug: string }>();

  if (error) throw new Error(error.message);
  if (!data) throw new Error("Hospital not found");

  return { supabase, hospital: data };
}

export async function markEncounterAwaitingResults(hospitalSlug: string, encounterId: string) {
  const { supabase, hospital } = await getHospitalBySlug(hospitalSlug);

  const { error } = await supabase
    .from("encounters")
    .update({
      stage: "awaiting_results",
      requires_lab: true,
      status: "draft",
      started_at: new Date().toISOString(),
    })
    .eq("hospital_id", hospital.id)
    .eq("id", encounterId);

  if (error) throw new Error(error.message);

  revalidatePath(`/h/${hospital.slug}/encounters`);
  revalidatePath(`/h/${hospital.slug}/encounters/${encounterId}`);
}

export async function markEncounterResultsReview(hospitalSlug: string, encounterId: string) {
  const { supabase, hospital } = await getHospitalBySlug(hospitalSlug);

  const { error } = await supabase
    .from("encounters")
    .update({
      stage: "results_review",
      results_reviewed_at: new Date().toISOString(),
      status: "draft",
    })
    .eq("hospital_id", hospital.id)
    .eq("id", encounterId);

  if (error) throw new Error(error.message);

  revalidatePath(`/h/${hospital.slug}/encounters`);
  revalidatePath(`/h/${hospital.slug}/encounters/${encounterId}`);
}

export async function markEncounterTreatmentDecided(hospitalSlug: string, encounterId: string) {
  const { supabase, hospital } = await getHospitalBySlug(hospitalSlug);

  const { error } = await supabase
    .from("encounters")
    .update({
      stage: "treatment_decided",
      disposition_type: "outpatient_treatment",
      final_decision_at: new Date().toISOString(),
      status: "draft",
    })
    .eq("hospital_id", hospital.id)
    .eq("id", encounterId);

  if (error) throw new Error(error.message);

  revalidatePath(`/h/${hospital.slug}/encounters`);
  revalidatePath(`/h/${hospital.slug}/encounters/${encounterId}`);
}

export async function markEncounterAdmissionRequested(hospitalSlug: string, encounterId: string) {
  const { supabase, hospital } = await getHospitalBySlug(hospitalSlug);

  const { error } = await supabase
    .from("encounters")
    .update({
      stage: "admission_requested",
      disposition_type: "admission",
      admission_requested: true,
      final_decision_at: new Date().toISOString(),
      status: "draft",
    })
    .eq("hospital_id", hospital.id)
    .eq("id", encounterId);

  if (error) throw new Error(error.message);

  revalidatePath(`/h/${hospital.slug}/encounters`);
  revalidatePath(`/h/${hospital.slug}/encounters/${encounterId}`);
}

export async function finalizeEncounterWorkflow(hospitalSlug: string, encounterId: string) {
  const { supabase, hospital } = await getHospitalBySlug(hospitalSlug);

  const { error } = await supabase
    .from("encounters")
    .update({
      stage: "completed",
      status: "finalized",
      finalized_at: new Date().toISOString(),
      final_decision_at: new Date().toISOString(),
    })
    .eq("hospital_id", hospital.id)
    .eq("id", encounterId);

  if (error) throw new Error(error.message);

  revalidatePath(`/h/${hospital.slug}/encounters`);
  revalidatePath(`/h/${hospital.slug}/encounters/${encounterId}`);
}
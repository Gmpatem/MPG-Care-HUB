"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type EncounterWorkflowActionState = {
  success?: boolean;
  message?: string;
};

async function getHospitalBySlug(slug: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("hospitals")
    .select("id, slug")
    .eq("slug", slug)
    .maybeSingle<{ id: string; slug: string }>();

  if (error) {
    return { error: error.message, supabase: null, hospital: null };
  }

  if (!data) {
    return { error: "Hospital not found.", supabase: null, hospital: null };
  }

  return { error: null, supabase, hospital: data };
}

async function updateEncounterStage(
  hospitalSlug: string,
  encounterId: string,
  updates: Record<string, unknown>,
  successMessage: string
): Promise<EncounterWorkflowActionState> {
  const { error: hospitalLookupError, supabase, hospital } = await getHospitalBySlug(hospitalSlug);

  if (hospitalLookupError || !supabase || !hospital) {
    return {
      success: false,
      message: hospitalLookupError ?? "Hospital not found.",
    };
  }

  const { error } = await supabase
    .from("encounters")
    .update(updates)
    .eq("hospital_id", hospital.id)
    .eq("id", encounterId);

  if (error) {
    return {
      success: false,
      message: error.message || "Failed to update encounter workflow.",
    };
  }

  revalidatePath(`/h/${hospital.slug}/encounters`);
  revalidatePath(`/h/${hospital.slug}/encounters/${encounterId}`);
  revalidatePath(`/h/${hospital.slug}/doctor`);
  revalidatePath(`/h/${hospital.slug}/doctor/patients`);

  return {
    success: true,
    message: successMessage,
  };
}

export async function markEncounterAwaitingResults(
  hospitalSlug: string,
  encounterId: string,
  _prevState: EncounterWorkflowActionState,
  _formData: FormData
): Promise<EncounterWorkflowActionState> {
  return updateEncounterStage(
    hospitalSlug,
    encounterId,
    {
      stage: "awaiting_results",
      requires_lab: true,
      status: "draft",
      started_at: new Date().toISOString(),
    },
    "Encounter moved to Awaiting Results."
  );
}

export async function markEncounterResultsReview(
  hospitalSlug: string,
  encounterId: string,
  _prevState: EncounterWorkflowActionState,
  _formData: FormData
): Promise<EncounterWorkflowActionState> {
  return updateEncounterStage(
    hospitalSlug,
    encounterId,
    {
      stage: "results_review",
      results_reviewed_at: new Date().toISOString(),
      status: "draft",
    },
    "Encounter moved to Results Review."
  );
}

export async function markEncounterTreatmentDecided(
  hospitalSlug: string,
  encounterId: string,
  _prevState: EncounterWorkflowActionState,
  _formData: FormData
): Promise<EncounterWorkflowActionState> {
  return updateEncounterStage(
    hospitalSlug,
    encounterId,
    {
      stage: "treatment_decided",
      disposition_type: "outpatient_treatment",
      final_decision_at: new Date().toISOString(),
      status: "draft",
    },
    "Treatment decision saved."
  );
}

export async function markEncounterAdmissionRequested(
  hospitalSlug: string,
  encounterId: string,
  _prevState: EncounterWorkflowActionState,
  _formData: FormData
): Promise<EncounterWorkflowActionState> {
  return updateEncounterStage(
    hospitalSlug,
    encounterId,
    {
      stage: "admission_requested",
      disposition_type: "admission",
      admission_requested: true,
      final_decision_at: new Date().toISOString(),
      status: "draft",
    },
    "Admission request recorded."
  );
}

export async function finalizeEncounterWorkflow(
  hospitalSlug: string,
  encounterId: string,
  _prevState: EncounterWorkflowActionState,
  _formData: FormData
): Promise<EncounterWorkflowActionState> {
  return updateEncounterStage(
    hospitalSlug,
    encounterId,
    {
      stage: "completed",
      status: "finalized",
      finalized_at: new Date().toISOString(),
      final_decision_at: new Date().toISOString(),
    },
    "Encounter finalized successfully."
  );
}

"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { ensureAdmissionWorkflowState } from "@/features/ward/server/ensure-admission-workflow-state";

export async function advanceAdmissionWorkflowStep(formData: FormData) {
  const hospitalSlug = String(formData.get("hospital_slug") ?? "");
  const admissionId = String(formData.get("admission_id") ?? "");

  if (!hospitalSlug || !admissionId) {
    throw new Error("Missing workflow parameters.");
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("You must be signed in.");
  }

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug")
    .eq("slug", hospitalSlug)
    .maybeSingle<{ id: string; slug: string }>();

  if (hospitalError) throw new Error(hospitalError.message);
  if (!hospital) throw new Error("Hospital not found.");

  const { data: membership, error: membershipError } = await supabase
    .from("hospital_users")
    .select("id, status")
    .eq("hospital_id", hospital.id)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle();

  if (membershipError) throw new Error(membershipError.message);
  if (!membership) throw new Error("You do not have access to this hospital.");

  const state = await ensureAdmissionWorkflowState(hospital.id, admissionId);
  if (!state) throw new Error("No ward workflow is configured for this hospital.");

  const { data: steps, error: stepsError } = await supabase
    .from("ward_workflow_steps")
    .select("id, step_key, sort_order, active")
    .eq("hospital_id", hospital.id)
    .eq("workflow_config_id", state.workflow_config_id)
    .eq("active", true)
    .order("sort_order", { ascending: true });

  if (stepsError) throw new Error(stepsError.message);

  const orderedSteps = steps ?? [];
  const currentIndex = orderedSteps.findIndex((step: any) => step.step_key === state.current_step_key);

  if (currentIndex < 0) {
    throw new Error("Current workflow step was not found.");
  }

  const nextStep = orderedSteps[currentIndex + 1];

  if (!nextStep) {
    await supabase
      .from("admission_workflow_state")
      .update({
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("hospital_id", hospital.id)
      .eq("admission_id", admissionId);

    revalidatePath(`/h/${hospital.slug}/ward/admissions/${admissionId}`);
    revalidatePath(`/h/${hospital.slug}/ward/census`);
    return;
  }

  const { error: updateError } = await supabase
    .from("admission_workflow_state")
    .update({
      current_step_key: nextStep.step_key,
      updated_at: new Date().toISOString(),
    })
    .eq("hospital_id", hospital.id)
    .eq("admission_id", admissionId);

  if (updateError) throw new Error(updateError.message);

  revalidatePath(`/h/${hospital.slug}/ward/admissions/${admissionId}`);
  revalidatePath(`/h/${hospital.slug}/ward/census`);
}
import { createClient } from "@/lib/supabase/server";

export async function ensureAdmissionWorkflowState(hospitalId: string, admissionId: string) {
  const supabase = await createClient();

  const { data: existing, error: existingError } = await supabase
    .from("admission_workflow_state")
    .select("id, workflow_config_id, current_step_key, started_at, completed_at, updated_at")
    .eq("hospital_id", hospitalId)
    .eq("admission_id", admissionId)
    .maybeSingle();

  if (existingError) throw new Error(existingError.message);
  if (existing) return existing;

  const { data: config, error: configError } = await supabase
    .from("ward_workflow_configs")
    .select("id")
    .eq("hospital_id", hospitalId)
    .eq("is_default", true)
    .eq("active", true)
    .maybeSingle<{ id: string }>();

  if (configError) throw new Error(configError.message);
  if (!config) return null;

  const { data: firstStep, error: firstStepError } = await supabase
    .from("ward_workflow_steps")
    .select("step_key, sort_order")
    .eq("hospital_id", hospitalId)
    .eq("workflow_config_id", config.id)
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle<{ step_key: string; sort_order: number }>();

  if (firstStepError) throw new Error(firstStepError.message);
  if (!firstStep) return null;

  const { data: inserted, error: insertError } = await supabase
    .from("admission_workflow_state")
    .insert({
      hospital_id: hospitalId,
      admission_id: admissionId,
      workflow_config_id: config.id,
      current_step_key: firstStep.step_key,
      started_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .select("id, workflow_config_id, current_step_key, started_at, completed_at, updated_at")
    .maybeSingle();

  if (insertError) throw new Error(insertError.message);

  return inserted ?? null;
}
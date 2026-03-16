import { createClient } from "@/lib/supabase/server";

export async function ensureAdmissionDischargeChecklist(
  hospitalId: string,
  admissionId: string,
  workflowConfigId: string | null | undefined,
) {
  if (!workflowConfigId) return;

  const supabase = await createClient();

  const { data: templates, error: templateError } = await supabase
    .from("discharge_checklists")
    .select("item_key")
    .eq("hospital_id", hospitalId)
    .eq("workflow_config_id", workflowConfigId)
    .eq("active", true);

  if (templateError) throw new Error(templateError.message);

  for (const template of templates ?? []) {
    const { data: existing, error: existingError } = await supabase
      .from("admission_discharge_checklist_items")
      .select("id")
      .eq("hospital_id", hospitalId)
      .eq("admission_id", admissionId)
      .eq("checklist_item_key", template.item_key)
      .maybeSingle();

    if (existingError) throw new Error(existingError.message);

    if (!existing) {
      const { error: insertError } = await supabase
        .from("admission_discharge_checklist_items")
        .insert({
          hospital_id: hospitalId,
          admission_id: admissionId,
          checklist_item_key: template.item_key,
          completed: false,
        });

      if (insertError) throw new Error(insertError.message);
    }
  }
}
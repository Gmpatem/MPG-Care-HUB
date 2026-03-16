import { createClient } from "@/lib/supabase/server";

type ChecklistTemplateRow = {
  id: string;
  item_key: string;
  item_label: string;
  required: boolean;
  sort_order: number;
};

type ChecklistItemRow = {
  id: string;
  checklist_item_key: string;
  completed: boolean;
  completed_at: string | null;
  notes: string | null;
};

export async function getAdmissionDischargeChecklist(
  hospitalId: string,
  admissionId: string
) {
  const supabase = await createClient();

  const { data: workflowState, error: workflowError } = await supabase
    .from("admission_workflow_state")
    .select("workflow_config_id")
    .eq("hospital_id", hospitalId)
    .eq("admission_id", admissionId)
    .maybeSingle();

  if (workflowError) throw new Error(workflowError.message);

  if (!workflowState?.workflow_config_id) {
    return {
      items: [],
      summary: {
        total: 0,
        completed: 0,
        required_total: 0,
        required_completed: 0,
        ready: true,
      },
    };
  }

  const { data: templates, error: templatesError } = await supabase
    .from("discharge_checklists")
    .select("id, item_key, item_label, required, sort_order")
    .eq("hospital_id", hospitalId)
    .eq("workflow_config_id", workflowState.workflow_config_id)
    .eq("active", true)
    .order("sort_order", { ascending: true })
    .returns<ChecklistTemplateRow[]>();

  if (templatesError) throw new Error(templatesError.message);

  const { data: completedItems, error: completedItemsError } = await supabase
    .from("admission_discharge_checklist_items")
    .select("id, checklist_item_key, completed, completed_at, notes")
    .eq("hospital_id", hospitalId)
    .eq("admission_id", admissionId)
    .returns<ChecklistItemRow[]>();

  if (completedItemsError) throw new Error(completedItemsError.message);

  const completedMap = new Map(
    (completedItems ?? []).map((row) => [row.checklist_item_key, row])
  );

  const items = (templates ?? []).map((template) => {
    const existing = completedMap.get(template.item_key) ?? null;

    return {
      key: template.item_key,
      label: template.item_label,
      required: template.required,
      sort_order: template.sort_order,
      completed: Boolean(existing?.completed),
      completed_at: existing?.completed_at ?? null,
      notes: existing?.notes ?? null,
      row_id: existing?.id ?? null,
    };
  });

  const total = items.length;
  const completed = items.filter((item) => item.completed).length;
  const requiredItems = items.filter((item) => item.required);
  const requiredCompleted = requiredItems.filter((item) => item.completed).length;

  return {
    items,
    summary: {
      total,
      completed,
      required_total: requiredItems.length,
      required_completed: requiredCompleted,
      ready: requiredItems.length === requiredCompleted,
    },
  };
}
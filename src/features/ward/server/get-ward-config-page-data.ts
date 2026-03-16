import { createClient } from "@/lib/supabase/server";

type HospitalRow = {
  id: string;
  slug: string;
  name: string;
};

type WorkflowConfigRow = {
  id: string;
  name: string;
  is_default: boolean;
  requires_bed_assignment: boolean;
  requires_admission_intake: boolean;
  requires_nurse_discharge_clearance: boolean;
  allow_ward_transfer: boolean;
  allow_bed_transfer: boolean;
  default_vitals_frequency_hours: number | null;
  active: boolean;
  created_at: string;
  updated_at: string;
};

type WorkflowStepRow = {
  id: string;
  workflow_config_id: string;
  step_key: string;
  step_name: string;
  step_type: string;
  sort_order: number;
  required: boolean;
  active: boolean;
};

type DischargeChecklistRow = {
  id: string;
  workflow_config_id: string;
  item_key: string;
  item_label: string;
  sort_order: number;
  required: boolean;
  active: boolean;
};

type WardRow = {
  id: string;
  name: string;
  code: string | null;
  ward_type: string | null;
  admission_fee: number | null;
  active: boolean;
};

export async function getWardConfigPageData(hospitalSlug: string) {
  const supabase = await createClient();

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug, name")
    .eq("slug", hospitalSlug)
    .maybeSingle<HospitalRow>();

  if (hospitalError) throw new Error(hospitalError.message);
  if (!hospital) throw new Error("Hospital not found");

  const [
    { data: workflowConfigs, error: workflowConfigsError },
    { data: workflowSteps, error: workflowStepsError },
    { data: dischargeChecklists, error: dischargeChecklistsError },
    { data: wards, error: wardsError },
  ] = await Promise.all([
    supabase
      .from("ward_workflow_configs")
      .select(`
        id,
        name,
        is_default,
        requires_bed_assignment,
        requires_admission_intake,
        requires_nurse_discharge_clearance,
        allow_ward_transfer,
        allow_bed_transfer,
        default_vitals_frequency_hours,
        active,
        created_at,
        updated_at
      `)
      .eq("hospital_id", hospital.id)
      .order("is_default", { ascending: false })
      .order("name", { ascending: true }),

    supabase
      .from("ward_workflow_steps")
      .select(`
        id,
        workflow_config_id,
        step_key,
        step_name,
        step_type,
        sort_order,
        required,
        active
      `)
      .eq("hospital_id", hospital.id)
      .order("workflow_config_id", { ascending: true })
      .order("sort_order", { ascending: true }),

    supabase
      .from("discharge_checklists")
      .select(`
        id,
        workflow_config_id,
        item_key,
        item_label,
        sort_order,
        required,
        active
      `)
      .eq("hospital_id", hospital.id)
      .order("workflow_config_id", { ascending: true })
      .order("sort_order", { ascending: true }),

    supabase
      .from("wards")
      .select(`
        id,
        name,
        code,
        ward_type,
        admission_fee,
        active
      `)
      .eq("hospital_id", hospital.id)
      .order("name", { ascending: true }),
  ]);

  if (workflowConfigsError) throw new Error(workflowConfigsError.message);
  if (workflowStepsError) throw new Error(workflowStepsError.message);
  if (dischargeChecklistsError) throw new Error(dischargeChecklistsError.message);
  if (wardsError) throw new Error(wardsError.message);

  const configRows = (workflowConfigs ?? []) as WorkflowConfigRow[];
  const stepRows = (workflowSteps ?? []) as WorkflowStepRow[];
  const checklistRows = (dischargeChecklists ?? []) as DischargeChecklistRow[];
  const wardRows = (wards ?? []) as WardRow[];

  const stepsByConfigId = new Map<string, WorkflowStepRow[]>();
  for (const step of stepRows) {
    const current = stepsByConfigId.get(step.workflow_config_id) ?? [];
    current.push(step);
    stepsByConfigId.set(step.workflow_config_id, current);
  }

  const checklistsByConfigId = new Map<string, DischargeChecklistRow[]>();
  for (const item of checklistRows) {
    const current = checklistsByConfigId.get(item.workflow_config_id) ?? [];
    current.push(item);
    checklistsByConfigId.set(item.workflow_config_id, current);
  }

  const configs = configRows.map((config) => ({
    ...config,
    steps: stepsByConfigId.get(config.id) ?? [],
    discharge_checklists: checklistsByConfigId.get(config.id) ?? [],
  }));

  return {
    hospital,
    configs,
    wards: wardRows,
    stats: {
      total_configs: configs.length,
      active_configs: configs.filter((config) => config.active).length,
      default_configs: configs.filter((config) => config.is_default).length,
      total_steps: stepRows.length,
      total_checklist_items: checklistRows.length,
      total_wards: wardRows.length,
      active_wards: wardRows.filter((ward) => ward.active).length,
    },
  };
}
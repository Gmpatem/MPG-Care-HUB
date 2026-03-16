import { createClient } from "@/lib/supabase/server";

export async function getWardWorkflowConfigPage(hospitalSlug: string) {
  const supabase = await createClient();

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug, name")
    .eq("slug", hospitalSlug)
    .maybeSingle<{ id: string; slug: string; name: string }>();

  if (hospitalError) throw new Error(hospitalError.message);
  if (!hospital) throw new Error("Hospital not found");

  const { data: configs, error: configsError } = await supabase
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
      ward_workflow_steps (
        id,
        step_key,
        step_name,
        step_type,
        sort_order,
        required,
        active
      )
    `)
    .eq("hospital_id", hospital.id)
    .order("created_at", { ascending: true });

  if (configsError) throw new Error(configsError.message);

  return {
    hospital,
    configs: (configs ?? []).map((config: any) => ({
      ...config,
      ward_workflow_steps: [...(config.ward_workflow_steps ?? [])].sort(
        (a: any, b: any) => Number(a.sort_order ?? 0) - Number(b.sort_order ?? 0)
      ),
    })),
  };
}
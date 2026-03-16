import { createClient } from "@/lib/supabase/server";

export async function getEncounterLabResults(hospitalSlug: string, encounterId: string) {
  const supabase = await createClient();

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug")
    .eq("slug", hospitalSlug)
    .maybeSingle<{ id: string; slug: string }>();

  if (hospitalError) throw new Error(hospitalError.message);
  if (!hospital) throw new Error("Hospital not found");

  const { data: orders, error: ordersError } = await supabase
    .from("lab_orders")
    .select(`
      id,
      status,
      priority,
      clinical_notes,
      ordered_at,
      completed_at,
      lab_order_items (
        id,
        test_name,
        status,
        result_text,
        unit,
        reference_range,
        entered_at,
        notes,
        lab_test:lab_test_catalog (
          id,
          code,
          name
        )
      )
    `)
    .eq("hospital_id", hospital.id)
    .eq("encounter_id", encounterId)
    .order("ordered_at", { ascending: false });

  if (ordersError) throw new Error(ordersError.message);

  return (orders ?? []).map((order: any) => ({
    ...order,
    lab_order_items: (order.lab_order_items ?? []).map((item: any) => ({
      ...item,
      lab_test: Array.isArray(item.lab_test) ? item.lab_test[0] ?? null : item.lab_test ?? null,
    })),
  }));
}
import { createClient } from "@/lib/supabase/server";

export async function getLabOrderDetail(hospitalSlug: string, labOrderId: string) {
  const supabase = await createClient();

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug, name")
    .eq("slug", hospitalSlug)
    .maybeSingle<{ id: string; slug: string; name: string }>();

  if (hospitalError) throw new Error(hospitalError.message);
  if (!hospital) throw new Error("Hospital not found");

  const { data: order, error: orderError } = await supabase
    .from("lab_orders")
    .select(`
      id,
      hospital_id,
      patient_id,
      encounter_id,
      appointment_id,
      ordered_by_staff_id,
      status,
      priority,
      clinical_notes,
      ordered_at,
      completed_at,
      patient:patients (
        id,
        patient_number,
        first_name,
        middle_name,
        last_name,
        sex,
        phone
      ),
      ordered_by_staff:staff (
        id,
        full_name
      )
    `)
    .eq("hospital_id", hospital.id)
    .eq("id", labOrderId)
    .maybeSingle();

  if (orderError) throw new Error(orderError.message);
  if (!order) throw new Error("Lab order not found");

  const { data: items, error: itemsError } = await supabase
    .from("lab_order_items")
    .select(`
      id,
      lab_order_id,
      lab_test_id,
      test_name,
      status,
      result_text,
      result_json,
      unit,
      reference_range,
      entered_by_staff_id,
      entered_at,
      verified_by_staff_id,
      verified_at,
      notes,
      lab_test:lab_test_catalog (
        id,
        code,
        name
      )
    `)
    .eq("hospital_id", hospital.id)
    .eq("lab_order_id", labOrderId)
    .order("created_at", { ascending: true });

  if (itemsError) throw new Error(itemsError.message);

  return {
    hospital,
    order: {
      ...order,
      patient: Array.isArray((order as any).patient) ? (order as any).patient[0] ?? null : (order as any).patient ?? null,
      ordered_by_staff: Array.isArray((order as any).ordered_by_staff) ? (order as any).ordered_by_staff[0] ?? null : (order as any).ordered_by_staff ?? null,
    },
    items: (items ?? []).map((item: any) => ({
      ...item,
      lab_test: Array.isArray(item.lab_test) ? item.lab_test[0] ?? null : item.lab_test ?? null,
    })),
  };
}
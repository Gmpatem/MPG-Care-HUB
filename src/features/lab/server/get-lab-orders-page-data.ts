import { createClient } from "@/lib/supabase/server";

export type LabOrderRow = {
  id: string;
  status: string | null;
  priority: string | null;
  ordered_at: string | null;
  completed_at: string | null;
  clinical_notes: string | null;
  patient: {
    id: string;
    patient_number: string | null;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    sex: string | null;
    phone: string | null;
  } | null;
  ordered_by_staff: {
    id: string;
    full_name: string;
  } | null;
  item_count: number;
  entered_count: number;
};

export async function getLabOrdersPageData(hospitalSlug: string) {
  const supabase = await createClient();

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug, name")
    .eq("slug", hospitalSlug)
    .maybeSingle<{ id: string; slug: string; name: string }>();

  if (hospitalError) throw new Error(hospitalError.message);
  if (!hospital) throw new Error("Hospital not found");

  const { data: orders, error: ordersError } = await supabase
    .from("lab_orders")
    .select(`
      id,
      status,
      priority,
      ordered_at,
      completed_at,
      clinical_notes,
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
      ),
      lab_order_items (
        id,
        entered_at
      )
    `)
    .eq("hospital_id", hospital.id)
    .order("ordered_at", { ascending: false });

  if (ordersError) throw new Error(ordersError.message);

  const mapped = (orders ?? []).map((order: any) => ({
    id: order.id,
    status: order.status,
    priority: order.priority,
    ordered_at: order.ordered_at,
    completed_at: order.completed_at,
    clinical_notes: order.clinical_notes,
    patient: Array.isArray(order.patient) ? order.patient[0] ?? null : order.patient ?? null,
    ordered_by_staff: Array.isArray(order.ordered_by_staff) ? order.ordered_by_staff[0] ?? null : order.ordered_by_staff ?? null,
    item_count: Array.isArray(order.lab_order_items) ? order.lab_order_items.length : 0,
    entered_count: Array.isArray(order.lab_order_items)
      ? order.lab_order_items.filter((item: any) => item.entered_at).length
      : 0,
  })) as LabOrderRow[];

  return {
    hospital,
    orders: mapped,
  };
}
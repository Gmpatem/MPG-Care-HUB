import { createClient } from "@/lib/supabase/server";

export type LabTestRow = {
  id: string;
  code: string | null;
  name: string;
  description: string | null;
  price: number | null;
  active: boolean;
  created_at: string;
};

type HospitalRow = {
  id: string;
  slug: string;
  name: string;
};

type DepartmentRow = {
  id: string;
  name: string;
};

type LabOrderStatusRow = {
  status: string | null;
  ordered_at: string | null;
};

export async function getLabPageData(hospitalSlug: string) {
  const supabase = await createClient();

  /*
  Resolve hospital
  */

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug, name")
    .eq("slug", hospitalSlug)
    .maybeSingle<HospitalRow>();

  if (hospitalError) throw new Error(hospitalError.message);
  if (!hospital) throw new Error("Hospital not found");

  /*
  Lab test catalog
  */

  const { data: tests, error: testsError } = await supabase
    .from("lab_test_catalog")
    .select("id, code, name, description, price, active, created_at")
    .eq("hospital_id", hospital.id)
    .order("active", { ascending: false })
    .order("name", { ascending: true });

  if (testsError) throw new Error(testsError.message);

  /*
  Departments
  */

  const { data: departments, error: departmentsError } = await supabase
    .from("departments")
    .select("id, name")
    .eq("hospital_id", hospital.id)
    .order("name", { ascending: true })
    .returns<DepartmentRow[]>();

  if (departmentsError) throw new Error(departmentsError.message);

  /*
  Lab order operational stats
  */

  const { data: orders, error: ordersError } = await supabase
    .from("lab_orders")
    .select("status, ordered_at")
    .eq("hospital_id", hospital.id)
    .returns<LabOrderStatusRow[]>();

  if (ordersError) throw new Error(ordersError.message);

  const today = new Date();
  const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  const pendingOrders =
    orders?.filter((o) => o.status !== "completed").length ?? 0;

  const completedToday =
    orders?.filter((o) => {
      if (o.status !== "completed" || !o.ordered_at) return false;
      const date = new Date(o.ordered_at);
      return date >= todayStart;
    }).length ?? 0;

  const urgentOrders =
    orders?.filter((o) => o.status === "urgent").length ?? 0;

  return {
    hospital,

    /*
    catalog
    */
    tests: (tests ?? []) as LabTestRow[],
    departments: departments ?? [],

    /*
    operational stats
    */
    stats: {
      totalTests: tests?.length ?? 0,
      activeTests: tests?.filter((t) => t.active).length ?? 0,
      pendingOrders,
      completedToday,
      urgentOrders,
    },
  };
}

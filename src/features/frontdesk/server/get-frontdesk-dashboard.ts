import { createClient } from "@/lib/supabase/server";
import type { FrontdeskQueueRow, FrontdeskSummary } from "@/features/frontdesk/types";

type HospitalRow = {
  id: string;
  name: string;
  slug: string;
};

type StaffRow = {
  id: string;
  full_name: string;
  job_title: string | null;
  staff_type: string | null;
  active: boolean;
};

export async function getFrontdeskDashboard(hospitalSlug: string) {
  const supabase = await createClient();

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, name, slug")
    .eq("slug", hospitalSlug)
    .maybeSingle<HospitalRow>();

  if (hospitalError) {
    throw new Error(hospitalError.message);
  }

  if (!hospital) {
    return {
      hospital: null,
      summary: null as FrontdeskSummary | null,
      queueRows: [] as FrontdeskQueueRow[],
      staff: [] as StaffRow[],
    };
  }

  const [summaryResult, queueResult, staffResult] = await Promise.all([
    supabase
      .from("daily_operational_summary_v")
      .select("*")
      .eq("hospital_id", hospital.id)
      .maybeSingle<FrontdeskSummary>(),
    supabase
      .from("frontdesk_today_queue_v")
      .select(
        [
          "hospital_id",
          "appointment_id",
          "patient_id",
          "patient_number",
          "first_name",
          "last_name",
          "middle_name",
          "staff_name",
          "appointment_type",
          "visit_type",
          "scheduled_at",
          "check_in_at",
          "queue_number",
          "status",
          "reason",
          "arrival_notes",
        ].join(", ")
      )
      .eq("hospital_id", hospital.id)
      .limit(10)
      .returns<FrontdeskQueueRow[]>(),
    supabase
      .from("staff")
      .select("id, full_name, job_title, staff_type, active")
      .eq("hospital_id", hospital.id)
      .eq("active", true)
      .order("full_name")
      .returns<StaffRow[]>(),
  ]);

  if (summaryResult.error) {
    throw new Error(summaryResult.error.message);
  }

  if (queueResult.error) {
    throw new Error(queueResult.error.message);
  }

  if (staffResult.error) {
    throw new Error(staffResult.error.message);
  }

  return {
    hospital,
    summary: summaryResult.data ?? null,
    queueRows: queueResult.data ?? [],
    staff: staffResult.data ?? [],
  };
}
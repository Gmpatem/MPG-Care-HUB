import { createClient } from "@/lib/supabase/server";
import type {
  DoctorQueueRow,
  DoctorStageCounts,
  DoctorSummary,
  EncounterStage,
  DispositionType,
} from "@/features/doctor-workflow/types";

type HospitalRow = {
  id: string;
  name: string;
  slug: string;
};

type DoctorTodayQueueBaseRow = {
  hospital_id: string;
  appointment_id: string;
  patient_id: string;
  patient_number: string | null;
  first_name: string | null;
  last_name: string | null;
  middle_name: string | null;
  assigned_staff_id: string | null;
  assigned_staff_name: string | null;
  visit_type: string | null;
  scheduled_at: string | null;
  check_in_at: string | null;
  queue_number: number | null;
  appointment_status: string | null;
  encounter_id: string | null;
  encounter_status: string | null;
  started_at: string | null;
  finalized_at: string | null;
  chief_complaint: string | null;
  admission_requested: boolean | null;
};

type EncounterWorkflowRow = {
  id: string;
  stage: EncounterStage | null;
  requires_lab: boolean | null;
  disposition_type: DispositionType | null;
  results_reviewed_at: string | null;
  final_decision_at: string | null;
};

function mapRows(
  queueRows: DoctorTodayQueueBaseRow[],
  encounters: EncounterWorkflowRow[]
): DoctorQueueRow[] {
  const encounterMap = new Map<string, EncounterWorkflowRow>();

  encounters.forEach((e) => encounterMap.set(e.id, e));

  return queueRows.map((row) => {
    const encounter = row.encounter_id
      ? encounterMap.get(row.encounter_id)
      : null;

    return {
      ...row,
      encounter_stage:
        encounter?.stage ?? (row.encounter_id ? "initial_review" : null),
      requires_lab: encounter?.requires_lab ?? false,
      disposition_type: encounter?.disposition_type ?? null,
      results_reviewed_at: encounter?.results_reviewed_at ?? null,
      final_decision_at: encounter?.final_decision_at ?? null,
    };
  });
}

function sortRows(rows: DoctorQueueRow[]) {
  const stageWeight: Record<string, number> = {
    initial_review: 1,
    awaiting_results: 2,
    results_review: 3,
    admission_requested: 4,
    treatment_decided: 5,
    completed: 6,
  };

  return [...rows].sort((a, b) => {
    const aStage = a.encounter_stage ?? "initial_review";
    const bStage = b.encounter_stage ?? "initial_review";

    const aWeight = stageWeight[aStage] ?? 99;
    const bWeight = stageWeight[bStage] ?? 99;

    if (aWeight !== bWeight) return aWeight - bWeight;

    const aCheckIn = a.check_in_at
      ? new Date(a.check_in_at).getTime()
      : Number.MAX_SAFE_INTEGER;

    const bCheckIn = b.check_in_at
      ? new Date(b.check_in_at).getTime()
      : Number.MAX_SAFE_INTEGER;

    if (aCheckIn !== bCheckIn) return aCheckIn - bCheckIn;

    const aScheduled = a.scheduled_at
      ? new Date(a.scheduled_at).getTime()
      : Number.MAX_SAFE_INTEGER;

    const bScheduled = b.scheduled_at
      ? new Date(b.scheduled_at).getTime()
      : Number.MAX_SAFE_INTEGER;

    return aScheduled - bScheduled;
  });
}

function countStages(rows: DoctorQueueRow[]): DoctorStageCounts {
  return rows.reduce<DoctorStageCounts>(
    (acc, row) => {
      const stage = row.encounter_stage ?? "initial_review";

      if (!row.encounter_id || stage === "initial_review") {
        acc.new_consultations++;
      } else if (stage === "awaiting_results") {
        acc.awaiting_results++;
      } else if (stage === "results_review") {
        acc.ready_for_final_decision++;
      } else if (stage === "admission_requested") {
        acc.admission_requested++;
      } else if (
        stage === "completed" ||
        row.encounter_status === "finalized"
      ) {
        acc.completed_cases++;
      }

      return acc;
    },
    {
      new_consultations: 0,
      awaiting_results: 0,
      ready_for_final_decision: 0,
      admission_requested: 0,
      completed_cases: 0,
    }
  );
}

export async function getDoctorDashboard(hospitalSlug: string) {
  const supabase = await createClient();

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, name, slug")
    .eq("slug", hospitalSlug)
    .maybeSingle<HospitalRow>();

  if (hospitalError) throw new Error(hospitalError.message);

  if (!hospital) {
    return {
      hospital: null,
      summary: null,
      queueRows: [],
      stageCounts: {
        new_consultations: 0,
        awaiting_results: 0,
        ready_for_final_decision: 0,
        admission_requested: 0,
        completed_cases: 0,
      },
    };
  }

  const [summaryResult, queueResult] = await Promise.all([
    supabase
      .from("daily_operational_summary_v")
      .select("*")
      .eq("hospital_id", hospital.id)
      .maybeSingle<DoctorSummary>(),

    supabase
      .from("doctor_today_queue_v")
      .select("*")
      .eq("hospital_id", hospital.id)
      .returns<DoctorTodayQueueBaseRow[]>(),
  ]);

  if (summaryResult.error) throw new Error(summaryResult.error.message);
  if (queueResult.error) throw new Error(queueResult.error.message);

  const encounterIds = (queueResult.data ?? [])
    .map((r) => r.encounter_id)
    .filter((id): id is string => Boolean(id));

  let encounterWorkflowRows: EncounterWorkflowRow[] = [];

  if (encounterIds.length > 0) {
    const { data, error } = await supabase
      .from("encounters")
      .select(
        "id, stage, requires_lab, disposition_type, results_reviewed_at, final_decision_at"
      )
      .in("id", encounterIds)
      .returns<EncounterWorkflowRow[]>();

    if (error) throw new Error(error.message);

    encounterWorkflowRows = data ?? [];
  }

  const mapped = mapRows(queueResult.data ?? [], encounterWorkflowRows);
  const sorted = sortRows(mapped);
  const stageCounts = countStages(sorted);

  return {
    hospital,
    summary: summaryResult.data ?? null,
    queueRows: sorted,
    stageCounts,
  };
}

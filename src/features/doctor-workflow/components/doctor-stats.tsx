import {
  ClipboardPen,
  FlaskConical,
  Hospital,
  Stethoscope,
} from "lucide-react";

import { WorkspaceStatCard } from "@/components/layout/workspace-stat-card";
import type { DoctorStageCounts, DoctorSummary } from "@/features/doctor-workflow/types";

export function DoctorStats({
  summary,
  stageCounts,
}: {
  summary: DoctorSummary | null;
  stageCounts: DoctorStageCounts;
}) {
  const data = summary ?? {
    checked_in_today: 0,
    draft_encounters_today: 0,
    finalized_encounters_today: 0,
    active_admissions: 0,
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <WorkspaceStatCard
        title="New Consultations"
        value={stageCounts.new_consultations}
        description="Patients waiting for first doctor review"
        icon={<Stethoscope className="h-4 w-4" />}
      />

      <WorkspaceStatCard
        title="Awaiting Results"
        value={stageCounts.awaiting_results}
        description="Encounters waiting on investigation results"
        icon={<FlaskConical className="h-4 w-4" />}
      />

      <WorkspaceStatCard
        title="Ready for Decision"
        value={stageCounts.ready_for_final_decision}
        description="Cases ready for final treatment or disposition"
        icon={<ClipboardPen className="h-4 w-4" />}
      />

      <WorkspaceStatCard
        title="Admission Requests"
        value={stageCounts.admission_requested}
        description="Patients moving into ward workflow"
        icon={<Hospital className="h-4 w-4" />}
      />
    </div>
  );
}

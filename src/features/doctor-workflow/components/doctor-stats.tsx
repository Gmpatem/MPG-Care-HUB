import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DoctorStageCounts, DoctorSummary } from "@/features/doctor-workflow/types";

function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string | number;
  description: string;
}) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-semibold tracking-tight">{value}</div>
      </CardContent>
    </Card>
  );
}

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
      <StatCard
        title="New Consultations"
        value={stageCounts.new_consultations}
        description="Patients needing first doctor review"
      />
      <StatCard
        title="Awaiting Results"
        value={stageCounts.awaiting_results}
        description="Cases waiting on lab investigation"
      />
      <StatCard
        title="Ready For Decision"
        value={stageCounts.ready_for_final_decision}
        description="Cases ready for final treatment decision"
      />
      <StatCard
        title="Admission Requests"
        value={stageCounts.admission_requested}
        description="Patients moving into ward flow"
      />
    </div>
  );
}
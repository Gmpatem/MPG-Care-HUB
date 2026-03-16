import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { FrontdeskSummary } from "@/features/frontdesk/types";

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

export function FrontdeskStats({
  summary,
}: {
  summary: FrontdeskSummary | null;
}) {
  const data = summary ?? {
    appointments_today: 0,
    checked_in_today: 0,
    emergency_visits_today: 0,
    payments_today_count: 0,
    payments_today_amount: 0,
    pending_lab_orders: 0,
    pending_prescriptions: 0,
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <StatCard
        title="Appointments Today"
        value={data.appointments_today ?? 0}
        description="Scheduled and walk-in visits for today"
      />
      <StatCard
        title="Checked In"
        value={data.checked_in_today ?? 0}
        description="Patients already received at front desk"
      />
      <StatCard
        title="Emergency Visits"
        value={data.emergency_visits_today ?? 0}
        description="Today’s visits marked as emergency"
      />
      <StatCard
        title="Payments Today"
        value={data.payments_today_count ?? 0}
        description={`Collected: ${Number(data.payments_today_amount ?? 0).toFixed(2)}`}
      />
    </div>
  );
}
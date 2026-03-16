import {
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  Siren,
} from "lucide-react";

import { WorkspaceStatCard } from "@/components/layout/workspace-stat-card";
import type { FrontdeskSummary } from "@/features/frontdesk/types";

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
      <WorkspaceStatCard
        title="Appointments Today"
        value={data.appointments_today ?? 0}
        description="Scheduled and walk-in visits planned for today"
        icon={<CalendarDays className="h-4 w-4" />}
      />

      <WorkspaceStatCard
        title="Checked In"
        value={data.checked_in_today ?? 0}
        description="Patients already received at the front desk"
        icon={<ClipboardCheck className="h-4 w-4" />}
      />

      <WorkspaceStatCard
        title="Emergency Visits"
        value={data.emergency_visits_today ?? 0}
        description="Visits marked urgent or emergency"
        icon={<Siren className="h-4 w-4" />}
      />

      <WorkspaceStatCard
        title="Payments Today"
        value={data.payments_today_count ?? 0}
        description={`Collected: ${Number(data.payments_today_amount ?? 0).toFixed(2)}`}
        icon={<CreditCard className="h-4 w-4" />}
      />
    </div>
  );
}

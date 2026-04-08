import Link from "next/link";

import { WorkspaceEmptyState } from "@/components/layout/workspace-empty-state";
import { DetailPeekCard } from "@/components/layout/detail-peek-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { FrontdeskQueueRow } from "@/features/frontdesk/types";

function formatDateTime(value: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getFullName(row: FrontdeskQueueRow) {
  return [row.first_name, row.middle_name, row.last_name].filter(Boolean).join(" ");
}

function getStatusTone(status: string | null) {
  switch (status) {
    case "checked_in":
      return "info" as const;
    case "cancelled":
      return "danger" as const;
    case "completed":
      return "success" as const;
    default:
      return "neutral" as const;
  }
}

export function FrontdeskQueuePreview({
  hospitalSlug,
  rows,
}: {
  hospitalSlug: string;
  rows: FrontdeskQueueRow[];
}) {
  return (
    <Card>
      <CardHeader className="border-b">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>Today&apos;s Queue</CardTitle>
            <CardDescription>
              Current intake line for front desk work.
            </CardDescription>
          </div>

          <Button asChild variant="outline" size="sm">
            <Link href={`/h/${hospitalSlug}/frontdesk/queue`}>Open Queue</Link>
          </Button>
        </div>
      </CardHeader>

      <CardContent className="py-5">
        {rows.length === 0 ? (
          <WorkspaceEmptyState
            title="No visits in today&apos;s queue yet"
            description="Patients will appear here once they are scheduled, checked in, or moved into the front desk intake flow."
          />
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <DetailPeekCard
                key={row.appointment_id}
                id={row.appointment_id}
                title={getFullName(row) || "Unknown patient"}
                subtitle={`${row.patient_number ?? "No patient number"} · ${row.visit_type ?? "outpatient"}`}
                href={`/h/${hospitalSlug}/doctor/appointments/${row.appointment_id}/open`}
                status={{
                  label: row.status ?? "scheduled",
                  tone: getStatusTone(row.status),
                }}
                meta={[
                  { label: "Scheduled", value: formatDateTime(row.scheduled_at) },
                  { label: "Check-in", value: formatDateTime(row.check_in_at) },
                  { label: "Doctor", value: row.staff_name ?? "Unassigned" },
                  { label: "Queue", value: row.queue_number ?? "—" },
                  { label: "Reason", value: row.reason ?? "—", secondary: true },
                ]}
                expandable
                fullPageLabel="Open Visit"
                compact
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

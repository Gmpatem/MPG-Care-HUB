import Link from "next/link";

import { StatusBadge } from "@/components/layout/status-badge";
import { WorkspaceEmptyState } from "@/components/layout/workspace-empty-state";
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
              <div
                key={row.appointment_id}
                className="flex flex-col gap-3 rounded-2xl border border-border/70 bg-background p-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium text-foreground">{getFullName(row) || "Unknown patient"}</p>
                    <StatusBadge
                      label={row.status ?? "scheduled"}
                      tone={getStatusTone(row.status)}
                      className="px-2.5 py-1 capitalize font-medium"
                    />
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {row.patient_number ?? "No patient number"} · {row.visit_type ?? "outpatient"}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Doctor: {row.staff_name ?? "Unassigned"}
                  </p>
                </div>

                <div className="grid gap-1 text-sm text-muted-foreground lg:text-right">
                  <p>Scheduled: {formatDateTime(row.scheduled_at)}</p>
                  <p>Check-in: {formatDateTime(row.check_in_at)}</p>
                  <p>Queue: {row.queue_number ?? "—"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

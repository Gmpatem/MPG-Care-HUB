import Link from "next/link";
import { Badge } from "@/components/ui/badge";
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

function getStatusVariant(status: string | null): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "checked_in":
      return "default";
    case "cancelled":
      return "destructive";
    case "completed":
      return "secondary";
    default:
      return "outline";
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

      <CardContent>
        {rows.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            No visits in today&apos;s queue yet.
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <div
                key={row.appointment_id}
                className="flex flex-col gap-3 rounded-lg border p-4 lg:flex-row lg:items-center lg:justify-between"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{getFullName(row) || "Unknown patient"}</p>
                    <Badge variant={getStatusVariant(row.status)} className="capitalize">
                      {row.status ?? "scheduled"}
                    </Badge>
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
                  <p>Check-In: {formatDateTime(row.check_in_at)}</p>
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
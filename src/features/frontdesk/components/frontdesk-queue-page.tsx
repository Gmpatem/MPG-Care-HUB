import Link from "next/link";
import { ClipboardList, UserPlus, Users } from "lucide-react";

import { StatusBadge } from "@/components/layout/status-badge";
import { WorkspaceEmptyState } from "@/components/layout/workspace-empty-state";
import { WorkspacePageHeader } from "@/components/layout/workspace-page-header";
import { WorkspaceSectionHeader } from "@/components/layout/workspace-section-header";
import { WorkspaceStatCard } from "@/components/layout/workspace-stat-card";
import { Button } from "@/components/ui/button";

function fullName(row: any) {
  return [row.first_name, row.middle_name, row.last_name].filter(Boolean).join(" ");
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function statusTone(status: string | null) {
  switch (status) {
    case "checked_in":
      return "info" as const;
    case "completed":
      return "success" as const;
    case "cancelled":
      return "danger" as const;
    default:
      return "neutral" as const;
  }
}

export function FrontdeskQueuePage({
  hospitalSlug,
  hospitalName,
  rows,
}: {
  hospitalSlug: string;
  hospitalName: string;
  rows: any[];
}) {
  const checkedInCount = rows.filter((row) => row.status === "checked_in").length;
  const scheduledCount = rows.filter((row) => row.status === "scheduled").length;
  const unassignedCount = rows.filter((row) => !row.staff_name).length;

  return (
    <main className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Front Desk Queue"
        title="Front Desk Queue"
        description="Manage arrivals, track queue order, and move patients into the next stage of care with less confusion at the intake desk."
        actions={
          <>
            <Button asChild>
              <Link href={`/h/${hospitalSlug}/frontdesk`}>Front Desk Dashboard</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/frontdesk/intake`}>Open Intake</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WorkspaceStatCard
          title="Queue Total"
          value={rows.length}
          description="Patients currently visible to front desk"
          icon={<ClipboardList className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Checked In"
          value={checkedInCount}
          description="Patients already arrived and marked present"
          icon={<Users className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Scheduled"
          value={scheduledCount}
          description="Patients still waiting to arrive or be checked in"
          icon={<UserPlus className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Unassigned"
          value={unassignedCount}
          description="Visits without doctor assignment yet"
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      <section className="surface-panel p-4 sm:p-5">
        <WorkspaceSectionHeader
          title="Today’s Queue"
          description="Scan by queue number first, then confirm patient identity and doctor assignment."
          actions={
            <Button asChild variant="outline" size="sm">
              <Link href={`/h/${hospitalSlug}/appointments`}>Appointments</Link>
            </Button>
          }
        />

        {rows.length === 0 ? (
          <div className="mt-4">
            <WorkspaceEmptyState
              title="No patients in the queue right now"
              description="Scheduled and checked-in visits will appear here automatically as front desk activity begins."
            />
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {rows.map((row) => (
              <div
                key={row.appointment_id}
                className="rounded-2xl border border-border/70 bg-background p-4 shadow-[0_8px_24px_rgba(15,23,42,0.03)]"
              >
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0 space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-base font-semibold text-foreground">
                        {fullName(row) || "Unknown patient"}
                      </p>

                      <StatusBadge
                        label={row.status ?? "scheduled"}
                        tone={statusTone(row.status)}
                        className="px-2.5 py-1 capitalize font-medium"
                      />

                      {row.visit_type ? (
                        <StatusBadge
                          label={row.visit_type}
                          tone="neutral"
                          className="px-2.5 py-1 capitalize font-medium"
                        />
                      ) : null}
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {row.patient_number ?? "No patient number"} · Queue #{row.queue_number ?? "—"}
                    </p>

                    <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
                      <p>Scheduled: {formatDateTime(row.scheduled_at)}</p>
                      <p>Check-in: {formatDateTime(row.check_in_at)}</p>
                      <p>Doctor: {row.staff_name ?? "Unassigned"}</p>
                      <p>Reason: {row.reason ?? "—"}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/h/${hospitalSlug}/patients`}>
                        Patient Directory
                      </Link>
                    </Button>

                    <Button asChild size="sm">
                      <Link href={`/h/${hospitalSlug}/doctor/appointments/${row.appointment_id}/open`}>
                        Open Visit
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

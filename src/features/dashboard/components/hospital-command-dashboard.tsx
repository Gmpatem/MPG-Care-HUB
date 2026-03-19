import Link from "next/link";
import {
  Activity,
  BedDouble,
  ClipboardCheck,
  Stethoscope,
  UserRound,
  Users,
} from "lucide-react";

import { StatusBadge } from "@/components/layout/status-badge";
import { WorkspaceStatCard } from "@/components/layout/workspace-stat-card";
import { Button } from "@/components/ui/button";

function statusTone(status: string) {
  if (status === "scheduled") return "info" as const;
  if (status === "checked_in") return "warning" as const;
  if (status === "completed") return "success" as const;
  if (status === "cancelled") return "danger" as const;
  return "neutral" as const;
}

function PanelShell({
  title,
  description,
  children,
  action,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <section className="surface-panel p-5 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h2 className="text-[1.35rem] font-semibold tracking-[-0.025em] text-foreground">
            {title}
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        </div>

        {action ? <div className="shrink-0">{action}</div> : null}
      </div>

      <div className="mt-5">{children}</div>
    </section>
  );
}

export function HospitalCommandDashboard({
  hospitalSlug,
  hospitalName,
  stats,
  wardLoad,
  doctorWorkload,
  nurseWorkload,
  frontdeskQueue,
}: {
  hospitalSlug: string;
  hospitalName: string;
  stats: {
    active_admissions: number;
    discharged_today: number;
    total_beds: number;
    occupied_beds: number;
    available_beds: number;
    discharge_requested: number;
    todays_queue: number;
  };
  wardLoad: Array<{
    id: string;
    name: string;
    code: string | null;
    ward_type: string | null;
    active_admissions: number;
    occupied_beds: number;
    available_beds: number;
    discharge_requested: number;
  }>;
  doctorWorkload: Array<{
    id: string;
    full_name: string;
    specialty: string | null;
    active_inpatients: number;
    today_queue: number;
    total_load: number;
  }>;
  nurseWorkload: {
    discharge_requested: number;
    overdue_vitals: number;
    missing_vitals: number;
    due_vitals: number;
  };
  frontdeskQueue: Array<{
    id: string;
    scheduled_at: string;
    status: string;
    queue_number: number | null;
    staff_id: string | null;
  }>;
}) {
  return (
    <main className="space-y-6">
      <section className="hero-mesh rounded-[1.6rem] p-[1px] shadow-[0_24px_70px_rgba(11,42,74,0.10)]">
        <div className="rounded-[1.52rem] bg-white/92 p-5 dark:bg-[#101c2c]/88 sm:p-6">
          <div className="grid gap-5 xl:grid-cols-[1.15fr_.85fr] xl:items-center">
            <div className="space-y-2">
              <p className="eyebrow">Hospital Command Center</p>
              <h1 className="text-[2rem] font-semibold tracking-[-0.03em] text-foreground sm:text-[2.25rem]">
                Dashboard
              </h1>
              <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-[15px]">
                Live operational snapshot for {hospitalName}. Use this view to understand bed pressure,
                nursing attention, doctor load, and today&apos;s queue movement at a glance.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 xl:justify-end">
              <Button asChild>
                <Link href={`/h/${hospitalSlug}/ward`}>Ward</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/h/${hospitalSlug}/nurse`}>Nurse</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/h/${hospitalSlug}/census`}>Census</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/h/${hospitalSlug}/frontdesk/queue`}>Front Desk Queue</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/h/${hospitalSlug}/ward/discharges`}>Discharge Queue</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        <WorkspaceStatCard
          title="Active Admissions"
          value={stats.active_admissions}
          description="Current inpatient ward load"
          icon={<BedDouble className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Discharged Today"
          value={stats.discharged_today}
          description="Completed discharge activity today"
          icon={<ClipboardCheck className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Bed Utilization"
          value={`${stats.total_beds > 0 ? Math.round((stats.occupied_beds / stats.total_beds) * 100) : 0}%`}
          description={`${stats.occupied_beds} occupied of ${stats.total_beds} total beds`}
          icon={<Activity className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Available Beds"
          value={stats.available_beds}
          description="Beds ready for new admissions"
          icon={<Users className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Discharge Requested"
          value={stats.discharge_requested}
          description="Cases needing discharge handling"
          icon={<ClipboardCheck className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Today’s Queue"
          value={stats.todays_queue}
          description="Appointments moving through intake"
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <PanelShell
          title="Ward Load"
          description="Current admissions and bed pressure by ward."
          action={
            <Button asChild size="sm" variant="outline">
              <Link href={`/h/${hospitalSlug}/census`}>Open Census</Link>
            </Button>
          }
        >
          {wardLoad.length === 0 ? (
            <div className="surface-soft border-dashed p-4 text-sm text-muted-foreground">
              No wards found.
            </div>
          ) : (
            <div className="space-y-3">
              {wardLoad.map((ward) => (
                <div key={ward.id} className="surface-soft p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">{ward.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {ward.code ?? "No code"} · {ward.ward_type ?? "general"}
                      </p>
                    </div>

                    <StatusBadge
                      label={`${ward.active_admissions} admissions`}
                      tone="info"
                      className="px-2.5 py-1 font-medium"
                    />
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl border border-border/70 bg-background/70 p-3 text-sm text-muted-foreground">
                      Occupied Beds
                      <div className="mt-1 text-lg font-semibold text-foreground">{ward.occupied_beds}</div>
                    </div>
                    <div className="rounded-xl border border-border/70 bg-background/70 p-3 text-sm text-muted-foreground">
                      Available Beds
                      <div className="mt-1 text-lg font-semibold text-foreground">{ward.available_beds}</div>
                    </div>
                    <div className="rounded-xl border border-border/70 bg-background/70 p-3 text-sm text-muted-foreground">
                      Discharge Requested
                      <div className="mt-1 text-lg font-semibold text-foreground">{ward.discharge_requested}</div>
                    </div>
                    <div className="rounded-xl border border-border/70 bg-background/70 p-3 text-sm text-muted-foreground">
                      Ward Type
                      <div className="mt-1 text-lg font-semibold capitalize text-foreground">{ward.ward_type ?? "general"}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PanelShell>

        <PanelShell
          title="Nurse Workload"
          description="Patients needing inpatient nursing attention right now."
          action={
            <Button asChild size="sm" variant="outline">
              <Link href={`/h/${hospitalSlug}/nurse`}>Open Nurse Dashboard</Link>
            </Button>
          }
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <WorkspaceStatCard
              title="Discharge Requested"
              value={nurseWorkload.discharge_requested}
              description="Admissions awaiting ward-side discharge handling"
              icon={<ClipboardCheck className="h-4 w-4" />}
            />
            <WorkspaceStatCard
              title="Overdue Vitals"
              value={nurseWorkload.overdue_vitals}
              description="Patients already past scheduled vital checks"
              icon={<UserRound className="h-4 w-4" />}
            />
            <WorkspaceStatCard
              title="Missing Vitals"
              value={nurseWorkload.missing_vitals}
              description="Admissions without expected vital entries"
              icon={<UserRound className="h-4 w-4" />}
            />
            <WorkspaceStatCard
              title="Due Soon"
              value={nurseWorkload.due_vitals}
              description="Vital checks approaching soon"
              icon={<Activity className="h-4 w-4" />}
            />
          </div>
        </PanelShell>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <PanelShell
          title="Doctor Workload"
          description="Outpatient queue plus active inpatients by doctor."
          action={
            <Button asChild size="sm" variant="outline">
              <Link href={`/h/${hospitalSlug}/doctor`}>Open Doctor Workspace</Link>
            </Button>
          }
        >
          {doctorWorkload.length === 0 ? (
            <div className="surface-soft border-dashed p-4 text-sm text-muted-foreground">
              No active doctors found.
            </div>
          ) : (
            <div className="space-y-3">
              {doctorWorkload.slice(0, 8).map((doctor) => (
                <div key={doctor.id} className="surface-soft p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium text-foreground">{doctor.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {doctor.specialty ?? "General"}
                      </p>
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full bg-[rgba(83,74,183,0.08)] px-3 py-1 text-xs font-medium text-[#534ab7]">
                      <Stethoscope className="h-3.5 w-3.5" />
                      Total load {doctor.total_load}
                    </div>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-border/70 bg-background/70 p-3 text-sm text-muted-foreground">
                      Today queue
                      <div className="mt-1 text-lg font-semibold text-foreground">{doctor.today_queue}</div>
                    </div>
                    <div className="rounded-xl border border-border/70 bg-background/70 p-3 text-sm text-muted-foreground">
                      Active inpatients
                      <div className="mt-1 text-lg font-semibold text-foreground">{doctor.active_inpatients}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PanelShell>

        <PanelShell
          title="Front Desk Queue Snapshot"
          description="Today’s first queued appointments."
          action={
            <Button asChild size="sm" variant="outline">
              <Link href={`/h/${hospitalSlug}/frontdesk/queue`}>Open Front Desk Queue</Link>
            </Button>
          }
        >
          {frontdeskQueue.length === 0 ? (
            <div className="surface-soft border-dashed p-4 text-sm text-muted-foreground">
              No queued appointments today.
            </div>
          ) : (
            <div className="space-y-3">
              {frontdeskQueue.map((item) => (
                <div key={item.id} className="surface-soft p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-foreground">Queue #{item.queue_number ?? "—"}</p>
                    <StatusBadge
                      label={item.status.replace(/_/g, " ")}
                      tone={statusTone(item.status)}
                      className="px-2.5 py-1 font-medium capitalize"
                    />
                  </div>

                  <div className="mt-3 flex items-start gap-3 text-sm text-muted-foreground">
                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-xl bg-[rgba(14,122,145,0.10)] text-primary">
                      <Users className="h-4 w-4" />
                    </div>
                    <div>
                      <p>Scheduled: {new Date(item.scheduled_at).toLocaleString()}</p>
                      <p className="mt-1">Assigned staff: {item.staff_id ?? "Unassigned"}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </PanelShell>
      </div>
    </main>
  );
}

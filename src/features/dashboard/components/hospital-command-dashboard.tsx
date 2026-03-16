import Link from "next/link";
import {
  Activity,
  BedDouble,
  ClipboardCheck,
  Stethoscope,
  UserRound,
  Users,
} from "lucide-react";

import { Button } from "@/components/ui/button";

function statusTone(status: string) {
  if (status === "scheduled") return "bg-blue-100 text-blue-700";
  if (status === "checked_in") return "bg-amber-100 text-amber-700";
  if (status === "completed") return "bg-emerald-100 text-emerald-700";
  if (status === "cancelled") return "bg-rose-100 text-rose-700";
  return "bg-slate-100 text-slate-700";
}

function StatTile({
  title,
  value,
  icon,
}: {
  title: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.15rem] border border-[#bfd7ea] bg-white px-5 py-4 shadow-[0_10px_24px_rgba(13,27,42,0.035)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-[#5f7891]">{title}</p>
          <div className="mt-2 text-[1.9rem] font-semibold leading-none tracking-[-0.04em] text-[#0d1b2a]">
            {value}
          </div>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,rgba(14,122,145,0.12),rgba(42,179,204,0.16))] text-primary ring-1 ring-[#c8ddef]">
          {icon}
        </div>
      </div>
    </div>
  );
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
        <StatTile
          title="Active Admissions"
          value={stats.active_admissions}
          icon={<BedDouble className="h-4 w-4" />}
        />
        <StatTile
          title="Discharged Today"
          value={stats.discharged_today}
          icon={<ClipboardCheck className="h-4 w-4" />}
        />
        <StatTile
          title="Total Beds"
          value={stats.total_beds}
          icon={<BedDouble className="h-4 w-4" />}
        />
        <StatTile
          title="Occupied Beds"
          value={stats.occupied_beds}
          icon={<Activity className="h-4 w-4" />}
        />
        <StatTile
          title="Available Beds"
          value={stats.available_beds}
          icon={<Users className="h-4 w-4" />}
        />
        <StatTile
          title="Discharge Requested"
          value={stats.discharge_requested}
          icon={<ClipboardCheck className="h-4 w-4" />}
        />
        <StatTile
          title="Today’s Queue"
          value={stats.todays_queue}
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

                    <span className="rounded-full bg-[rgba(17,150,176,0.10)] px-2.5 py-1 text-xs font-medium text-[#0d6175]">
                      {ward.active_admissions} admissions
                    </span>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-xl border border-[#d7e6f2] bg-white/70 p-3 text-sm text-muted-foreground">
                      Occupied Beds
                      <div className="mt-1 text-lg font-semibold text-foreground">{ward.occupied_beds}</div>
                    </div>
                    <div className="rounded-xl border border-[#d7e6f2] bg-white/70 p-3 text-sm text-muted-foreground">
                      Available Beds
                      <div className="mt-1 text-lg font-semibold text-foreground">{ward.available_beds}</div>
                    </div>
                    <div className="rounded-xl border border-[#d7e6f2] bg-white/70 p-3 text-sm text-muted-foreground">
                      Discharge Requested
                      <div className="mt-1 text-lg font-semibold text-foreground">{ward.discharge_requested}</div>
                    </div>
                    <div className="rounded-xl border border-[#d7e6f2] bg-white/70 p-3 text-sm text-muted-foreground">
                      Ward Type
                      <div className="mt-1 text-lg font-semibold text-foreground">{ward.ward_type ?? "general"}</div>
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
            <div className="surface-soft p-4">
              <p className="text-sm text-muted-foreground">Discharge Requested</p>
              <div className="mt-2 text-[1.8rem] font-semibold tracking-[-0.04em] text-foreground">
                {nurseWorkload.discharge_requested}
              </div>
            </div>
            <div className="surface-soft p-4">
              <p className="text-sm text-muted-foreground">Overdue Vitals</p>
              <div className="mt-2 text-[1.8rem] font-semibold tracking-[-0.04em] text-foreground">
                {nurseWorkload.overdue_vitals}
              </div>
            </div>
            <div className="surface-soft p-4">
              <p className="text-sm text-muted-foreground">Missing Vitals</p>
              <div className="mt-2 text-[1.8rem] font-semibold tracking-[-0.04em] text-foreground">
                {nurseWorkload.missing_vitals}
              </div>
            </div>
            <div className="surface-soft p-4">
              <p className="text-sm text-muted-foreground">Due Soon</p>
              <div className="mt-2 text-[1.8rem] font-semibold tracking-[-0.04em] text-foreground">
                {nurseWorkload.due_vitals}
              </div>
            </div>
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
                    <div className="rounded-xl border border-[#d7e6f2] bg-white/70 p-3 text-sm text-muted-foreground">
                      Today queue
                      <div className="mt-1 text-lg font-semibold text-foreground">{doctor.today_queue}</div>
                    </div>
                    <div className="rounded-xl border border-[#d7e6f2] bg-white/70 p-3 text-sm text-muted-foreground">
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
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusTone(item.status)}`}>
                      {item.status}
                    </span>
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

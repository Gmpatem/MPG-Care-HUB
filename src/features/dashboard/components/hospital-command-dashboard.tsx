import Link from "next/link";
import { Button } from "@/components/ui/button";

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
      <div className="flex flex-col gap-4 rounded-xl border p-5">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Hospital Command Center</p>
          <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Live operational snapshot for {hospitalName}.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-7">
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Active Admissions</p>
          <div className="mt-2 text-2xl font-semibold">{stats.active_admissions}</div>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Discharged Today</p>
          <div className="mt-2 text-2xl font-semibold">{stats.discharged_today}</div>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Total Beds</p>
          <div className="mt-2 text-2xl font-semibold">{stats.total_beds}</div>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Occupied Beds</p>
          <div className="mt-2 text-2xl font-semibold">{stats.occupied_beds}</div>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Available Beds</p>
          <div className="mt-2 text-2xl font-semibold">{stats.available_beds}</div>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Discharge Requested</p>
          <div className="mt-2 text-2xl font-semibold">{stats.discharge_requested}</div>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Today’s Queue</p>
          <div className="mt-2 text-2xl font-semibold">{stats.todays_queue}</div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <section className="space-y-4 rounded-xl border p-5">
          <div>
            <h2 className="text-lg font-semibold">Ward Load</h2>
            <p className="text-sm text-muted-foreground">
              Current admissions and bed pressure by ward.
            </p>
          </div>

          {wardLoad.length === 0 ? (
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              No wards found.
            </div>
          ) : (
            <div className="space-y-3">
              {wardLoad.map((ward) => (
                <div key={ward.id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{ward.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {ward.code ?? "No code"} · {ward.ward_type ?? "general"}
                      </p>
                    </div>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/h/${hospitalSlug}/census`}>Open Census</Link>
                    </Button>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
                    <p>Admissions: {ward.active_admissions}</p>
                    <p>Occupied Beds: {ward.occupied_beds}</p>
                    <p>Available Beds: {ward.available_beds}</p>
                    <p>Discharge Requested: {ward.discharge_requested}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4 rounded-xl border p-5">
          <div>
            <h2 className="text-lg font-semibold">Nurse Workload</h2>
            <p className="text-sm text-muted-foreground">
              Patients needing inpatient nursing attention right now.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Discharge Requested</p>
              <div className="mt-2 text-2xl font-semibold">{nurseWorkload.discharge_requested}</div>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Overdue Vitals</p>
              <div className="mt-2 text-2xl font-semibold">{nurseWorkload.overdue_vitals}</div>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Missing Vitals</p>
              <div className="mt-2 text-2xl font-semibold">{nurseWorkload.missing_vitals}</div>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Due Soon</p>
              <div className="mt-2 text-2xl font-semibold">{nurseWorkload.due_vitals}</div>
            </div>
          </div>

          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/nurse`}>Open Nurse Dashboard</Link>
          </Button>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
        <section className="space-y-4 rounded-xl border p-5">
          <div>
            <h2 className="text-lg font-semibold">Doctor Workload</h2>
            <p className="text-sm text-muted-foreground">
              Outpatient queue plus active inpatients by doctor.
            </p>
          </div>

          {doctorWorkload.length === 0 ? (
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              No active doctors found.
            </div>
          ) : (
            <div className="space-y-3">
              {doctorWorkload.slice(0, 8).map((doctor) => (
                <div key={doctor.id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="font-medium">{doctor.full_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {doctor.specialty ?? "General"}
                      </p>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Total load: {doctor.total_load}
                    </div>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                    <p>Today queue: {doctor.today_queue}</p>
                    <p>Active inpatients: {doctor.active_inpatients}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="space-y-4 rounded-xl border p-5">
          <div>
            <h2 className="text-lg font-semibold">Front Desk Queue Snapshot</h2>
            <p className="text-sm text-muted-foreground">
              Today’s first queued appointments.
            </p>
          </div>

          {frontdeskQueue.length === 0 ? (
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              No queued appointments today.
            </div>
          ) : (
            <div className="space-y-3">
              {frontdeskQueue.map((item) => (
                <div key={item.id} className="rounded-lg border p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium">Queue #{item.queue_number ?? "—"}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Scheduled: {new Date(item.scheduled_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}

          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/frontdesk/queue`}>Open Front Desk Queue</Link>
          </Button>
        </section>
      </div>
    </main>
  );
}
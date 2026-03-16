import Link from "next/link";
import { Button } from "@/components/ui/button";

function fullName(patient: any) {
  if (!patient) return "Unknown patient";
  return [patient.first_name, patient.middle_name, patient.last_name].filter(Boolean).join(" ");
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function formatDuration(admittedAt: string | null) {
  if (!admittedAt) return "—";
  const start = new Date(admittedAt).getTime();
  const now = Date.now();
  if (Number.isNaN(start)) return "—";

  const diffMs = Math.max(now - start, 0);
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  if (days > 0) return `${days}d ${remainingHours}h`;
  return `${hours}h`;
}

function statusTone(status: string, dischargeRequested: boolean) {
  if (dischargeRequested) return "bg-amber-100 text-amber-700";
  if (status === "admitted" || status === "active") return "bg-emerald-100 text-emerald-700";
  return "bg-slate-100 text-slate-700";
}

function WardSummarySection({
  hospitalSlug,
  wards,
}: {
  hospitalSlug: string;
  wards: any[];
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Ward Capacity</h2>
        <p className="text-sm text-muted-foreground">
          Current occupancy and discharge pressure by ward.
        </p>
      </div>

      {wards.length === 0 ? (
        <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
          No wards configured yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {wards.map((ward) => (
            <div key={ward.id} className="rounded-xl border p-4">
              <div className="space-y-1">
                <h3 className="font-medium">{ward.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {ward.code ?? "No code"} · {ward.ward_type ?? "general"}
                </p>
              </div>

              <div className="mt-4 grid gap-2 text-sm text-muted-foreground">
                <p>Total beds: {ward.total_beds}</p>
                <p>Occupied beds: {ward.occupied_beds}</p>
                <p>Available beds: {ward.available_beds}</p>
                <p>Active admissions: {ward.active_admissions}</p>
                <p>Discharge requested: {ward.discharge_requested_count}</p>
              </div>

              <div className="mt-4 flex gap-2">
                <Button asChild size="sm" variant="outline">
                  <Link href={`/h/${hospitalSlug}/census`}>Open Census</Link>
                </Button>

                <Button asChild size="sm" variant="outline">
                  <Link href={`/h/${hospitalSlug}/ward/config`}>Ward Config</Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function PatientWorklistSection({
  hospitalSlug,
  admissions,
}: {
  hospitalSlug: string;
  admissions: any[];
}) {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Admitted Patients Worklist</h2>
        <p className="text-sm text-muted-foreground">
          Active inpatient cases ready for chart review, transfers, monitoring, and discharge work.
        </p>
      </div>

      {admissions.length === 0 ? (
        <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
          No active admissions in ward right now.
        </div>
      ) : (
        <div className="space-y-4">
          {admissions.map((admission) => (
            <div
              key={admission.id}
              className="flex flex-col gap-4 rounded-xl border p-4 lg:flex-row lg:items-start lg:justify-between"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{fullName(admission.patient)}</p>

                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${statusTone(
                      admission.status,
                      admission.discharge_requested
                    )}`}
                  >
                    {admission.discharge_requested ? "discharge requested" : admission.status}
                  </span>
                </div>

                <p className="text-sm text-muted-foreground">
                  {admission.patient?.patient_number ?? "No patient number"} ·
                  Ward {admission.ward?.name ?? "—"} ·
                  Bed {admission.bed?.bed_number ?? "Unassigned"}
                </p>

                <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
                  <p>Admitted: {formatDateTime(admission.admitted_at)}</p>
                  <p>Stay duration: {formatDuration(admission.admitted_at)}</p>
                  <p>Doctor: {admission.admitting_doctor?.full_name ?? "Unknown"}</p>
                  <p>Phone: {admission.patient?.phone ?? "—"}</p>
                </div>

                <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
                  <p>Admission reason: {admission.admission_reason ?? "—"}</p>
                  <p>Encounter: {admission.encounter_id ?? "—"}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button asChild>
                  <Link href={`/h/${hospitalSlug}/ward/admissions/${admission.id}`}>
                    Open Chart
                  </Link>
                </Button>

                <Button asChild size="sm" variant="outline">
                  <Link href={`/h/${hospitalSlug}/ward/discharges`}>
                    Discharge Queue
                  </Link>
                </Button>

                <Button asChild size="sm" variant="outline">
                  <Link href={`/h/${hospitalSlug}/census`}>
                    Census
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function WardDashboardPage({
  hospitalSlug,
  hospitalName,
  wards,
  admissions,
  stats,
}: {
  hospitalSlug: string;
  hospitalName: string;
  wards: any[];
  admissions: any[];
  stats: {
    total_wards: number;
    active_admissions: number;
    discharge_requested: number;
    newly_admitted: number;
    available_beds: number;
    occupied_beds: number;
    total_beds: number;
  };
}) {
  const dischargeRequestedAdmissions = admissions.filter((admission) => admission.discharge_requested);
  const standardAdmissions = admissions.filter((admission) => !admission.discharge_requested);

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border p-5">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Ward Operations</p>
          <h1 className="text-3xl font-semibold tracking-tight">Ward</h1>
          <p className="text-sm text-muted-foreground">
            Manage admitted patients, monitor ward occupancy, and move active cases toward discharge for {hospitalName}.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href={`/h/${hospitalSlug}/ward/admissions`}>Admission Intake</Link>
          </Button>

          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/census`}>Open Census</Link>
          </Button>

          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/ward/discharges`}>Discharge Queue</Link>
          </Button>

          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/ward/config`}>Ward Config</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Wards</p>
          <div className="mt-2 text-2xl font-semibold">{stats.total_wards}</div>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Active Admissions</p>
          <div className="mt-2 text-2xl font-semibold">{stats.active_admissions}</div>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Discharge Requested</p>
          <div className="mt-2 text-2xl font-semibold">{stats.discharge_requested}</div>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">New In 24h</p>
          <div className="mt-2 text-2xl font-semibold">{stats.newly_admitted}</div>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Occupied Beds</p>
          <div className="mt-2 text-2xl font-semibold">{stats.occupied_beds}</div>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Available Beds</p>
          <div className="mt-2 text-2xl font-semibold">{stats.available_beds}</div>
        </div>
      </div>

      {dischargeRequestedAdmissions.length > 0 ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Discharge Priority</h2>
            <p className="text-sm text-muted-foreground">
              These admissions already have discharge requested and should be reviewed first.
            </p>
          </div>

          <div className="space-y-4">
            {dischargeRequestedAdmissions.map((admission) => (
              <div
                key={admission.id}
                className="flex flex-col gap-4 rounded-xl border border-amber-200 bg-amber-50/40 p-4 lg:flex-row lg:items-start lg:justify-between"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{fullName(admission.patient)}</p>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                      discharge requested
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {admission.patient?.patient_number ?? "No patient number"} ·
                    Ward {admission.ward?.name ?? "—"} ·
                    Bed {admission.bed?.bed_number ?? "Unassigned"}
                  </p>

                  <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
                    <p>Admitted: {formatDateTime(admission.admitted_at)}</p>
                    <p>Stay duration: {formatDuration(admission.admitted_at)}</p>
                    <p>Requested at: {formatDateTime(admission.discharge_requested_at)}</p>
                    <p>Doctor: {admission.admitting_doctor?.full_name ?? "Unknown"}</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button asChild>
                    <Link href={`/h/${hospitalSlug}/ward/admissions/${admission.id}`}>
                      Open Chart
                    </Link>
                  </Button>

                  <Button asChild variant="outline">
                    <Link href={`/h/${hospitalSlug}/ward/discharges`}>
                      Open Discharge Queue
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <WardSummarySection hospitalSlug={hospitalSlug} wards={wards} />

      <PatientWorklistSection hospitalSlug={hospitalSlug} admissions={standardAdmissions} />
    </main>
  );
}
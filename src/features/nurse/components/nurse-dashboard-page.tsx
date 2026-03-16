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

function vitalsTone(state: string) {
  if (state === "overdue") return "bg-rose-100 text-rose-700";
  if (state === "missing") return "bg-amber-100 text-amber-700";
  if (state === "due") return "bg-blue-100 text-blue-700";
  return "bg-emerald-100 text-emerald-700";
}

function vitalsLabel(state: string) {
  if (state === "overdue") return "vitals overdue";
  if (state === "missing") return "no vitals yet";
  if (state === "due") return "vitals due soon";
  return "vitals fresh";
}

function PatientCard({
  hospitalSlug,
  admission,
}: {
  hospitalSlug: string;
  admission: any;
}) {
  const latestVitals = admission.latest_vitals;

  return (
    <div className="flex flex-col gap-4 rounded-xl border p-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{fullName(admission.patient)}</p>

          {admission.discharge_requested ? (
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
              discharge requested
            </span>
          ) : null}

          <span className={`rounded-full px-2 py-0.5 text-xs ${vitalsTone(admission.vitals_state)}`}>
            {vitalsLabel(admission.vitals_state)}
          </span>

          {admission.is_new_admission ? (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
              new admission
            </span>
          ) : null}
        </div>

        <p className="text-sm text-muted-foreground">
          {admission.patient?.patient_number ?? "No patient number"} ·
          Ward {admission.ward?.name ?? "—"} ·
          Bed {admission.bed?.bed_number ?? "Unassigned"}
        </p>

        <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
          <p>Admitted: {formatDateTime(admission.admitted_at)}</p>
          <p>Stay: {formatDuration(admission.admitted_at)}</p>
          <p>Doctor: {admission.admitting_doctor?.full_name ?? "Unknown"}</p>
          <p>Phone: {admission.patient?.phone ?? "—"}</p>
        </div>

        <p className="text-sm text-muted-foreground">
          Reason: {admission.admission_reason ?? "—"}
        </p>

        <div className="rounded-lg bg-muted/40 p-3 text-sm text-muted-foreground">
          {latestVitals ? (
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-4">
              <p>Last vitals: {formatDateTime(latestVitals.recorded_at)}</p>
              <p>
                BP: {latestVitals.blood_pressure_systolic ?? "—"} / {latestVitals.blood_pressure_diastolic ?? "—"}
              </p>
              <p>Pulse: {latestVitals.pulse_bpm ?? "—"} bpm</p>
              <p>SpO2: {latestVitals.spo2 ?? "—"} %</p>
            </div>
          ) : (
            <p>No vitals recorded yet for this admission.</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button asChild>
          <Link href={`/h/${hospitalSlug}/ward/admissions/${admission.id}`}>
            Open Chart
          </Link>
        </Button>

        <Button asChild size="sm" variant="outline">
          <Link href={`/h/${hospitalSlug}/ward`}>
            Ward
          </Link>
        </Button>

        <Button asChild size="sm" variant="outline">
          <Link href={`/h/${hospitalSlug}/ward/discharges`}>
            Discharge Queue
          </Link>
        </Button>
      </div>
    </div>
  );
}

export function NurseDashboardPage({
  hospitalSlug,
  hospitalName,
  admissions,
  stats,
}: {
  hospitalSlug: string;
  hospitalName: string;
  admissions: any[];
  stats: {
    total_admissions: number;
    discharge_requested: number;
    overdue_vitals: number;
    missing_vitals: number;
    due_vitals: number;
    new_admissions: number;
  };
}) {
  const priorityAdmissions = admissions.filter(
    (row) => row.discharge_requested || row.vitals_state === "overdue" || row.vitals_state === "missing"
  );
  const standardAdmissions = admissions.filter(
    (row) => !row.discharge_requested && row.vitals_state !== "overdue" && row.vitals_state !== "missing"
  );

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border p-5">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Nursing Monitoring</p>
          <h1 className="text-3xl font-semibold tracking-tight">Nurse</h1>
          <p className="text-sm text-muted-foreground">
            Monitor admitted patients, prioritize overdue vitals, and prepare inpatient cases for safe discharge in {hospitalName}.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href={`/h/${hospitalSlug}/ward`}>Open Ward</Link>
          </Button>

          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/census`}>Open Census</Link>
          </Button>

          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/ward/discharges`}>Discharge Queue</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Active Admissions</p>
          <div className="mt-2 text-2xl font-semibold">{stats.total_admissions}</div>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Discharge Requested</p>
          <div className="mt-2 text-2xl font-semibold">{stats.discharge_requested}</div>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Overdue Vitals</p>
          <div className="mt-2 text-2xl font-semibold">{stats.overdue_vitals}</div>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Missing Vitals</p>
          <div className="mt-2 text-2xl font-semibold">{stats.missing_vitals}</div>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Vitals Due Soon</p>
          <div className="mt-2 text-2xl font-semibold">{stats.due_vitals}</div>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">New In 24h</p>
          <div className="mt-2 text-2xl font-semibold">{stats.new_admissions}</div>
        </div>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Priority Nursing Worklist</h2>
          <p className="text-sm text-muted-foreground">
            Start here first. These patients need discharge preparation, first vitals, or urgent monitoring updates.
          </p>
        </div>

        {priorityAdmissions.length === 0 ? (
          <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
            No priority nursing items right now.
          </div>
        ) : (
          <div className="space-y-4">
            {priorityAdmissions.map((admission) => (
              <PatientCard key={admission.id} hospitalSlug={hospitalSlug} admission={admission} />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold">Standard Monitoring Queue</h2>
          <p className="text-sm text-muted-foreground">
            Active admissions that still need routine monitoring and chart review.
          </p>
        </div>

        {standardAdmissions.length === 0 ? (
          <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
            No standard monitoring items right now.
          </div>
        ) : (
          <div className="space-y-4">
            {standardAdmissions.map((admission) => (
              <PatientCard key={admission.id} hospitalSlug={hospitalSlug} admission={admission} />
            ))}
          </div>
        )}
      </section>

      <div className="rounded-xl border p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Next step note</p>
        <p className="mt-1">
          This page is now ready as the nurse monitoring hub. The next strong upgrade is to add a patient-level nurse chart surface with quick vitals entry, nurse note entry, and medication administration tracking.
        </p>
      </div>
    </main>
  );
}
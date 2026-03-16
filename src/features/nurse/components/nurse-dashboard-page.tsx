import Link from "next/link";
import {
  Activity,
  BedDouble,
  ClipboardCheck,
  HeartPulse,
} from "lucide-react";

import { WorkspaceEmptyState } from "@/components/layout/workspace-empty-state";
import { WorkspacePageHeader } from "@/components/layout/workspace-page-header";
import { WorkspaceSectionHeader } from "@/components/layout/workspace-section-header";
import { WorkspaceStatCard } from "@/components/layout/workspace-stat-card";
import { WorkflowStepCard } from "@/components/layout/workflow-step-card";
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
    <div className="flex flex-col gap-4 rounded-xl border bg-background p-4 lg:flex-row lg:items-start lg:justify-between">
      <div className="space-y-3">
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
          {admission.patient?.patient_number ?? "No patient number"} · Ward {admission.ward?.name ?? "—"} · Bed {admission.bed?.bed_number ?? "Unassigned"}
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
            Ward Workspace
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
      <WorkspacePageHeader
        eyebrow="Nursing Station"
        title={hospitalName}
        description="Monitor admitted patients, catch overdue vitals early, and prepare inpatient cases for safe discharge and continued charting."
        actions={
          <>
            <Button asChild>
              <Link href={`/h/${hospitalSlug}/ward`}>Open Ward Workspace</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/census`}>Open Census</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/ward/discharges`}>Discharge Queue</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WorkspaceStatCard
          title="Active Admissions"
          value={stats.total_admissions}
          description="Patients currently under nursing monitoring"
          icon={<BedDouble className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Discharge Requested"
          value={stats.discharge_requested}
          description="Patients needing discharge preparation"
          icon={<ClipboardCheck className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Overdue or Missing Vitals"
          value={stats.overdue_vitals + stats.missing_vitals}
          description="Patients needing immediate nursing attention"
          icon={<HeartPulse className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="New Admissions"
          value={stats.new_admissions}
          description="Patients admitted within the last 24 hours"
          icon={<Activity className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.55fr_.95fr]">
        <div className="space-y-6">
          <section className="space-y-4">
            <WorkspaceSectionHeader
              title="Priority Nursing Worklist"
              description="Start here first. These patients need discharge preparation, first vitals, or urgent monitoring updates."
            />

            {priorityAdmissions.length === 0 ? (
              <WorkspaceEmptyState
                title="No priority nursing items right now"
                description="Patients with discharge requests, overdue vitals, or missing first vitals will appear here."
              />
            ) : (
              <div className="space-y-4">
                {priorityAdmissions.map((admission) => (
                  <PatientCard key={admission.id} hospitalSlug={hospitalSlug} admission={admission} />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <WorkspaceSectionHeader
              title="Standard Monitoring Queue"
              description="Active admissions that still need routine monitoring and chart review."
            />

            {standardAdmissions.length === 0 ? (
              <WorkspaceEmptyState
                title="No standard monitoring items right now"
                description="Routine inpatient monitoring cases will appear here once active admissions are stable."
              />
            ) : (
              <div className="space-y-4">
                {standardAdmissions.map((admission) => (
                  <PatientCard key={admission.id} hospitalSlug={hospitalSlug} admission={admission} />
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Nursing Flow"
              description="Use the same routine for each inpatient shift."
            />

            <div className="mt-4 space-y-3">
              <WorkflowStepCard
                step="Step 1"
                title="Review the priority queue"
                description="Handle discharge requests, missing first vitals, and overdue monitoring before routine rounds."
              />

              <WorkflowStepCard
                step="Step 2"
                title="Open the admission chart"
                description="Record vitals, enter nurse notes, and check the patient’s current ward and bed context."
              />

              <WorkflowStepCard
                step="Step 3"
                title="Prepare for discharge safely"
                description="Complete required nursing actions before the patient moves into final discharge handling."
              />
            </div>
          </section>

          <section className="rounded-2xl border p-4 sm:p-5 text-sm text-muted-foreground">
            <WorkspaceSectionHeader
              title="Monitoring Summary"
              description="Live nursing counts"
            />

            <div className="mt-4 grid gap-3">
              <div className="rounded-xl border bg-muted/30 p-3">Vitals overdue: {stats.overdue_vitals}</div>
              <div className="rounded-xl border bg-muted/30 p-3">Missing first vitals: {stats.missing_vitals}</div>
              <div className="rounded-xl border bg-muted/30 p-3">Vitals due soon: {stats.due_vitals}</div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

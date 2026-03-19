import Link from "next/link";
import {
  BedDouble,
  Building2,
  ClipboardCheck,
  UserPlus,
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
      <WorkspaceSectionHeader
        title="Ward Capacity"
        description="Current occupancy and discharge pressure by ward."
      />

      {wards.length === 0 ? (
        <WorkspaceEmptyState
          title="No wards configured yet"
          description="Create wards and beds first so admissions can be assigned safely."
          action={
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/ward/config`}>Open Ward Setup</Link>
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {wards.map((ward) => (
            <div key={ward.id} className="rounded-xl border bg-background p-4">
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
                  <Link href={`/h/${hospitalSlug}/ward/config`}>Ward Setup</Link>
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
      <WorkspaceSectionHeader
        title="Active Ward Worklist"
        description="Admitted patients ready for chart review, transfers, monitoring, and discharge work."
      />

      {admissions.length === 0 ? (
        <WorkspaceEmptyState
          title="No active admissions in ward right now"
          description="Once patients are admitted and assigned into ward workflow, they will appear here."
        />
      ) : (
        <div className="space-y-4">
          {admissions.map((admission) => (
            <div
              key={admission.id}
              className="flex flex-col gap-4 rounded-xl border bg-background p-4 lg:flex-row lg:items-start lg:justify-between"
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
                  {admission.patient?.patient_number ?? "No patient number"} · Ward {admission.ward?.name ?? "—"} · Bed {admission.bed?.bed_number ?? "Unassigned"}
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
      <WorkspacePageHeader
        eyebrow="Ward Workspace"
        title="Ward Workspace"
        description="Manage admitted patients, maintain bed visibility, monitor discharge pressure, and move active inpatient cases safely through ward operations."
        actions={
          <>
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
              <Link href={`/h/${hospitalSlug}/ward/config`}>Ward Setup</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WorkspaceStatCard
          title="Active Admissions"
          value={stats.active_admissions}
          description="Patients currently in ward workflow"
          icon={<Building2 className="h-4 w-4" />}
        />

        <WorkspaceStatCard
          title="Discharge Requested"
          value={stats.discharge_requested}
          description="Patients needing discharge handling first"
          icon={<ClipboardCheck className="h-4 w-4" />}
        />

        <WorkspaceStatCard
          title="Available Beds"
          value={stats.available_beds}
          description={`${stats.total_beds} total beds configured`}
          icon={<BedDouble className="h-4 w-4" />}
        />

        <WorkspaceStatCard
          title="New In 24 Hours"
          value={stats.newly_admitted}
          description="Recently admitted patients entering ward flow"
          icon={<UserPlus className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.55fr_.95fr]">
        <div className="space-y-6">
          {dischargeRequestedAdmissions.length > 0 ? (
            <section className="space-y-4">
              <WorkspaceSectionHeader
                title="Discharge Priority"
                description="These admissions already have discharge requested and should be reviewed first."
              />

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
                        {admission.patient?.patient_number ?? "No patient number"} · Ward {admission.ward?.name ?? "—"} · Bed {admission.bed?.bed_number ?? "Unassigned"}
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

          <PatientWorklistSection hospitalSlug={hospitalSlug} admissions={standardAdmissions} />
        </div>

        <div className="space-y-6">
          <WardSummarySection hospitalSlug={hospitalSlug} wards={wards} />

          <section className="rounded-2xl border p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Ward Flow"
              description="Core inpatient operations"
            />

            <div className="mt-4 space-y-3">
              <WorkflowStepCard
                step="Step 1"
                title="Admit and assign"
                description="Admit the patient, assign ward and bed, and confirm the inpatient chart is ready."
              />

              <WorkflowStepCard
                step="Step 2"
                title="Monitor ward status"
                description="Use census and active charts to track occupancy, transfers, and inpatient progress."
              />

              <WorkflowStepCard
                step="Step 3"
                title="Move discharge cases first"
                description="Prioritize charts with discharge requested so ward capacity is updated promptly."
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}


import Link from "next/link";
import { ClipboardCheck, FileCheck2, ListChecks, TriangleAlert } from "lucide-react";

import { WorkspaceEmptyState } from "@/components/layout/workspace-empty-state";
import { WorkspacePageHeader } from "@/components/layout/workspace-page-header";
import { WorkspaceSectionHeader } from "@/components/layout/workspace-section-header";
import { WorkspaceStatCard } from "@/components/layout/workspace-stat-card";
import { Button } from "@/components/ui/button";

function fullName(patient: any) {
  if (!patient) return "Unknown patient";
  return [patient.first_name, patient.middle_name, patient.last_name].filter(Boolean).join(" ");
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function checklistProgress(admission: any) {
  const total = admission.checklist_total ?? 0;
  const completed = admission.checklist_completed ?? 0;
  return `${completed}/${total}`;
}

export function WardDischargeQueuePage({
  hospitalSlug,
  hospitalName,
  admissions,
}: {
  hospitalSlug: string;
  hospitalName: string;
  admissions: any[];
}) {
  const readyCount = admissions.filter((row) => row.checklist_ready === true).length;
  const blockedCount = admissions.filter((row) => row.checklist_ready !== true).length;

  return (
    <main className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Discharge Queue"
        title={hospitalName}
        description="Review discharge-requested admissions first, confirm checklist completion, and clear patients out of ward flow safely."
        actions={
          <>
            <Button asChild>
              <Link href={`/h/${hospitalSlug}/ward`}>Ward Workspace</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/census`}>Open Census</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WorkspaceStatCard
          title="Discharge Requested"
          value={admissions.length}
          description="Admissions already marked for discharge handling"
          icon={<ClipboardCheck className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Checklist Ready"
          value={readyCount}
          description="Admissions that can move forward safely"
          icon={<FileCheck2 className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Still Blocked"
          value={blockedCount}
          description="Admissions missing discharge requirements"
          icon={<TriangleAlert className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Queue Reviewed"
          value={readyCount + blockedCount}
          description="Current discharge queue load"
          icon={<ListChecks className="h-4 w-4" />}
        />
      </div>

      {admissions.length === 0 ? (
        <WorkspaceEmptyState
          title="No discharge requests yet"
          description="Patients marked for discharge by the care team will appear here automatically."
          action={
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/ward`}>Return to Ward Workspace</Link>
            </Button>
          }
        />
      ) : (
        <section className="space-y-4 rounded-2xl border p-4 sm:p-5">
          <WorkspaceSectionHeader
            title="Patients Awaiting Discharge"
            description="Handle patients with completed checklists first so beds are released quickly."
          />

          <div className="space-y-4">
            {admissions.map((admission) => (
              <div
                key={admission.id}
                className="flex flex-col gap-4 rounded-xl border bg-background p-4 lg:flex-row lg:items-start lg:justify-between"
              >
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{fullName(admission.patient)}</p>
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                      discharge requested
                    </span>

                    {admission.checklist_ready ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                        checklist ready
                      </span>
                    ) : (
                      <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-700">
                        checklist incomplete
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {admission.patient?.patient_number ?? "No patient number"} · Ward {admission.ward?.name ?? "—"} · Bed {admission.bed?.bed_number ?? "Unassigned"}
                  </p>

                  <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
                    <p>Requested at: {formatDateTime(admission.discharge_requested_at)}</p>
                    <p>Admitted at: {formatDateTime(admission.admitted_at)}</p>
                    <p>Doctor: {admission.admitting_doctor?.full_name ?? "Unknown"}</p>
                    <p>Checklist: {checklistProgress(admission)}</p>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    Reason: {admission.admission_reason ?? "—"}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button asChild>
                    <Link href={`/h/${hospitalSlug}/ward/admissions/${admission.id}`}>
                      Open Discharge Chart
                    </Link>
                  </Button>

                  <Button asChild variant="outline">
                    <Link href={`/h/${hospitalSlug}/census`}>
                      Census
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

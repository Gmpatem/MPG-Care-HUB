import Link from "next/link";
import {
  ClipboardList,
  FlaskConical,
  Stethoscope,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { WorkspacePageHeader } from "@/components/layout/workspace-page-header";
import { WorkspaceSectionHeader } from "@/components/layout/workspace-section-header";
import { WorkspaceStatCard } from "@/components/layout/workspace-stat-card";
import { WorkflowStepCard } from "@/components/layout/workflow-step-card";
import { StatusBadge } from "@/components/layout/status-badge";
import { InfoGrid } from "@/components/layout/info-grid";
import { WorkspaceEmptyState } from "@/components/layout/workspace-empty-state";
import {
  SharedPatientContext,
  fullName,
  formatDateTime,
  encounterTone,
  encounterLabel,
} from "@/components/layout/shared-patient-context";
import { RelatedActionsSection } from "@/components/layout/related-workspace-actions";

export function DoctorPatientWorkspacePage({
  hospitalSlug,
  patient,
  appointment,
  encounter,
  labOrders,
  prescriptions,
}: {
  hospitalSlug: string;
  patient: any;
  appointment: any;
  encounter: any | null;
  labOrders: any[];
  prescriptions: any[];
}) {
  const activeLabOrders = labOrders.filter((row) => row.status !== "completed");
  const completedLabOrders = labOrders.filter((row) => row.status === "completed");
  const activePrescriptions = prescriptions.filter((row) => row.status !== "dispensed");

  return (
    <main className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Clinical Workspace"
        title={fullName(patient)}
        description="Review the active visit, move the encounter forward, order investigations, prescribe treatment, and decide whether the patient continues outpatient care or needs admission."
        actions={
          <>
            <Button asChild>
              <Link href={`/h/${hospitalSlug}/doctor`}>Back to Doctor Queue</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/encounters`}>All Encounters</Link>
            </Button>
            {appointment?.id ? (
              <Button asChild variant="outline">
                <Link href={`/h/${hospitalSlug}/doctor/appointments/${appointment.id}/open`}>
                  Open Visit
                </Link>
              </Button>
            ) : null}
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WorkspaceStatCard
          title="Encounter Stage"
          value={encounter ? encounterLabel(encounter.stage) : "new consultation"}
          description={encounter?.status ? `Status: ${encounter.status}` : "No encounter started yet"}
          icon={<Stethoscope className="h-4 w-4" />}
          valueClassName="text-xl"
        />
        <WorkspaceStatCard
          title="Active Lab Orders"
          value={activeLabOrders.length}
          description={`${completedLabOrders.length} already completed`}
          icon={<FlaskConical className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Active Prescriptions"
          value={activePrescriptions.length}
          description={`${prescriptions.length} total prescriptions on record`}
          icon={<ClipboardList className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Admission Requested"
          value={encounter?.admission_requested ? "Yes" : "No"}
          description={encounter?.final_decision_at ? `Decision made ${formatDateTime(encounter.final_decision_at)}` : "No admission request yet"}
          icon={<UserRound className="h-4 w-4" />}
          valueClassName="text-xl"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.45fr_.95fr]">
        <div className="space-y-6">
          {/* Shared Patient Context */}
          <SharedPatientContext
            hospitalSlug={hospitalSlug}
            patient={patient}
            appointment={appointment}
            encounter={encounter}
            showRelatedLinks={true}
            primaryItems={[
              { label: "Sex", value: patient?.sex },
              { label: "Phone", value: patient?.phone },
              { label: "Scheduled", value: formatDateTime(appointment?.scheduled_at) },
              { label: "Checked In", value: formatDateTime(appointment?.check_in_at) },
            ]}
            secondaryItems={[
              { label: "Queue Number", value: appointment?.queue_number },
              { label: "Assigned Staff", value: appointment?.staff?.full_name ?? appointment?.staff_name },
              { label: "Encounter Status", value: encounter?.status },
              { label: "Results Reviewed", value: formatDateTime(encounter?.results_reviewed_at) },
            ]}
          />

          {/* Related Actions */}
          <RelatedActionsSection
            hospitalSlug={hospitalSlug}
            patientId={patient?.id}
            encounterId={encounter?.id}
            appointmentId={appointment?.id}
            currentWorkspace="doctor"
            title="Continue Care"
          />

          <section className="surface-panel p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Visit Notes"
              description="Core doctor-facing context for the active consultation."
            />

            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Chief Complaint
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground">
                  {encounter?.chief_complaint ?? appointment?.reason ?? "—"}
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  History Notes
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground">
                  {encounter?.history_notes ?? "—"}
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Assessment Notes
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground">
                  {encounter?.assessment_notes ?? "—"}
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Plan Notes
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground">
                  {encounter?.plan_notes ?? "—"}
                </p>
              </div>
            </div>
          </section>

          <section className="surface-panel p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Lab Orders"
              description="Investigations linked to this clinical workflow."
            />

            {labOrders.length === 0 ? (
              <div className="mt-4">
                <WorkspaceEmptyState
                  title="No lab orders for this patient yet"
                  description="Doctor-requested investigations will appear here once they are created from the encounter workflow."
                />
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {labOrders.map((order) => (
                  <div key={order.id} className="rounded-2xl border border-border/70 bg-background p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-foreground">Lab Order</p>
                          <StatusBadge
                            label={order.status?.replaceAll("_", " ") ?? "ordered"}
                            tone={order.status === "completed" ? "success" : order.status === "in_progress" ? "info" : "warning"}
                            className="px-2.5 py-1 capitalize font-medium"
                          />
                          <StatusBadge
                            label={order.priority ?? "routine"}
                            tone={order.priority === "urgent" ? "danger" : "neutral"}
                            className="px-2.5 py-1 capitalize font-medium"
                          />
                        </div>

                        <InfoGrid
                          items={[
                            { label: "Ordered At", value: formatDateTime(order.ordered_at) },
                            { label: "Completed At", value: formatDateTime(order.completed_at) },
                            { label: "Clinical Notes", value: order.clinical_notes },
                            { label: "Items", value: order.items_count ?? order.lab_order_items?.length ?? 0 },
                          ]}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button asChild size="sm">
                          <Link href={`/h/${hospitalSlug}/lab/orders/${order.id}`}>
                            Open Lab Order
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="surface-panel p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Prescriptions"
              description="Medication plans created during this visit."
            />

            {prescriptions.length === 0 ? (
              <div className="mt-4">
                <WorkspaceEmptyState
                  title="No prescriptions recorded yet"
                  description="Prescriptions written from the doctor workflow will appear here automatically."
                />
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {prescriptions.map((prescription) => (
                  <div key={prescription.id} className="rounded-2xl border border-border/70 bg-background p-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-foreground">Prescription</p>
                          <StatusBadge
                            label={prescription.status?.replaceAll("_", " ") ?? "active"}
                            tone={prescription.status === "dispensed" ? "success" : prescription.status === "partially_dispensed" ? "warning" : "info"}
                            className="px-2.5 py-1 capitalize font-medium"
                          />
                        </div>

                        <InfoGrid
                          items={[
                            { label: "Prescribed At", value: formatDateTime(prescription.prescribed_at) },
                            { label: "Items", value: prescription.items_count ?? prescription.prescription_items?.length ?? 0 },
                            { label: "Notes", value: prescription.notes },
                            { label: "Encounter", value: prescription.encounter_id },
                          ]}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button asChild size="sm">
                          <Link href={`/h/${hospitalSlug}/pharmacy/prescriptions/${prescription.id}`}>
                            Open Prescription
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <RelatedActionsSection
            hospitalSlug={hospitalSlug}
            patientId={patient?.id}
            encounterId={encounter?.id}
            appointmentId={appointment?.id}
            currentWorkspace="doctor"
            title="Related Workspaces"
          />

          <section className="surface-panel p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Doctor Flow"
              description="Keep the consultation moving with less context switching."
            />

            <div className="mt-4 space-y-3">
              <WorkflowStepCard
                step="Step 1"
                title="Review patient and visit context"
                description="Confirm the presenting problem, current encounter stage, and visit timing before ordering or prescribing."
              />

              <WorkflowStepCard
                step="Step 2"
                title="Move the encounter forward"
                description="Order labs, review results, prescribe treatment, and document the final decision clearly."
              />

              <WorkflowStepCard
                step="Step 3"
                title="Escalate when needed"
                description="If the patient requires inpatient care, make the admission request visible and explicit in the workflow."
              />
            </div>
          </section>

          <section className="surface-panel p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Encounter Snapshot"
              description="Quick clinician context"
            />

            <div className="mt-4">
              <InfoGrid
                items={[
                  { label: "Encounter Started", value: formatDateTime(encounter?.started_at) },
                  { label: "Encounter Finalized", value: formatDateTime(encounter?.finalized_at) },
                  { label: "Requires Lab", value: encounter?.requires_lab ? "Yes" : "No" },
                  { label: "Disposition", value: encounter?.disposition_type?.replaceAll("_", " ") },
                ]}
                columnsClassName="sm:grid-cols-2"
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

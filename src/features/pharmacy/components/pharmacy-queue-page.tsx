import Link from "next/link";
import {
  AlertTriangle,
  ClipboardList,
  Pill,
  Receipt,
} from "lucide-react";

import { StatusBadge } from "@/components/layout/status-badge";
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

function statusTone(status: string) {
  if (status === "dispensed") return "success" as const;
  if (status === "partially_dispensed") return "warning" as const;
  return "neutral" as const;
}

function EmptyState({ hospitalSlug }: { hospitalSlug: string }) {
  return (
    <WorkspaceEmptyState
      title="No prescriptions received yet"
      description="Doctor prescriptions will appear here automatically after they are created from the clinical workflow."
      action={
        <Button asChild variant="outline">
          <Link href={`/h/${hospitalSlug}/doctor`}>Open Doctor Workspace</Link>
        </Button>
      }
    />
  );
}

function Section({
  title,
  description,
  prescriptions,
  hospitalSlug,
}: {
  title: string;
  description: string;
  prescriptions: any[];
  hospitalSlug: string;
}) {
  return (
    <section className="surface-panel p-4 sm:p-5">
      <WorkspaceSectionHeader title={title} description={description} />

      {prescriptions.length === 0 ? (
        <div className="mt-4 rounded-2xl border border-dashed border-border/80 bg-background/50 p-4 text-sm text-muted-foreground">
          No prescriptions in this section.
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {prescriptions.map((prescription) => (
            <div
              key={prescription.id}
              className="rounded-2xl border border-border/70 bg-background p-4 shadow-[0_8px_24px_rgba(15,23,42,0.03)]"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-semibold text-foreground">{fullName(prescription.patient)}</p>

                    <StatusBadge
                      label={prescription.status.replaceAll("_", " ")}
                      tone={statusTone(prescription.status)}
                      className="px-2.5 py-1 capitalize font-medium"
                    />

                    <StatusBadge
                      label={prescription.prescribed_by_staff?.full_name ? "from doctor" : "received"}
                      tone="info"
                      className="px-2.5 py-1 font-medium"
                    />

                    {prescription.no_stock_count > 0 ? (
                      <StatusBadge
                        label={`${prescription.no_stock_count} no stock`}
                        tone="danger"
                        className="px-2.5 py-1 font-medium"
                      />
                    ) : (
                      <StatusBadge
                        label="stock ready"
                        tone="success"
                        className="px-2.5 py-1 font-medium"
                      />
                    )}
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {prescription.patient?.patient_number ?? "No patient number"} · Received {formatDateTime(prescription.prescribed_at)}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Prescriber: {prescription.prescribed_by_staff?.full_name ?? "Unknown"}
                  </p>

                  <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-4">
                    <p>Total items: {prescription.item_count}</p>
                    <p>Pending: {prescription.pending_count}</p>
                    <p>Partial: {prescription.partial_count}</p>
                    <p>Dispensed: {prescription.dispensed_count}</p>
                  </div>

                  <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-3">
                    <p>Ready items: {prescription.stock_ready_count}</p>
                    <p>No stock items: {prescription.no_stock_count}</p>
                    <p>Completion: {prescription.completion_ratio}%</p>
                  </div>

                  {prescription.notes ? (
                    <div className="rounded-2xl border border-border/70 bg-background/70 p-3 text-sm text-muted-foreground">
                      {prescription.notes}
                    </div>
                  ) : null}
                </div>

                <div className="flex gap-2">
                  <Button asChild>
                    <Link href={`/h/${hospitalSlug}/pharmacy/prescriptions/${prescription.id}`}>
                      Open for Dispensing
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function PharmacyQueuePage({
  hospitalSlug,
  hospitalName,
  prescriptions,
}: {
  hospitalSlug: string;
  hospitalName: string;
  prescriptions: any[];
}) {
  const incoming = prescriptions.filter((p) => p.workflow_bucket === "incoming");
  const partial = prescriptions.filter((p) => p.workflow_bucket === "partial");
  const completed = prescriptions.filter((p) => p.workflow_bucket === "completed");

  const activeCount = prescriptions.filter((p) => p.status === "active").length;
  const partialCount = prescriptions.filter((p) => p.status === "partially_dispensed").length;
  const dispensedCount = prescriptions.filter((p) => p.status === "dispensed").length;
  const noStockPrescriptionCount = prescriptions.filter((p) => p.no_stock_count > 0).length;

  return (
    <main className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Pharmacy Workspace"
        title="Pharmacy"
        description="Receive doctor prescriptions, confirm stock availability, dispense medication safely, and track partial fulfillment without losing item-level visibility."
        actions={
          <>
            <Button asChild>
              <Link href={`/h/${hospitalSlug}/pharmacy`}>Refresh Dispensing Queue</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/doctor`}>Doctor Workspace</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WorkspaceStatCard
          title="Incoming Prescriptions"
          value={incoming.length}
          description="New prescriptions waiting for pharmacy action"
          icon={<ClipboardList className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="In Progress"
          value={partialCount}
          description="Prescriptions partially dispensed or still being prepared"
          icon={<Pill className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Completed"
          value={dispensedCount}
          description="Prescriptions fully dispensed"
          icon={<Receipt className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Stock Issues"
          value={noStockPrescriptionCount}
          description="Prescriptions blocked by unavailable medication"
          icon={<AlertTriangle className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.55fr_.95fr]">
        <div className="space-y-6">
          {prescriptions.length === 0 ? (
            <EmptyState hospitalSlug={hospitalSlug} />
          ) : (
            <>
              <Section
                title="Incoming from Doctors"
                description="Start here first. These prescriptions have reached pharmacy and still need dispensing action."
                prescriptions={incoming}
                hospitalSlug={hospitalSlug}
              />

              <Section
                title="Partially Dispensed"
                description="These prescriptions still have pending items or stock-related follow-up."
                prescriptions={partial}
                hospitalSlug={hospitalSlug}
              />

              <Section
                title="Completed"
                description="Recently completed dispensing records."
                prescriptions={completed}
                hospitalSlug={hospitalSlug}
              />
            </>
          )}
        </div>

        <div className="space-y-6">
          <section className="surface-panel p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Dispensing Flow"
              description="Use this same rhythm for every prescription."
            />

            <div className="mt-4 space-y-3">
              <WorkflowStepCard
                step="Step 1"
                title="Open the prescription"
                description="Review prescriber details, item list, quantities, and special instructions."
              />

              <WorkflowStepCard
                step="Step 2"
                title="Confirm stock by item"
                description="Dispense what is available, flag missing stock, and keep partial fulfillment visible."
              />

              <WorkflowStepCard
                step="Step 3"
                title="Complete or continue later"
                description="Mark items as dispensed and return later if the prescription is only partially fulfilled."
              />
            </div>
          </section>

          <section className="surface-panel p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Queue Summary"
              description="Live pharmacy counts"
            />

            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border border-border/70 bg-background/70 p-3 text-sm text-muted-foreground">
                Total prescriptions
                <div className="mt-1 text-lg font-semibold text-foreground">{prescriptions.length}</div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/70 p-3 text-sm text-muted-foreground">
                Active status
                <div className="mt-1 text-lg font-semibold text-foreground">{activeCount}</div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/70 p-3 text-sm text-muted-foreground">
                Workflow partial
                <div className="mt-1 text-lg font-semibold text-foreground">{partial.length}</div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/70 p-3 text-sm text-muted-foreground">
                Workflow completed
                <div className="mt-1 text-lg font-semibold text-foreground">{completed.length}</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";
import { ClipboardCheck, FlaskConical, TestTubeDiagonal, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WorkspacePageHeader } from "@/components/layout/workspace-page-header";
import { WorkspaceSectionHeader } from "@/components/layout/workspace-section-header";
import { WorkspaceStatCard } from "@/components/layout/workspace-stat-card";
import { WorkflowStepCard } from "@/components/layout/workflow-step-card";
import { StatusBadge } from "@/components/layout/status-badge";
import { InfoGrid } from "@/components/layout/info-grid";
import { PatientSummaryPanel } from "@/components/layout/patient-summary-panel";

function fullName(patient: any) {
  if (!patient) return "Unknown patient";
  return [patient.first_name, patient.middle_name, patient.last_name].filter(Boolean).join(" ");
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function orderTone(status: string | null) {
  if (status === "completed") return "success" as const;
  if (status === "in_progress") return "info" as const;
  if (status === "cancelled") return "danger" as const;
  return "warning" as const;
}

function itemTone(status: string | null) {
  if (status === "verified") return "success" as const;
  if (status === "entered") return "info" as const;
  if (status === "pending") return "warning" as const;
  return "neutral" as const;
}

export function LabOrderDetailPage({
  hospitalSlug,
  order,
  items,
}: {
  hospitalSlug: string;
  order: any;
  items: any[];
}) {
  const completedItems = items.filter((item) => item.status === "verified" || item.status === "completed").length;
  const pendingItems = items.filter((item) => item.status === "pending").length;
  const enteredItems = items.filter((item) => item.status === "entered").length;

  return (
    <main className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Laboratory Order"
        title={fullName(order?.patient)}
        description="Review the full investigation request, enter results item by item, verify completed results, and keep doctor follow-up visible."
        actions={
          <>
            <Button asChild>
              <Link href={`/h/${hospitalSlug}/lab`}>Back to Lab Queue</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/doctor`}>Doctor Workspace</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WorkspaceStatCard
          title="Order Status"
          value={order?.status?.replaceAll("_", " ") ?? "ordered"}
          description={`Priority: ${order?.priority ?? "routine"}`}
          icon={<FlaskConical className="h-4 w-4" />}
          valueClassName="text-xl"
        />
        <WorkspaceStatCard
          title="Items Total"
          value={items.length}
          description="Requested tests on this order"
          icon={<TestTubeDiagonal className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Entered / Verified"
          value={`${enteredItems + completedItems}/${items.length}`}
          description="Results already touched by lab staff"
          icon={<ClipboardCheck className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Pending"
          value={pendingItems}
          description="Tests still waiting for result entry"
          icon={<UserRound className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.45fr_.95fr]">
        <div className="space-y-6">
          <PatientSummaryPanel
            name={fullName(order?.patient)}
            patientNumber={order?.patient?.patient_number}
            subtitle={`Lab order received ${formatDateTime(order?.ordered_at)}`}
            statusLabel={order?.status?.replaceAll("_", " ") ?? "ordered"}
            statusTone={orderTone(order?.status)}
            primaryItems={[
              { label: "Priority", value: order?.priority },
              { label: "Ordered At", value: formatDateTime(order?.ordered_at) },
              { label: "Sample Collected", value: formatDateTime(order?.sample_collected_at) },
              { label: "Completed At", value: formatDateTime(order?.completed_at) },
            ]}
            secondaryItems={[
              { label: "Ordered By", value: order?.ordered_by_staff?.full_name ?? "Unknown" },
              { label: "Encounter", value: order?.encounter_id },
              { label: "Appointment", value: order?.appointment_id },
              { label: "Patient Phone", value: order?.patient?.phone },
            ]}
          />

          <section className="surface-panel p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Clinical Notes"
              description="Doctor-provided context for the requested investigations."
            />

            <div className="mt-4 rounded-2xl border border-border/70 bg-background/70 p-4 text-sm leading-6 text-foreground">
              {order?.clinical_notes ?? "—"}
            </div>
          </section>

          <section className="surface-panel p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Lab Result Items"
              description="Enter and verify results item by item so incomplete work stays visible."
            />

            <div className="mt-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="rounded-2xl border border-border/70 bg-background p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-foreground">{item.test_name}</p>
                        <StatusBadge
                          label={item.status?.replaceAll("_", " ") ?? "pending"}
                          tone={itemTone(item.status)}
                          className="px-2.5 py-1 capitalize font-medium"
                        />
                      </div>

                      <InfoGrid
                        items={[
                          { label: "Unit", value: item.unit },
                          { label: "Reference Range", value: item.reference_range },
                          { label: "Entered At", value: formatDateTime(item.entered_at) },
                          { label: "Verified At", value: formatDateTime(item.verified_at) },
                        ]}
                      />

                      <div className="grid gap-3 xl:grid-cols-2">
                        <div className="rounded-2xl border border-border/70 bg-background/70 p-4 text-sm">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Result Text
                          </p>
                          <p className="mt-2 leading-6 text-foreground">
                            {item.result_text ?? "—"}
                          </p>
                        </div>

                        <div className="rounded-2xl border border-border/70 bg-background/70 p-4 text-sm">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Notes
                          </p>
                          <p className="mt-2 leading-6 text-foreground">
                            {item.notes ?? "—"}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button asChild size="sm">
                        <Link href={`/h/${hospitalSlug}/lab/orders/${order.id}/items/${item.id}`}>
                          Enter Result
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="surface-panel p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Lab Flow"
              description="Safe result-entry routine"
            />

            <div className="mt-4 space-y-3">
              <WorkflowStepCard
                step="Step 1"
                title="Confirm patient and order context"
                description="Review the doctor’s notes, order priority, and collection timing before entering results."
              />

              <WorkflowStepCard
                step="Step 2"
                title="Enter results by test"
                description="Record each requested investigation separately so pending items remain visible."
              />

              <WorkflowStepCard
                step="Step 3"
                title="Verify and release"
                description="Mark completed results clearly so the doctor can continue the patient decision flow."
              />
            </div>
          </section>

          <section className="surface-panel p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Order Snapshot"
              description="Quick lab context"
            />

            <div className="mt-4">
              <InfoGrid
                items={[
                  { label: "Pending Items", value: pendingItems },
                  { label: "Entered Items", value: enteredItems },
                  { label: "Verified / Completed", value: completedItems },
                  { label: "Priority", value: order?.priority },
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

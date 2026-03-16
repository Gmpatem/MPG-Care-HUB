import Link from "next/link";
import { ClipboardList, FlaskConical, ListChecks, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WorkspacePageHeader } from "@/components/layout/workspace-page-header";
import { WorkspaceSectionHeader } from "@/components/layout/workspace-section-header";
import { WorkspaceStatCard } from "@/components/layout/workspace-stat-card";
import { LabOrderItemResultForm } from "@/features/lab/components/lab-order-item-result-form";
import { CompleteLabOrderButton } from "@/features/lab/components/complete-lab-order-button";

function fullName(patient: any) {
  if (!patient) return "Unknown patient";
  return [patient.first_name, patient.middle_name, patient.last_name].filter(Boolean).join(" ");
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return date.toLocaleString();
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
  const enteredCount = items.filter((item) => item.entered_at || item.result_text).length;
  const completedCount = items.filter((item) => item.status === "completed" || item.status === "verified").length;
  const pendingCount = items.length - completedCount;
  const isCompleted = order.status === "completed";

  return (
    <main className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Lab Result Entry"
        title="Lab Order"
        description="Review the patient, complete result entry item by item, then mark the order complete so the doctor can continue the encounter."
        actions={
          <>
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/lab/orders`}>Back to Lab Queue</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/doctor`}>Doctor Workspace</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WorkspaceStatCard
          title="Requested Items"
          value={items.length}
          description="Total investigations included on this order"
          icon={<ClipboardList className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Results Entered"
          value={enteredCount}
          description="Items with at least partial result data entered"
          icon={<FlaskConical className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Completed Items"
          value={completedCount}
          description="Items already marked complete or verified"
          icon={<ListChecks className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Still Pending"
          value={pendingCount}
          description="Items still needing laboratory action"
          icon={<TriangleAlert className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.25fr_.95fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Patient and Order Summary"
              description="Confirm patient identity, ordering doctor, and urgency before entering or verifying results."
            />

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border bg-muted/30 p-4">
                <p className="text-sm text-muted-foreground">Patient</p>
                <h2 className="mt-1 text-lg font-semibold">{fullName(order.patient)}</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {order.patient?.patient_number ?? "No patient number"} · {order.patient?.sex ?? "unknown"} · {order.patient?.phone ?? "No phone"}
                </p>
              </div>

              <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                <p>Status: {order.status ?? "ordered"}</p>
                <p className="mt-1">Priority: {order.priority ?? "routine"}</p>
                <p className="mt-1">Ordered at: {formatDateTime(order.ordered_at)}</p>
                <p className="mt-1">Completed at: {formatDateTime(order.completed_at)}</p>
                <p className="mt-1">Ordering doctor: {order.ordered_by_staff?.full_name ?? "Unknown"}</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border bg-muted/30 p-4">
              <p className="text-sm font-medium">Clinical Notes</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                {order.clinical_notes || "—"}
              </p>
            </div>
          </section>

          <section className="space-y-4 rounded-2xl border p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Requested Test Items"
              description="Enter or update results for each item on this order."
            />

            {items.length === 0 ? (
              <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                This lab order has no items yet.
              </div>
            ) : (
              items.map((item) => (
                <LabOrderItemResultForm
                  key={item.id}
                  hospitalSlug={hospitalSlug}
                  labOrderId={order.id}
                  item={item}
                />
              ))
            )}
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Completion"
              description="Complete the order after all required results are entered."
            />

            <div className="mt-4">
              <CompleteLabOrderButton
                hospitalSlug={hospitalSlug}
                labOrderId={order.id}
                disabled={isCompleted}
              />
            </div>

            {isCompleted ? (
              <p className="mt-3 text-sm text-emerald-700">
                This order has already been marked completed.
              </p>
            ) : (
              <p className="mt-3 text-sm text-muted-foreground">
                Mark the order complete only after all necessary test results are ready for doctor review.
              </p>
            )}
          </section>

          <section className="rounded-2xl border p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Lab Flow"
              description="Safe result-entry routine"
            />

            <div className="mt-4 space-y-3">
              <div className="rounded-xl border bg-muted/40 p-4">
                <p className="text-sm font-medium">Step 1: Confirm the patient and request</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Always verify the patient, doctor, and urgency level before entering results.
                </p>
              </div>

              <div className="rounded-xl border bg-muted/40 p-4">
                <p className="text-sm font-medium">Step 2: Record item by item</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Enter results per requested test so incomplete work remains visible and traceable.
                </p>
              </div>

              <div className="rounded-xl border bg-muted/40 p-4">
                <p className="text-sm font-medium">Step 3: Return the case to doctor review</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Completing the order moves the case back into the clinical decision workflow.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

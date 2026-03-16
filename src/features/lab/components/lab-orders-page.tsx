import Link from "next/link";
import { ClipboardList, FlaskConical, ListChecks, TriangleAlert } from "lucide-react";

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

function orderTone(status: string) {
  if (status === "completed") return "bg-emerald-100 text-emerald-700";
  if (status === "in_progress" || status === "sample_collected") return "bg-blue-100 text-blue-700";
  if (status === "ordered") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
}

function bucketOrders(orders: any[]) {
  return {
    pending: orders.filter((row) => row.status === "ordered"),
    inProgress: orders.filter((row) => row.status === "in_progress" || row.status === "sample_collected"),
    completed: orders.filter((row) => row.status === "completed"),
  };
}

function OrdersSection({
  title,
  description,
  hospitalSlug,
  orders,
}: {
  title: string;
  description: string;
  hospitalSlug: string;
  orders: any[];
}) {
  return (
    <section className="space-y-4 rounded-2xl border p-4 sm:p-5">
      <WorkspaceSectionHeader title={title} description={description} />

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
          No lab orders in this section.
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="flex flex-col gap-4 rounded-xl border bg-background p-4 lg:flex-row lg:items-start lg:justify-between"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{fullName(order.patient)}</p>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${orderTone(order.status)}`}>
                    {order.status}
                  </span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                    {order.priority ?? "routine"}
                  </span>
                  {(order.pending_items_count ?? 0) > 0 ? (
                    <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                      {order.pending_items_count} pending items
                    </span>
                  ) : null}
                </div>

                <p className="text-sm text-muted-foreground">
                  {order.patient?.patient_number ?? "No patient number"} · Ordered {formatDateTime(order.ordered_at)}
                </p>

                <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
                  <p>Doctor: {order.ordered_by_staff?.full_name ?? "Unknown"}</p>
                  <p>Encounter: {order.encounter_id ?? "—"}</p>
                  <p>Total items: {order.total_items_count ?? 0}</p>
                  <p>Completed items: {order.completed_items_count ?? 0}</p>
                </div>

                <p className="text-sm text-muted-foreground">
                  Clinical note: {order.clinical_notes ?? "—"}
                </p>
              </div>

              <div className="flex gap-2">
                <Button asChild>
                  <Link href={`/h/${hospitalSlug}/lab/orders/${order.id}`}>
                    Open Result Entry
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

export function LabOrdersPage({
  hospitalSlug,
  hospitalName,
  orders,
}: {
  hospitalSlug: string;
  hospitalName: string;
  orders: any[];
}) {
  const buckets = bucketOrders(orders);

  return (
    <main className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Lab Orders Queue"
        title={hospitalName}
        description="Review incoming requests, enter results by item, and return completed investigations back to the doctor workflow."
        actions={
          <>
            <Button asChild>
              <Link href={`/h/${hospitalSlug}/lab`}>Lab Dashboard</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/doctor`}>Doctor Workspace</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WorkspaceStatCard
          title="Awaiting Result Entry"
          value={buckets.pending.length}
          description="Freshly ordered tests not yet worked on"
          icon={<ClipboardList className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="In Progress"
          value={buckets.inProgress.length}
          description="Orders being processed or partially completed"
          icon={<FlaskConical className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Completed"
          value={buckets.completed.length}
          description="Finished investigations ready for review"
          icon={<ListChecks className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="High Priority"
          value={orders.filter((row) => row.priority === "urgent" || row.priority === "stat").length}
          description="Urgent orders needing faster turnaround"
          icon={<TriangleAlert className="h-4 w-4" />}
        />
      </div>

      {orders.length === 0 ? (
        <WorkspaceEmptyState
          title="No lab orders yet"
          description="Doctor lab requests will appear here automatically once they are created from an encounter."
          action={
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/doctor`}>Open Doctor Workspace</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          <OrdersSection
            title="Awaiting Result Entry"
            description="Start here first. These orders are newly received and still need action."
            hospitalSlug={hospitalSlug}
            orders={buckets.pending}
          />

          <OrdersSection
            title="In Progress"
            description="Orders with active work already started."
            hospitalSlug={hospitalSlug}
            orders={buckets.inProgress}
          />

          <OrdersSection
            title="Completed"
            description="Finished investigations that have already moved through the lab."
            hospitalSlug={hospitalSlug}
            orders={buckets.completed}
          />
        </div>
      )}
    </main>
  );
}

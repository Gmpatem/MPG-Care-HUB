"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ClipboardList, FlaskConical, ListChecks, TriangleAlert } from "lucide-react";

import { WorkspaceEmptyState } from "@/components/layout/workspace-empty-state";
import { InlineInfo } from "@/components/feedback/inline-feedback";
import { WorkspacePageHeader } from "@/components/layout/workspace-page-header";
import { WorkspaceSectionHeader } from "@/components/layout/workspace-section-header";
import { WorkspaceStatCard } from "@/components/layout/workspace-stat-card";
import { DetailPeekCard } from "@/components/layout/detail-peek-card";
import { PeekSummary } from "@/components/layout/peek-summary";
import { ListFilterBar } from "@/components/layout/list-filter-bar";
import { SavedViewTabs } from "@/components/layout/saved-view-tabs";
import { HandoffHint } from "@/components/layout/workflow-handoff-card";
import { Button } from "@/components/ui/button";
import { getLabOrderReadiness } from "@/lib/ui/task-state";

function fullName(patient: any) {
  if (!patient) return "Unknown patient";
  return [patient.first_name, patient.middle_name, patient.last_name].filter(Boolean).join(" ");
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function LabOrderListItem({
  hospitalSlug,
  order,
}: {
  hospitalSlug: string;
  order: any;
}) {
  const pendingItems = order.items?.filter((item: any) => item.status === "pending").length ?? order.pending_items_count ?? 0;
  const enteredItems = order.items?.filter((item: any) => item.status === "entered").length ?? 0;
  const verifiedItems = order.items?.filter((item: any) => item.status === "verified" || item.status === "completed").length ?? order.completed_items_count ?? 0;
  const totalItems = order.items?.length ?? order.total_items_count ?? 0;

  const readiness = getLabOrderReadiness(
    order.status,
    pendingItems,
    enteredItems,
    verifiedItems,
    totalItems
  );

  const badges = [];
  if (order.priority && order.priority !== "routine") {
    badges.push({ label: order.priority, tone: "warning" as const });
  }

  // Build test items list for expanded content
  const testNames = order.items?.map((item: any) => item.test_name).join(", ") ?? "";

  return (
    <DetailPeekCard
      id={order.id}
      title={fullName(order.patient)}
      subtitle={`${order.patient?.patient_number ?? "No patient number"} · Ordered ${formatDateTime(order.ordered_at)}`}
      href={`/h/${hospitalSlug}/lab/orders/${order.id}`}
      readiness={readiness}
      badges={badges}
      meta={[
        { label: "Doctor", value: order.ordered_by_staff?.full_name ?? "Unknown" },
        { label: "Items", value: `${verifiedItems}/${totalItems} complete` },
        { label: "Priority", value: order.priority ?? "routine" },
        { label: "Note", value: order.clinical_notes ? "View notes" : "—", secondary: true },
      ]}
      expandable
      fullPageLabel="Open Result Entry"
      primaryAction={{
        label: "Enter Results",
        href: `/h/${hospitalSlug}/lab/orders/${order.id}`,
      }}
    >
      {/* Expanded content shows test details */}
      {testNames && (
        <div className="space-y-3">
          <PeekSummary
            title="Requested Tests"
            items={order.items?.slice(0, 4).map((item: any) => ({
              label: item.test_name,
              value: item.status?.replace("_", " ") ?? "pending",
            })) ?? []}
            columns={Math.min(order.items?.length ?? 1, 4) as 1 | 2 | 3 | 4}
            density="compact"
            bordered={false}
          />
          {order.items?.length > 4 && (
            <p className="text-xs text-muted-foreground">
              +{order.items.length - 4} more tests
            </p>
          )}
          {order.clinical_notes && (
            <div className="rounded-lg border bg-muted/30 p-3">
              <p className="text-xs font-medium text-muted-foreground">Clinical Notes</p>
              <p className="mt-1 text-sm text-foreground">{order.clinical_notes}</p>
            </div>
          )}
          {/* Cross-role handoff context */}
          <div className="flex items-center gap-2 border-t pt-3">
            <HandoffHint
              from="doctor"
              to="lab"
              status={order.status === "completed" ? "complete" : "ready"}
              description={order.status === "completed" ? "Results sent to doctor" : "From doctor workspace"}
            />
            {order.status === "completed" && (
              <>
                <span className="text-muted-foreground">→</span>
                <HandoffHint
                  from="lab"
                  to="doctor"
                  status="ready"
                  description="Ready for review"
                />
              </>
            )}
          </div>
        </div>
      )}
    </DetailPeekCard>
  );
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
        <div className="mt-4">
          <InlineInfo 
            message="No orders in this section. Orders will appear here as they move through the workflow."
            compact
          />
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <LabOrderListItem
              key={order.id}
              hospitalSlug={hospitalSlug}
              order={order}
            />
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
  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [activeView, setActiveView] = useState("all");

  // Apply view preset
  const effectiveStatusFilter = activeView !== "all" && activeView !== "urgent" ? activeView : statusFilter;
  const effectivePriorityFilter = activeView === "urgent" ? "urgent" : priorityFilter;

  // Filter orders
  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        order.patient?.first_name?.toLowerCase().includes(searchLower) ||
        order.patient?.last_name?.toLowerCase().includes(searchLower) ||
        order.patient?.patient_number?.toLowerCase().includes(searchLower) ||
        order.ordered_by_staff?.full_name?.toLowerCase().includes(searchLower);

      // Status filter
      const matchesStatus =
        effectiveStatusFilter === "all" ||
        order.status === effectiveStatusFilter;

      // Priority filter
      const matchesPriority =
        effectivePriorityFilter === "all" ||
        order.priority === effectivePriorityFilter ||
        (effectivePriorityFilter === "urgent" && (order.priority === "urgent" || order.priority === "stat"));

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [orders, searchQuery, effectiveStatusFilter, effectivePriorityFilter]);

  const buckets = bucketOrders(filteredOrders);

  // Counts for views
  const pendingCount = orders.filter((o) => o.status === "ordered").length;
  const inProgressCount = orders.filter((o) => o.status === "in_progress" || o.status === "sample_collected").length;
  const completedCount = orders.filter((o) => o.status === "completed").length;
  const urgentCount = orders.filter((o) => o.priority === "urgent" || o.priority === "stat").length;

  // View tabs
  const views = [
    { id: "all", label: "All", count: filteredOrders.length },
    { id: "ordered", label: "Pending", count: buckets.pending.length },
    { id: "in_progress", label: "In Progress", count: buckets.inProgress.length },
    { id: "completed", label: "Completed", count: buckets.completed.length },
    { id: "urgent", label: "Urgent", count: urgentCount },
  ];

  // Status options
  const statusOptions = [
    { label: "Ordered", value: "ordered" },
    { label: "In Progress", value: "in_progress" },
    { label: "Completed", value: "completed" },
  ];

  // Priority options
  const priorityOptions = [
    { label: "Urgent", value: "urgent" },
    { label: "Stat", value: "stat" },
    { label: "Routine", value: "routine" },
  ];

  // Reset
  const handleReset = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setPriorityFilter("all");
    setActiveView("all");
  };

  const hasActiveFilters = searchQuery !== "" || statusFilter !== "all" || priorityFilter !== "all" || activeView !== "all";

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

      {/* Quick Views */}
      <SavedViewTabs
        views={views}
        activeView={activeView}
        onViewChange={(viewId) => {
          setActiveView(viewId);
          if (viewId !== "all") {
            setStatusFilter("all");
            setPriorityFilter("all");
          }
        }}
        variant="pills"
      />

      {/* Filter Bar */}
      <ListFilterBar
        searchValue={searchQuery}
        searchPlaceholder="Search by patient name, ID, or doctor..."
        onSearchChange={setSearchQuery}
        statusOptions={statusOptions}
        statusValue={statusFilter}
        onStatusChange={(value) => {
          setStatusFilter(value);
          setActiveView("all");
        }}
        hasActiveFilters={hasActiveFilters}
        onReset={handleReset}
        resultCount={filteredOrders.length}
        resultLabel="orders"
      />

      {orders.length === 0 ? (
        <WorkspaceEmptyState
          variant="default"
          title="No pending lab orders"
          description="Doctor lab requests will appear here automatically once they are created from an encounter. Check the Doctor workspace to see pending requests."
          action={
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/doctor`}>Open Doctor Workspace</Link>
            </Button>
          }
        />
      ) : filteredOrders.length === 0 ? (
        <WorkspaceEmptyState
          variant="search"
          title="No matching orders"
          description="Try adjusting your search or filter criteria."
          action={
            <Button variant="outline" onClick={handleReset}>
              Clear filters
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

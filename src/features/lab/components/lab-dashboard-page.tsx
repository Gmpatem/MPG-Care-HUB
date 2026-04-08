import Link from "next/link";
import {
  FlaskConical,
  Hourglass,
  CheckCircle2,
  AlertCircle,
  Clock,
  ListTodo,
  FileCheck,
  Beaker,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WorkspacePageHeader } from "@/components/layout/workspace-page-header";
import { WorkspaceSectionHeader } from "@/components/layout/workspace-section-header";
import { StatusBadge } from "@/components/layout/status-badge";
import { WorkspaceEmptyState } from "@/components/layout/workspace-empty-state";
import { AttentionPanel, ActivityFeed } from "@/components/layout";
import type { AttentionItem, ActivityItem } from "@/components/layout";
import { KpiCard, KpiSummaryStrip } from "@/components/layout/kpi-card";
import {
  WorkspacePageShell,
  WorkspaceTwoColumnLayout,
  WorkspaceContentStack,
} from "@/components/layout/workspace-page-shell";
import type { LabOrderRow, LabSummary } from "@/features/lab/types";

function fullName(row: LabOrderRow) {
  return [row.first_name, row.middle_name, row.last_name].filter(Boolean).join(" ");
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function statusTone(status: string | null): "neutral" | "info" | "warning" | "success" | "danger" {
  switch (status) {
    case "pending":
      return "warning";
    case "in_progress":
      return "info";
    case "completed":
      return "success";
    case "cancelled":
      return "danger";
    default:
      return "neutral";
  }
}

function priorityTone(priority: string | null): "neutral" | "info" | "warning" | "success" | "danger" {
  switch (priority) {
    case "urgent":
      return "danger";
    case "high":
      return "warning";
    case "normal":
    default:
      return "neutral";
  }
}

export function LabDashboardPage({
  hospitalSlug,
  hospitalName,
  summary,
  rows,
  attentionItems = [],
  recentActivity = [],
}: {
  hospitalSlug: string;
  hospitalName: string;
  summary: LabSummary;
  rows: LabOrderRow[];
  attentionItems?: AttentionItem[];
  recentActivity?: ActivityItem[];
}) {
  const pendingRows = rows.filter((r) => r.order_status === "pending");
  const inProgressRows = rows.filter((r) => r.order_status === "in_progress");
  const completedRows = rows.filter((r) => r.order_status === "completed").slice(0, 5);

  // Generate attention items from data if not provided
  const generatedAttentionItems: AttentionItem[] = attentionItems.length > 0
    ? attentionItems
    : [
        ...(summary.urgent_pending > 0 ? [{
          id: "urgent-orders",
          title: `${summary.urgent_pending} urgent order${summary.urgent_pending > 1 ? 's' : ''}`,
          description: "Marked urgent by requesting physician — prioritize processing",
          tone: "danger" as const,
          href: `/h/${hospitalSlug}/lab?priority=urgent`,
          actionLabel: "View Urgent",
        }] : []),
        ...(summary.pending_orders > 10 ? [{
          id: "backlog",
          title: "Order backlog building",
          description: `${summary.pending_orders} orders pending — consider checking capacity`,
          tone: "warning" as const,
          href: `/h/${hospitalSlug}/lab`,
          actionLabel: "See Pending",
        }] : []),
        ...(summary.pending_orders === 0 && summary.in_progress === 0 ? [{
          id: "all-clear",
          title: "All caught up",
          description: "No pending orders — ready for new requests",
          tone: "success" as const,
          href: `/h/${hospitalSlug}/lab`,
          actionLabel: "View Queue",
        }] : []),
      ].filter(Boolean);

  // Generate activity from completed orders
  const generatedActivity: ActivityItem[] = recentActivity.length > 0
    ? recentActivity
    : completedRows.map((r, i) => ({
        id: r.order_id || `activity-${i}`,
        type: "lab" as const,
        title: `Results reported`,
        description: `${fullName(r)} · ${r.test_names?.slice(0, 30)}${r.test_names && r.test_names.length > 30 ? '...' : ''}`,
        actor: r.collector_name || undefined,
        timestamp: r.result_reported_at || new Date().toISOString(),
        href: `/h/${hospitalSlug}/lab/orders/${r.order_id}`,
        status: "completed" as const,
      }));

  return (
    <WorkspacePageShell>
      {/* Page Header */}
      <WorkspacePageHeader
        eyebrow="Laboratory Workspace"
        title="Laboratory"
        description="Collect specimens, record results, and mark orders complete so doctors can proceed with treatment decisions."
        primaryAction={
          <Button asChild>
            <Link href={`/h/${hospitalSlug}/lab/orders/new`}>New Order</Link>
          </Button>
        }
        secondaryActions={
          <>
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/lab`}>Lab Queue</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/lab/orders`}>All Orders</Link>
            </Button>
          </>
        }
      />

      {/* KPI Summary Strip - Primary operational metrics */}
      <KpiSummaryStrip>
        <KpiCard
          title="Pending Orders"
          value={summary.pending_orders}
          description={summary.urgent_pending > 0 
            ? `${summary.urgent_pending} urgent orders need priority processing`
            : summary.pending_orders > 0 
              ? "Orders waiting for specimen collection"
              : "No pending orders — ready for new requests"}
          icon={<Hourglass className="h-4 w-4" />}
          tone={summary.urgent_pending > 0 ? "danger" : summary.pending_orders > 5 ? "warning" : summary.pending_orders > 0 ? "info" : "success"}
          action={{ label: "View Pending", href: `/h/${hospitalSlug}/lab` }}
        />
        <KpiCard
          title="In Progress"
          value={summary.in_progress}
          description={summary.in_progress > 0 
            ? "Specimens collected, awaiting results"
            : "No orders currently being processed"}
          icon={<Beaker className="h-4 w-4" />}
          tone={summary.in_progress > 0 ? "info" : "neutral"}
          action={{ label: "View In Progress", href: `/h/${hospitalSlug}/lab` }}
        />
        <KpiCard
          title="Completed Today"
          value={summary.completed_today}
          description={summary.completed_today > 0 
            ? "Results reported and ready for doctors"
            : "No orders completed yet today"}
          icon={<FileCheck className="h-4 w-4" />}
          tone={summary.completed_today > 0 ? "success" : "neutral"}
          action={{ label: "View Completed", href: `/h/${hospitalSlug}/lab/orders` }}
        />
        <KpiCard
          title="Turnaround Time"
          value={`${summary.avg_turnaround_min ?? "—"} min`}
          description={summary.avg_turnaround_min 
            ? "Average time from order to results"
            : "No completed orders to measure"}
          icon={<Clock className="h-4 w-4" />}
          tone="neutral"
        />
      </KpiSummaryStrip>

      {/* Two Column Layout */}
      <WorkspaceTwoColumnLayout
        ratio="65-35"
        main={
          <WorkspaceContentStack>
            {/* Attention Panel for lab priorities */}
            {generatedAttentionItems.length > 0 && (
              <AttentionPanel
                title="Lab Attention"
                description="Orders requiring priority action"
                items={generatedAttentionItems}
              />
            )}

            {/* Pending Orders */}
            <Card>
              <CardHeader className="border-b py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <ListTodo className="h-4 w-4" />
                    Pending Orders
                  </CardTitle>
                  <Badge variant="secondary">{pendingRows.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {pendingRows.length === 0 ? (
                  <div className="p-6">
                    <WorkspaceEmptyState
                      variant="default"
                      title="No pending orders"
                      description="All caught up! New orders will appear here when doctors submit lab requests."
                    />
                  </div>
                ) : (
                  <div className="divide-y">
                    {pendingRows.slice(0, 5).map((row) => (
                      <div
                        key={row.order_id}
                        className="flex flex-col gap-3 p-4 hover:bg-muted/30 transition-colors sm:flex-row sm:items-start sm:justify-between"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{fullName(row) || "Unknown patient"}</span>
                            {row.priority === "urgent" && (
                              <StatusBadge label="URGENT" tone="danger" className="text-xs" />
                            )}
                            <Badge variant="outline" className="text-xs">
                              {row.specimen_type || "Unknown specimen"}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {row.test_names || "No tests specified"}
                          </p>
                          <div className="flex flex-wrap gap-x-4 text-xs text-muted-foreground">
                            <span>Ordered: {formatDateTime(row.ordered_at)}</span>
                            <span>Ordered by: {row.ordered_by_name ?? "—"}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button asChild size="sm">
                            <Link href={`/h/${hospitalSlug}/lab/orders/${row.order_id}`}>
                              Collect
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {pendingRows.length > 5 && (
                  <div className="border-t p-3">
                    <Button asChild variant="ghost" size="sm" className="w-full">
                      <Link href={`/h/${hospitalSlug}/lab`}>
                        View {pendingRows.length - 5} more pending orders
                      </Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* In Progress Orders */}
            {inProgressRows.length > 0 && (
              <Card>
                <CardHeader className="border-b py-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2">
                      <FlaskConical className="h-4 w-4" />
                      In Progress
                    </CardTitle>
                    <Badge variant="secondary">{inProgressRows.length}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y">
                    {inProgressRows.slice(0, 3).map((row) => (
                      <div
                        key={row.order_id}
                        className="flex flex-col gap-3 p-4 hover:bg-muted/30 transition-colors sm:flex-row sm:items-start sm:justify-between"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{fullName(row) || "Unknown patient"}</span>
                            <Badge variant="secondary" className="text-xs">
                              Collected
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground truncate">
                            {row.test_names || "No tests specified"}
                          </p>
                          <div className="flex flex-wrap gap-x-4 text-xs text-muted-foreground">
                            <span>Collected: {formatDateTime(row.specimen_collected_at)}</span>
                            <span>By: {row.collector_name ?? "—"}</span>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button asChild size="sm">
                            <Link href={`/h/${hospitalSlug}/lab/orders/${row.order_id}`}>
                              Enter Results
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </WorkspaceContentStack>
        }
        side={
          <WorkspaceContentStack>
            {/* Recent Lab Activity */}
            <ActivityFeed
              title="Recently Completed"
              description="Results reported and ready for doctors"
              items={generatedActivity}
              viewAllHref={`/h/${hospitalSlug}/lab/orders?status=completed`}
              viewAllLabel="View All"
              compact
            />

            {/* Lab Workflow */}
            <Card>
              <CardHeader className="border-b py-4">
                <CardTitle className="text-base">Workflow Steps</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-medium text-amber-700">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-medium">Collect Specimen</p>
                    <p className="text-xs text-muted-foreground">Verify identity and collect sample</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-medium">Run Tests</p>
                    <p className="text-xs text-muted-foreground">Process specimen and run analysis</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-medium">Report Results</p>
                    <p className="text-xs text-muted-foreground">Enter results and mark complete</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </WorkspaceContentStack>
        }
      />
    </WorkspacePageShell>
  );
}

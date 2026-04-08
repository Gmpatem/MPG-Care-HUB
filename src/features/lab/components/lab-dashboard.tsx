import Link from "next/link";
import {
  ClipboardList,
  FlaskConical,
  ListChecks,
  TestTube2,
  AlertCircle,
  Clock,
  CheckCircle2,
} from "lucide-react";

import { WorkspacePageHeader } from "@/components/layout/workspace-page-header";
import { WorkspaceSectionHeader } from "@/components/layout/workspace-section-header";
import { WorkflowStepCard } from "@/components/layout/workflow-step-card";
import { AttentionPanel, ActivityFeed } from "@/components/layout";
import type { AttentionItem, ActivityItem } from "@/components/layout";
import { KpiCard, KpiSummaryStrip } from "@/components/layout/kpi-card";
import { MobileSummaryStack, SummaryPill } from "@/components/layout/mobile-summary-stack";
import { TodayViewPanel, type TodayItem } from "@/components/layout/today-view-panel";
import {
  WorkspacePageShell,
  WorkspaceTwoColumnLayout,
  WorkspaceContentStack,
} from "@/components/layout/workspace-page-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type LabDashboardProps = {
  hospitalSlug: string;
  hospitalName: string;
  totalTests: number;
  activeTests: number;
  pendingOrders: number;
  completedToday: number;
  urgentOrders?: number;
  attentionItems?: AttentionItem[];
  recentActivity?: ActivityItem[];
};

export function LabDashboard({
  hospitalSlug,
  totalTests,
  activeTests,
  pendingOrders,
  completedToday,
  urgentOrders = 0,
  attentionItems = [],
  recentActivity = [],
}: LabDashboardProps) {
  // Generate attention items from data if not provided
  const generatedAttentionItems: AttentionItem[] = attentionItems.length > 0
    ? attentionItems
    : [
        ...(urgentOrders > 0 ? [{
          id: "urgent-lab",
          title: `${urgentOrders} urgent lab order${urgentOrders > 1 ? 's' : ''}`,
          description: "Stat/urgent priority orders need immediate processing",
          tone: "danger" as const,
          href: `/h/${hospitalSlug}/lab/orders`,
          actionLabel: "View Urgent Orders",
        }] : []),
        ...(pendingOrders > 10 ? [{
          id: "lab-backlog",
          title: "Lab queue backing up",
          description: `${pendingOrders} orders awaiting result entry`,
          tone: "warning" as const,
          href: `/h/${hospitalSlug}/lab/orders`,
          actionLabel: "Process Queue",
        }] : []),
      ].filter(Boolean);

  // Default activity items
  const defaultActivity: ActivityItem[] = recentActivity.length > 0
    ? recentActivity
    : [];

  // Generate Today View items
  const todayUrgentItems: TodayItem[] = [
    ...(urgentOrders > 0 ? [{
      id: "urgent-orders",
      title: "Urgent orders need processing",
      description: `${urgentOrders} stat/urgent order${urgentOrders > 1 ? 's' : ''} require immediate attention`,
      tone: "urgent" as const,
      count: urgentOrders,
      href: `/h/${hospitalSlug}/lab/orders`,
      actionLabel: "Process Now",
    }] : []),
    ...(pendingOrders > 10 ? [{
      id: "lab-backlog",
      title: "Lab queue backing up",
      description: `${pendingOrders} orders awaiting result entry — consider prioritizing`,
      tone: "urgent" as const,
      count: pendingOrders,
      href: `/h/${hospitalSlug}/lab/orders`,
      actionLabel: "Process Queue",
    }] : []),
  ];

  const todayReadyItems: TodayItem[] = [
    ...(pendingOrders > 0 && pendingOrders <= 10 ? [{
      id: "pending-orders",
      title: "Orders ready for processing",
      description: `${pendingOrders} order${pendingOrders > 1 ? 's' : ''} awaiting specimen processing or result entry`,
      tone: "ready" as const,
      count: pendingOrders,
      href: `/h/${hospitalSlug}/lab/orders`,
      actionLabel: "Process Orders",
    }] : []),
  ];

  const todayWaitingItems: TodayItem[] = [
    ...(activeTests > 0 ? [{
      id: "in-progress",
      title: "Tests in progress",
      description: `${activeTests} order${activeTests > 1 ? 's' : ''} with specimens being processed`,
      tone: "waiting" as const,
      count: activeTests,
      href: `/h/${hospitalSlug}/lab/orders`,
      actionLabel: "View Active",
    }] : []),
  ];

  return (
    <WorkspacePageShell>
      {/* Page Header */}
      <WorkspacePageHeader
        eyebrow="Laboratory Workspace"
        title="Laboratory"
        description="Process ordered investigations, enter results by test item, and send completed cases back to doctor review without losing the encounter flow."
        primaryAction={
          <Button asChild>
            <Link href={`/h/${hospitalSlug}/lab/orders`}>Review Lab Queue</Link>
          </Button>
        }
        secondaryActions={
          <>
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/lab/tests`}>Lab Test Catalog</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/lab/tests/new`}>Add Test</Link>
            </Button>
          </>
        }
      />

      {/* Today View - Lab priorities */}
      <TodayViewPanel
        title="Start Here Today"
        description="What needs your attention in the lab now"
        urgentItems={todayUrgentItems}
        readyItems={todayReadyItems}
        waitingItems={todayWaitingItems}
        completedToday={completedToday}
        completedLabel="orders completed today"
        emptyMessage="No orders need immediate attention"
        emptyDescription="The lab queue is clear. New orders will appear here when doctors submit them."
      />

      {/* Mobile Summary Stack */}
      <MobileSummaryStack className="lg:hidden">
        <SummaryPill
          label="Pending"
          value={pendingOrders}
          tone={pendingOrders > 10 ? "warning" : pendingOrders > 0 ? "info" : "neutral"}
          icon={<ClipboardList className="h-3.5 w-3.5" />}
        />
        <SummaryPill
          label="In Progress"
          value={activeTests}
          tone={activeTests > 0 ? "info" : "neutral"}
          icon={<Clock className="h-3.5 w-3.5" />}
        />
        <SummaryPill
          label="Urgent"
          value={urgentOrders}
          tone={urgentOrders > 0 ? "danger" : "neutral"}
          icon={<FlaskConical className="h-3.5 w-3.5" />}
        />
        <SummaryPill
          label="Completed"
          value={completedToday}
          tone={completedToday > 0 ? "success" : "neutral"}
          icon={<CheckCircle2 className="h-3.5 w-3.5" />}
        />
      </MobileSummaryStack>

      {/* Desktop KPI Summary Strip */}
      <div className="hidden lg:block">
        <KpiSummaryStrip>
          <KpiCard
            title="Pending Specimens"
            value={pendingOrders}
            description={pendingOrders > 0 
              ? "Orders awaiting specimen collection or processing"
              : "No orders pending — lab queue is clear"}
            icon={<ClipboardList className="h-4 w-4" />}
            tone={pendingOrders > 10 ? "warning" : pendingOrders > 0 ? "info" : "neutral"}
            action={{ label: "Process Queue", href: `/h/${hospitalSlug}/lab/orders` }}
          />
          <KpiCard
            title="In Progress"
            value={activeTests}
            description={activeTests > 0 
              ? "Orders with specimens being processed"
              : "No active orders in processing"}
            icon={<Clock className="h-4 w-4" />}
            tone={activeTests > 0 ? "info" : "neutral"}
            action={{ label: "View Active", href: `/h/${hospitalSlug}/lab/orders` }}
          />
          <KpiCard
            title="Pending Review"
            value={urgentOrders}
            description={urgentOrders > 0 
              ? "Urgent orders awaiting result review"
              : "No urgent orders pending review"}
            icon={<FlaskConical className="h-4 w-4" />}
            tone={urgentOrders > 0 ? "danger" : "neutral"}
            action={{ label: "Review Results", href: `/h/${hospitalSlug}/lab/orders` }}
          />
          <KpiCard
            title="Completed Today"
            value={completedToday}
            description={completedToday > 0 
              ? "Orders finished and returned to doctors"
              : "No orders completed yet today"}
            icon={<CheckCircle2 className="h-4 w-4" />}
            tone={completedToday > 0 ? "success" : "neutral"}
            action={{ label: "View Completed", href: `/h/${hospitalSlug}/lab/orders` }}
          />
        </KpiSummaryStrip>
      </div>

      {/* Attention Panel for urgent lab work */}
      {(generatedAttentionItems.length > 0 || urgentOrders > 0 || pendingOrders > 10) && (
        <AttentionPanel
          title="Lab Attention Needed"
          description="Orders requiring priority processing"
          items={generatedAttentionItems}
          className="mb-6"
        />
      )}

      {/* Main Content - Two Column */}
      <WorkspaceTwoColumnLayout
        ratio="60-40"
        main={
          <Card className="border-border/70">
            <CardContent className="space-y-4 py-5">
              <WorkspaceSectionHeader
                title="Laboratory Workflow"
                description="Use the same result flow for every incoming order."
              />

              <div className="space-y-3">
                <WorkflowStepCard
                  step="Step 1"
                  title="Open the queue"
                  description="New orders placed from the Doctor workspace appear in the lab queue automatically."
                />
                <WorkflowStepCard
                  step="Step 2"
                  title="Enter results by item"
                  description="Record results per requested test item so incomplete orders can still stay in progress safely."
                />
                <WorkflowStepCard
                  step="Step 3"
                  title="Complete and return"
                  description="Once all required items are recorded, complete the order so the doctor can continue the same encounter."
                />
              </div>
            </CardContent>
          </Card>
        }
        side={
          <div className="space-y-6">
            {/* Recent Lab Activity */}
            <ActivityFeed
              title="Recent Lab Activity"
              description="Latest result entries and order updates"
              items={defaultActivity}
              viewAllHref={`/h/${hospitalSlug}/activity`}
              viewAllLabel="View all activity"
              compact
              emptyMessage="No recent lab activity"
              emptyDescription="Lab activity will appear here as results are entered and orders are completed."
            />

            <Card className="border-border/70">
              <CardContent className="space-y-4 py-5">
                <WorkspaceSectionHeader
                  title="Quick Actions"
                  description="Most-used lab routes"
                />

                <div className="flex flex-col gap-2">
                  <Button asChild className="justify-between">
                    <Link href={`/h/${hospitalSlug}/lab/orders`}>
                      Open Lab Orders
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="justify-between">
                    <Link href={`/h/${hospitalSlug}/lab/tests`}>
                      Review Lab Test Catalog
                    </Link>
                  </Button>
                  <Button asChild variant="outline" className="justify-between">
                    <Link href={`/h/${hospitalSlug}/doctor`}>
                      Return to Doctor Workflow
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        }
      />
    </WorkspacePageShell>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  ClipboardCheck,
  CreditCard,
  Search,
  Siren,
  Users,
  UserPlus,
  Stethoscope,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WorkspacePageHeader } from "@/components/layout/workspace-page-header";
import { WorkspaceEmptyState } from "@/components/layout/workspace-empty-state";
import { StatusBadge } from "@/components/layout/status-badge";
import { AttentionPanel, ActivityFeed } from "@/components/layout";
import type { AttentionItem, ActivityItem } from "@/components/layout";
import { HandoffHint } from "@/components/layout/workflow-handoff-card";
import { KpiCard, KpiSummaryStrip } from "@/components/layout/kpi-card";
import { TodayViewPanel, type TodayItem } from "@/components/layout/today-view-panel";
import {
  WorkspacePageShell,
  WorkspaceTwoColumnLayout,
  WorkspaceContentStack,
} from "@/components/layout/workspace-page-shell";
import type { FrontdeskQueueRow, FrontdeskSummary } from "@/features/frontdesk/types";
import { FrontdeskSmartIntake } from "./frontdesk-smart-intake";

type HospitalLite = {
  id: string;
  name: string;
  slug: string;
};

type StaffLite = {
  id: string;
  full_name: string;
  job_title: string | null;
  staff_type: string | null;
  active: boolean;
};

export function FrontdeskDashboard({
  hospital,
  summary,
  queueRows,
  staff,
  attentionItems = [],
  recentActivity = [],
}: {
  hospital: HospitalLite;
  summary: FrontdeskSummary | null;
  queueRows: FrontdeskQueueRow[];
  staff: StaffLite[];
  attentionItems?: AttentionItem[];
  recentActivity?: ActivityItem[];
}) {
  const data = summary ?? {
    appointments_today: 0,
    checked_in_today: 0,
    emergency_visits_today: 0,
    payments_today_count: 0,
    payments_today_amount: 0,
    pending_lab_orders: 0,
    pending_prescriptions: 0,
  };

  const checkedInCount = queueRows.filter(r => r.status === "checked_in").length;
  const waitingCount = queueRows.length;

  // Generate attention items from data if not provided
  const generatedAttentionItems: AttentionItem[] = attentionItems.length > 0 
    ? attentionItems 
    : [
        ...((data.emergency_visits_today ?? 0) > 0 ? [{
          id: "emergency",
          title: `${data.emergency_visits_today} emergency visit${(data.emergency_visits_today ?? 0) > 1 ? 's' : ''}`,
          description: "Requires immediate attention and triage",
          tone: "danger" as const,
          href: `/h/${hospital.slug}/frontdesk/queue`,
          actionLabel: "View Queue",
        }] : []),
        ...(checkedInCount > 5 ? [{
          id: "queue-backup",
          title: "Queue backing up",
          description: `${checkedInCount} patients waiting to be seen — consider prioritizing`,
          tone: "warning" as const,
          href: `/h/${hospital.slug}/frontdesk/queue`,
          actionLabel: "Manage Queue",
        }] : []),
        ...(waitingCount === 0 && (data.appointments_today ?? 0) > 0 ? [{
          id: "no-waiting",
          title: "No patients currently waiting",
          description: "All checked-in patients are being seen",
          tone: "success" as const,
          href: `/h/${hospital.slug}/frontdesk/queue`,
          actionLabel: "View Queue",
        }] : []),
      ].filter(Boolean);

  // Generate activity from queue rows if not provided
  const generatedActivity: ActivityItem[] = recentActivity.length > 0
    ? recentActivity
    : queueRows
        .filter(r => r.check_in_at)
        .slice(0, 5)
        .map((r, i) => ({
          id: r.appointment_id || `activity-${i}`,
          type: "patient" as const,
          title: `${r.first_name} ${r.last_name} checked in`,
          description: `Queue #${r.queue_number || '—'} · ${r.visit_type || 'outpatient'}`,
          timestamp: r.check_in_at || new Date().toISOString(),
          href: `/h/${hospital.slug}/patients/${r.patient_id}`,
        }));

  // Generate Today View items
  const todayUrgentItems: TodayItem[] = [
    ...((data.emergency_visits_today ?? 0) > 0 ? [{
      id: "emergency",
      title: "Emergency visits need triage",
      description: `${data.emergency_visits_today} emergency visit${(data.emergency_visits_today ?? 0) > 1 ? 's' : ''} require immediate attention`,
      tone: "urgent" as const,
      count: data.emergency_visits_today ?? 0,
      href: `/h/${hospital.slug}/frontdesk/queue`,
      actionLabel: "View Queue",
    }] : []),
    ...(checkedInCount > 8 ? [{
      id: "long-queue",
      title: "Long queue — consider assistance",
      description: `${checkedInCount} patients waiting to be seen`,
      tone: "urgent" as const,
      count: checkedInCount,
      href: `/h/${hospital.slug}/frontdesk/queue`,
      actionLabel: "Manage Queue",
    }] : []),
  ];

  const todayReadyItems: TodayItem[] = [
    ...(checkedInCount > 0 && checkedInCount <= 8 ? [{
      id: "ready-queue",
      title: "Patients ready for provider",
      description: `${checkedInCount} patient${checkedInCount > 1 ? 's' : ''} checked in and waiting`,
      tone: "ready" as const,
      count: checkedInCount,
      href: `/h/${hospital.slug}/frontdesk/queue`,
      actionLabel: "View Queue",
    }] : []),
    ...((data.appointments_today ?? 0) > (data.checked_in_today ?? 0) ? [{
      id: "upcoming",
      title: "Upcoming appointments today",
      description: `${(data.appointments_today ?? 0) - (data.checked_in_today ?? 0)} patient${(data.appointments_today ?? 0) - (data.checked_in_today ?? 0) > 1 ? 's' : ''} scheduled but not yet checked in`,
      tone: "waiting" as const,
      count: (data.appointments_today ?? 0) - (data.checked_in_today ?? 0),
      href: `/h/${hospital.slug}/appointments`,
      actionLabel: "View Schedule",
    }] : []),
  ];

  const todayWaitingItems: TodayItem[] = [
    ...((data.pending_lab_orders ?? 0) > 0 ? [{
      id: "pending-labs",
      title: "Lab orders pending",
      description: `${data.pending_lab_orders} lab order${(data.pending_lab_orders ?? 0) > 1 ? 's' : ''} awaiting results`,
      tone: "waiting" as const,
      count: data.pending_lab_orders ?? 0,
      href: `/h/${hospital.slug}/lab`,
      actionLabel: "Check Lab",
    }] : []),
    ...((data.pending_prescriptions ?? 0) > 0 ? [{
      id: "pending-prescriptions",
      title: "Prescriptions in queue",
      description: `${data.pending_prescriptions} prescription${(data.pending_prescriptions ?? 0) > 1 ? 's' : ''} awaiting dispensing`,
      tone: "waiting" as const,
      count: data.pending_prescriptions ?? 0,
      href: `/h/${hospital.slug}/pharmacy`,
      actionLabel: "Check Pharmacy",
    }] : []),
  ];

  return (
    <WorkspacePageShell>
      {/* Page Header */}
      <WorkspacePageHeader
        eyebrow="Reception"
        title="Front Desk"
        description="Find patients, register new ones, and manage today's intake flow."
        primaryAction={
          <Button asChild variant="outline">
            <Link href={`/h/${hospital.slug}/frontdesk/queue`}>
              View Full Queue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        }
      />

      {/* Today View - What needs attention first */}
      <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
        <TodayViewPanel
          title="Start Here Today"
          description="What needs your attention now at the front desk"
          urgentItems={todayUrgentItems}
          readyItems={todayReadyItems}
          waitingItems={todayWaitingItems}
          completedToday={data.checked_in_today ?? 0}
          completedLabel="patients checked in today"
          emptyMessage="No patients waiting right now"
          emptyDescription="The queue is clear. New arrivals will appear here when they check in."
        />
        
        {/* Quick Intake Card */}
        <Card className="border-border/70">
          <CardHeader className="border-b pb-4">
            <CardTitle className="flex items-center gap-2 text-base">
              <UserPlus className="h-4 w-4 text-primary" />
              Quick Intake
            </CardTitle>
            <CardDescription>
              Register a new patient or find existing
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              <Button asChild className="w-full justify-between">
                <Link href={`/h/${hospital.slug}/frontdesk/intake`}>
                  New Patient Registration
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-between">
                <Link href={`/h/${hospital.slug}/frontdesk/intake/search`}>
                  Find Existing Patient
                  <Search className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="w-full justify-between">
                <Link href={`/h/${hospital.slug}/appointments/new`}>
                  Book Appointment
                  <CalendarDays className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* KPI Summary Strip - Primary operational metrics */}
      <KpiSummaryStrip>
        <KpiCard
          title="Appointments Today"
          value={data.appointments_today ?? 0}
          description={(data.checked_in_today ?? 0) > 0 
            ? `${data.checked_in_today} checked in, ${(data.appointments_today ?? 0) - (data.checked_in_today ?? 0)} remaining`
            : "No patients checked in yet"}
          icon={<CalendarDays className="h-4 w-4" />}
          tone={(data.appointments_today ?? 0) > 0 ? "info" : "neutral"}
          action={{ label: "View Schedule", href: `/h/${hospital.slug}/appointments` }}
        />
        <KpiCard
          title="In Queue"
          value={waitingCount}
          description={checkedInCount > 0 
            ? `${checkedInCount} checked in and waiting to be seen`
            : waitingCount > 0 
              ? `${waitingCount} patient${waitingCount > 1 ? 's' : ''} in queue`
              : "No patients currently waiting"}
          icon={<Users className="h-4 w-4" />}
          tone={checkedInCount > 5 ? "warning" : checkedInCount > 0 ? "highlight" : "neutral"}
          action={{ label: "Manage Queue", href: `/h/${hospital.slug}/frontdesk/queue` }}
        />
        <KpiCard
          title="Emergency"
          value={data.emergency_visits_today ?? 0}
          description={(data.emergency_visits_today ?? 0) > 0 
            ? "Emergency visit(s) require immediate triage"
            : "No emergency visits today"}
          icon={<Siren className="h-4 w-4" />}
          tone={(data.emergency_visits_today ?? 0) > 0 ? "danger" : "neutral"}
          action={{ label: "View Queue", href: `/h/${hospital.slug}/frontdesk/queue` }}
        />
        <KpiCard
          title="Payments Today"
          value={data.payments_today_count ?? 0}
          description={(data.payments_today_amount ?? 0) > 0 
            ? `₱${Number(data.payments_today_amount).toFixed(0)} collected today`
            : "No payments recorded yet"}
          icon={<CreditCard className="h-4 w-4" />}
          tone={(data.payments_today_count ?? 0) > 0 ? "success" : "neutral"}
          action={{ label: "View Payments", href: `/h/${hospital.slug}/billing/payments` }}
        />
      </KpiSummaryStrip>

      {/* Attention Panel - Shows urgent items */}
      {(generatedAttentionItems.length > 0 || (data.emergency_visits_today ?? 0) > 0) && (
        <AttentionPanel
          title="Needs Attention"
          description="Items requiring immediate front desk action"
          items={generatedAttentionItems}
          className="mb-6"
        />
      )}

      {/* Main Workspace - Two column layout */}
      <WorkspaceTwoColumnLayout
        ratio="65-35"
        main={
          <WorkspaceContentStack>
            {/* Primary: Full Intake Workspace */}
            <Card className="border-border/70">
              <CardHeader className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <UserPlus className="h-5 w-5 text-primary" />
                      Patient Intake
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Search for existing patients or register new ones
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-5">
                <FrontdeskSmartIntake 
                  hospitalSlug={hospital.slug} 
                  staff={staff}
                  compact
                />
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Check-ins"
              description="Latest patient arrivals and activity"
              items={generatedActivity}
              viewAllHref={`/h/${hospital.slug}/activity`}
              viewAllLabel="View all activity"
              compact
            />
          </WorkspaceContentStack>
        }
        side={
          <WorkspaceContentStack>
            {/* Secondary: Queue Panel */}
            <Card className="border-border/70">
              <CardHeader className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <ClipboardCheck className="h-5 w-5 text-primary" />
                      Today&apos;s Queue
                    </CardTitle>
                    <CardDescription className="mt-1">
                      Current intake line and recent arrivals
                    </CardDescription>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/h/${hospital.slug}/frontdesk/queue`}>
                      Open Full Queue
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <QueueList hospitalSlug={hospital.slug} rows={queueRows} />
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card className="border-border/70 bg-muted/30">
              <CardContent className="pt-5">
                <h3 className="mb-3 text-sm font-medium text-muted-foreground">Quick Access</h3>
                <div className="grid gap-2">
                  <QuickLink 
                    href={`/h/${hospital.slug}/patients`}
                    icon={<Search className="h-4 w-4" />}
                    label="Patient Directory"
                  />
                  <QuickLink 
                    href={`/h/${hospital.slug}/appointments`}
                    icon={<CalendarDays className="h-4 w-4" />}
                    label="Appointments"
                  />
                  <QuickLink 
                    href={`/h/${hospital.slug}/doctor`}
                    icon={<Stethoscope className="h-4 w-4" />}
                    label="Doctor Workspace"
                  />
                </div>
              </CardContent>
            </Card>
          </WorkspaceContentStack>
        }
      />
    </WorkspacePageShell>
  );
}

function QueueList({
  hospitalSlug,
  rows,
}: {
  hospitalSlug: string;
  rows: FrontdeskQueueRow[];
}) {
  if (rows.length === 0) {
    return (
      <WorkspaceEmptyState
        variant="queue"
        title="No patients waiting"
        description="The queue is clear. Patients will appear here once they are checked in through the intake form."
        icon={<ClipboardCheck className="h-5 w-5" />}
      />
    );
  }

  return (
    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
      {rows.slice(0, 8).map((row) => (
        <div
          key={row.appointment_id}
          className="group rounded-xl border border-border/70 bg-background p-3 transition-colors hover:border-primary/30 hover:bg-muted/30"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <p className="truncate font-medium">
                  {[row.first_name, row.last_name].filter(Boolean).join(" ") || "Unknown"}
                </p>
                {row.queue_number && (
                  <Badge variant="outline" className="shrink-0 text-xs">
                    #{row.queue_number}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                {row.patient_number ?? "No ID"} · {row.visit_type ?? "outpatient"}
              </p>
              <div className="flex items-center gap-2 pt-1">
                <StatusBadge
                  label={row.status ?? "scheduled"}
                  tone={getStatusTone(row.status)}
                  className="text-xs capitalize"
                />
                <span className="text-xs text-muted-foreground">
                  {row.staff_name ?? "Unassigned"}
                </span>
              </div>
              {row.status === "checked_in" && (
                <div className="pt-1">
                  <HandoffHint
                    from="intake"
                    to="doctor"
                    status="ready"
                    description="Ready to be seen"
                  />
                </div>
              )}
            </div>
            <Button
              asChild
              variant="ghost"
              size="sm"
              className="shrink-0 opacity-0 group-hover:opacity-100"
            >
              <Link href={`/h/${hospitalSlug}/patients/${row.patient_id}`}>
                View
              </Link>
            </Button>
          </div>
        </div>
      ))}
      {rows.length > 8 && (
        <Button asChild variant="ghost" className="w-full text-sm">
          <Link href={`/h/${hospitalSlug}/frontdesk/queue`}>
            View all {rows.length} patients
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      )}
    </div>
  );
}

function QuickLink({
  href,
  icon,
  label,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-lg p-2.5 text-sm transition-colors hover:bg-muted"
    >
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-muted text-muted-foreground">
        {icon}
      </span>
      <span className="font-medium">{label}</span>
      <ArrowRight className="ml-auto h-4 w-4 text-muted-foreground" />
    </Link>
  );
}

function getStatusTone(status: string | null) {
  switch (status) {
    case "checked_in":
      return "info" as const;
    case "cancelled":
      return "danger" as const;
    case "completed":
      return "success" as const;
    default:
      return "neutral" as const;
  }
}

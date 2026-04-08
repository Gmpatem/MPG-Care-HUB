import Link from "next/link";
import {
  Bed,
  Users,
  DoorOpen,
  AlertTriangle,
  Clock,
  ArrowRight,
  BedDouble,
  CheckCircle2,
  Plus,
  Building,
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
import { MobileSummaryStack, SummaryPill } from "@/components/layout/mobile-summary-stack";
import { HandoffHint } from "@/components/layout/workflow-handoff-card";
import { TodayViewPanel, type TodayItem } from "@/components/layout/today-view-panel";
import {
  WorkspacePageShell,
  WorkspaceTwoColumnLayout,
  WorkspaceContentStack,
} from "@/components/layout/workspace-page-shell";

type WardSummary = {
  id: string;
  name: string;
  code: string | null;
  ward_type: string | null;
  active: boolean;
  total_beds: number;
  occupied_beds: number;
  available_beds: number;
  active_admissions: number;
  discharge_requested_count: number;
};

type AdmissionRow = {
  id: string;
  patient_id: string;
  encounter_id: string | null;
  appointment_id: string | null;
  admitting_doctor_staff_id: string | null;
  ward_id: string;
  bed_id: string | null;
  status: string;
  admitted_at: string;
  discharged_at: string | null;
  admission_reason: string | null;
  discharge_notes: string | null;
  discharge_requested: boolean;
  discharge_requested_at: string | null;
  patient: {
    id: string;
    patient_number: string | null;
    first_name: string;
    middle_name: string | null;
    last_name: string;
    sex: string | null;
    phone: string | null;
  } | null;
  ward: {
    id: string;
    name: string;
    code: string | null;
    ward_type: string | null;
  } | null;
  bed: {
    id: string;
    bed_number: string;
    status: string | null;
  } | null;
  admitting_doctor: {
    id: string;
    full_name: string;
    specialty: string | null;
  } | null;
};

type WardStats = {
  total_wards: number;
  active_admissions: number;
  discharge_requested: number;
  newly_admitted: number;
  available_beds: number;
  occupied_beds: number;
  total_beds: number;
};

function fullName(row: { first_name: string; middle_name?: string | null; last_name: string }) {
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

function formatDuration(hours: number | null) {
  if (!hours || hours < 1) return "< 1 hour";
  const days = Math.floor(hours / 24);
  const remainingHours = Math.floor(hours % 24);
  if (days === 0) return `${remainingHours}h`;
  if (remainingHours === 0) return `${days}d`;
  return `${days}d ${remainingHours}h`;
}

export function WardDashboardPage({
  hospitalSlug,
  hospitalName,
  wards,
  admissions,
  stats,
  attentionItems = [],
  recentActivity = [],
}: {
  hospitalSlug: string;
  hospitalName: string;
  wards: WardSummary[];
  admissions: AdmissionRow[];
  stats: WardStats;
  attentionItems?: AttentionItem[];
  recentActivity?: ActivityItem[];
}) {
  const dischargeRequested = admissions.filter((a) => a.discharge_requested);
  const newlyAdmitted = admissions.filter((a) => {
    const admittedAt = new Date(a.admitted_at).getTime();
    const now = Date.now();
    const hours24 = 24 * 60 * 60 * 1000;
    return now - admittedAt <= hours24;
  });

  const capacityPct = stats.total_beds > 0 ? Math.round((stats.occupied_beds / stats.total_beds) * 100) : 0;

  // Generate attention items from data if not provided
  const generatedAttentionItems: AttentionItem[] = attentionItems.length > 0
    ? attentionItems
    : [
        ...(capacityPct > 90 ? [{
          id: "capacity",
          title: "Ward approaching capacity",
          description: `${stats.occupied_beds} of ${stats.total_beds} beds occupied (${capacityPct}%) — consider discharge planning`,
          tone: "warning" as const,
          href: `/h/${hospitalSlug}/ward/beds`,
          actionLabel: "View Bed Map",
        }] : []),
        ...(dischargeRequested.length > 0 ? [{
          id: "discharges",
          title: `${dischargeRequested.length} discharge${dischargeRequested.length > 1 ? 's' : ''} pending`,
          description: "Patients ready for discharge — complete checkout to free beds",
          tone: "success" as const,
          href: `/h/${hospitalSlug}/ward/discharges`,
          actionLabel: "Process Discharges",
        }] : []),
        ...(stats.newly_admitted > 0 ? [{
          id: "new-admissions",
          title: `${stats.newly_admitted} new admission${stats.newly_admitted > 1 ? 's' : ''} (24h)`,
          description: "Recently admitted patients may need initial assessment",
          tone: "info" as const,
          href: `/h/${hospitalSlug}/ward/admissions`,
          actionLabel: "Review New",
        }] : []),
      ].filter(Boolean);

  // Generate activity from admissions
  const generatedActivity: ActivityItem[] = recentActivity.length > 0
    ? recentActivity
    : newlyAdmitted.slice(0, 5).map((a, i) => ({
        id: a.id || `activity-${i}`,
        type: "admission" as const,
        title: `Patient admitted`,
        description: `${a.patient ? fullName(a.patient) : "Unknown"} · ${a.ward?.name || "Unknown ward"}`,
        actor: a.admitting_doctor?.full_name || undefined,
        timestamp: a.admitted_at || new Date().toISOString(),
        href: `/h/${hospitalSlug}/ward/admissions/${a.id}`,
        status: "completed" as const,
      }));

  // Generate Today View items
  const todayUrgentItems: TodayItem[] = [
    ...(capacityPct > 90 ? [{
      id: "capacity",
      title: "Ward approaching capacity",
      description: `${stats.occupied_beds} of ${stats.total_beds} beds occupied (${capacityPct}%) — expedite discharges`,
      tone: "urgent" as const,
      href: `/h/${hospitalSlug}/ward/beds`,
      actionLabel: "View Bed Map",
    }] : []),
    ...(stats.available_beds === 0 && stats.total_beds > 0 ? [{
      id: "no-beds",
      title: "No beds available",
      description: "All beds are occupied — cannot accept new admissions",
      tone: "urgent" as const,
      href: `/h/${hospitalSlug}/ward/discharges`,
      actionLabel: "Process Discharges",
    }] : []),
  ];

  const todayReadyItems: TodayItem[] = [
    ...(dischargeRequested.length > 0 ? [{
      id: "discharges",
      title: "Patients ready for discharge",
      description: `${dischargeRequested.length} discharge${dischargeRequested.length > 1 ? 's' : ''} pending — free up beds`,
      tone: "ready" as const,
      count: dischargeRequested.length,
      href: `/h/${hospitalSlug}/ward/discharges`,
      actionLabel: "Process Now",
    }] : []),
  ];

  const todayWaitingItems: TodayItem[] = [
    ...(newlyAdmitted.length > 0 ? [{
      id: "new-admissions",
      title: "New admissions to review",
      description: `${newlyAdmitted.length} patient${newlyAdmitted.length > 1 ? 's' : ''} admitted in last 24h`,
      tone: "waiting" as const,
      count: newlyAdmitted.length,
      href: `/h/${hospitalSlug}/ward/admissions`,
      actionLabel: "Review Patients",
    }] : []),
  ];

  return (
    <WorkspacePageShell>
      {/* Page Header */}
      <WorkspacePageHeader
        eyebrow="Ward Workspace"
        title="Ward"
        description="Oversee occupied beds, discharge readiness, and admissions flow across all wards."
        primaryAction={
          <Button asChild>
            <Link href={`/h/${hospitalSlug}/ward/admit`}>
              <Plus className="mr-2 h-4 w-4" />
              Admit Patient
            </Link>
          </Button>
        }
        secondaryActions={
          <>
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/ward/beds`}>Bed Map</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/ward/admissions`}>Admissions</Link>
            </Button>
          </>
        }
      />

      {/* Today View - Ward priorities */}
      <TodayViewPanel
        title="Start Here Today"
        description="What needs your attention in ward management now"
        urgentItems={todayUrgentItems}
        readyItems={todayReadyItems}
        waitingItems={todayWaitingItems}
        completedLabel="discharges processed today"
        emptyMessage="Ward operations smooth"
        emptyDescription="No capacity concerns and no discharge blockers."
      />

      {/* Mobile Summary Stack */}
      <MobileSummaryStack className="lg:hidden">
        <SummaryPill
          label="Occupancy"
          value={`${capacityPct}%`}
          tone={capacityPct > 90 ? "warning" : capacityPct > 70 ? "info" : "neutral"}
          icon={<Users className="h-3.5 w-3.5" />}
        />
        <SummaryPill
          label="Available"
          value={stats.available_beds}
          tone={stats.available_beds === 0 && stats.total_beds > 0 ? "danger" : stats.available_beds < 3 ? "warning" : "success"}
          icon={<BedDouble className="h-3.5 w-3.5" />}
        />
        <SummaryPill
          label="Admissions"
          value={stats.active_admissions}
          tone={stats.active_admissions > 0 ? "info" : "neutral"}
          icon={<Bed className="h-3.5 w-3.5" />}
        />
        <SummaryPill
          label="Discharges"
          value={stats.discharge_requested}
          tone={stats.discharge_requested > 0 ? "success" : "neutral"}
          icon={<DoorOpen className="h-3.5 w-3.5" />}
        />
      </MobileSummaryStack>

      {/* Desktop KPI Summary Strip */}
      <div className="hidden lg:block">
        <KpiSummaryStrip>
          <KpiCard
            title="Occupancy"
            value={`${capacityPct}%`}
            description={capacityPct > 90 
              ? "Near capacity — consider expediting discharges"
              : capacityPct > 70 
                ? "High occupancy — monitor bed availability"
                : stats.total_beds > 0 
                  ? "Healthy occupancy level"
                  : "No beds configured"}
            icon={<Users className="h-4 w-4" />}
            tone={capacityPct > 90 ? "warning" : capacityPct > 70 ? "info" : "neutral"}
            action={{ label: "View Bed Map", href: `/h/${hospitalSlug}/ward/beds` }}
          />
          <KpiCard
            title="Available Beds"
            value={stats.available_beds}
            description={stats.available_beds > 0 
              ? `${stats.occupied_beds} of ${stats.total_beds} beds currently occupied`
              : stats.total_beds > 0 
                ? "All beds occupied — no availability"
                : "No beds configured"}
            icon={<BedDouble className="h-4 w-4" />}
            tone={stats.available_beds === 0 && stats.total_beds > 0 ? "danger" : stats.available_beds < 3 ? "warning" : "success"}
            action={{ label: "Manage Beds", href: `/h/${hospitalSlug}/ward/beds` }}
          />
          <KpiCard
            title="Active Admissions"
            value={stats.active_admissions}
            description={stats.newly_admitted > 0 
              ? `${stats.newly_admitted} newly admitted in last 24h`
              : stats.active_admissions > 0 
                ? "Patients currently under ward care"
                : "No active admissions"}
            icon={<Bed className="h-4 w-4" />}
            tone={stats.active_admissions > 0 ? "info" : "neutral"}
            action={{ label: "View Admissions", href: `/h/${hospitalSlug}/ward/admissions` }}
          />
          <KpiCard
            title="Pending Discharges"
            value={stats.discharge_requested}
            description={stats.discharge_requested > 0 
              ? "Patients ready for discharge — free up beds"
              : "No discharge requests pending"}
            icon={<DoorOpen className="h-4 w-4" />}
            tone={stats.discharge_requested > 0 ? "success" : "neutral"}
            action={{ label: "Process Discharges", href: `/h/${hospitalSlug}/ward/discharges` }}
          />
        </KpiSummaryStrip>
      </div>

      {/* Two Column Layout */}
      <WorkspaceTwoColumnLayout
        ratio="65-35"
        main={
          <WorkspaceContentStack>
            {/* Attention Panel for ward priorities */}
            {generatedAttentionItems.length > 0 && (
              <AttentionPanel
                title="Ward Attention"
                description="Beds, capacity, and discharges requiring action"
                items={generatedAttentionItems}
              />
            )}

            {/* Ward Summary Cards */}
            <Card>
              <CardHeader className="border-b py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Building className="h-4 w-4" />
                    Ward Summary
                  </CardTitle>
                  <Badge variant="secondary">{stats.total_wards} wards</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {wards.length === 0 ? (
                  <div className="p-6">
                    <WorkspaceEmptyState
                      variant="default"
                      title="No wards configured"
                      description="Configure wards and beds to manage patient admissions."
                    />
                  </div>
                ) : (
                  <div className="divide-y">
                    {wards.map((ward) => (
                      <div
                        key={ward.id}
                        className="flex flex-col gap-3 p-4 hover:bg-muted/30 transition-colors sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">{ward.name}</span>
                            {ward.code && (
                              <Badge variant="outline" className="text-xs">
                                {ward.code}
                              </Badge>
                            )}
                            {ward.ward_type && (
                              <Badge variant="secondary" className="text-xs">
                                {ward.ward_type}
                              </Badge>
                            )}
                          </div>
                          <div className="flex flex-wrap gap-x-4 text-sm text-muted-foreground">
                            <span>{ward.total_beds} beds total</span>
                            <span className={ward.occupied_beds > 0 ? "text-amber-600 font-medium" : ""}>
                              {ward.occupied_beds} occupied
                            </span>
                            <span className="text-green-600">
                              {ward.available_beds} available
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {ward.discharge_requested_count > 0 && (
                            <Badge variant="outline" className="text-xs border-green-200 bg-green-50 text-green-700">
                              {ward.discharge_requested_count} discharge{ward.discharge_requested_count > 1 ? 's' : ''}
                            </Badge>
                          )}
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/h/${hospitalSlug}/ward/wards/${ward.id}`}>
                              View Ward
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Admissions */}
            <Card>
              <CardHeader className="border-b py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <DoorOpen className="h-4 w-4" />
                    Recent Admissions
                  </CardTitle>
                  <Badge variant="secondary">{newlyAdmitted.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {newlyAdmitted.length === 0 ? (
                  <div className="p-6">
                    <WorkspaceEmptyState
                      variant="default"
                      title="No recent admissions"
                      description="No patients admitted in the last 24 hours."
                    />
                  </div>
                ) : (
                  <div className="divide-y">
                    {newlyAdmitted.slice(0, 5).map((admission) => (
                      <div
                        key={admission.id}
                        className="flex flex-col gap-3 p-4 hover:bg-muted/30 transition-colors sm:flex-row sm:items-start sm:justify-between"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">
                              {admission.patient ? fullName(admission.patient) : "Unknown patient"}
                            </span>
                            {admission.patient?.patient_number && (
                              <Badge variant="outline" className="text-xs">
                                {admission.patient.patient_number}
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {admission.admission_reason || "No reason specified"}
                          </p>
                          <div className="flex flex-wrap gap-x-4 text-xs text-muted-foreground">
                            <span>Admitted: {formatDateTime(admission.admitted_at)}</span>
                            <span>Ward: {admission.ward?.name || "—"}</span>
                            <span>Bed: {admission.bed?.bed_number || "Not assigned"}</span>
                          </div>
                          {/* Cross-role handoff context */}
                          <div className="pt-1">
                            <HandoffHint
                              from="doctor"
                              to="ward"
                              status="complete"
                              description="Admission from clinical workflow"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/h/${hospitalSlug}/ward/admissions/${admission.id}`}>
                              View Chart
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Pending Discharges */}
            {dischargeRequested.length > 0 && (
              <Card className="border-green-200 bg-green-50/30">
                <CardHeader className="border-b border-green-200/50 py-4">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base flex items-center gap-2 text-green-900">
                      <CheckCircle2 className="h-4 w-4" />
                      Ready for Discharge
                    </CardTitle>
                    <Badge variant="outline" className="border-green-300 text-green-700">
                      {dischargeRequested.length}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <div className="divide-y divide-green-200/50">
                    {dischargeRequested.slice(0, 3).map((admission) => (
                      <div
                        key={admission.id}
                        className="flex flex-col gap-3 p-4 hover:bg-green-100/30 transition-colors sm:flex-row sm:items-start sm:justify-between"
                      >
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-medium">
                              {admission.patient ? fullName(admission.patient) : "Unknown patient"}
                            </span>
                            <Badge variant="outline" className="text-xs">
                              {admission.bed?.bed_number || "No bed"}
                            </Badge>
                          </div>
                          <div className="flex flex-wrap gap-x-4 text-xs text-green-800/60">
                            <span>Requested: {formatDateTime(admission.discharge_requested_at)}</span>
                            <span>Ward: {admission.ward?.name || "—"}</span>
                          </div>
                          {/* Cross-role handoff context */}
                          <div className="pt-1">
                            <HandoffHint
                              from="ward"
                              to="billing"
                              status="ready"
                              description="Ready for final billing"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button asChild size="sm">
                            <Link href={`/h/${hospitalSlug}/ward/admissions/${admission.id}/discharge`}>
                              Complete
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
            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Activity"
              description="Recent admissions and discharges"
              items={generatedActivity}
              viewAllHref={`/h/${hospitalSlug}/ward/activity`}
              viewAllLabel="View All"
              compact
            />

            {/* Ward Workflow */}
            <Card>
              <CardHeader className="border-b py-4">
                <CardTitle className="text-base">Ward Workflow</CardTitle>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-700">
                    1
                  </div>
                  <div>
                    <p className="text-sm font-medium">Receive Admission</p>
                    <p className="text-xs text-muted-foreground">Doctor requests ward admission</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-medium text-amber-700">
                    2
                  </div>
                  <div>
                    <p className="text-sm font-medium">Assign Bed & Admit</p>
                    <p className="text-xs text-muted-foreground">Select appropriate bed and admit patient</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100 text-xs font-medium text-green-700">
                    3
                  </div>
                  <div>
                    <p className="text-sm font-medium">Monitor & Discharge</p>
                    <p className="text-xs text-muted-foreground">Track stay and process discharge when ready</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Links */}
            <Card>
              <CardHeader className="border-b py-4">
                <CardTitle className="text-base">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="p-2">
                <div className="divide-y">
                  <Button asChild variant="ghost" className="w-full justify-start">
                    <Link href={`/h/${hospitalSlug}/ward/admit`}>
                      <Plus className="mr-2 h-4 w-4" />
                      Direct Admission
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="w-full justify-start">
                    <Link href={`/h/${hospitalSlug}/ward/beds`}>
                      <BedDouble className="mr-2 h-4 w-4" />
                      Full Bed Map
                    </Link>
                  </Button>
                  <Button asChild variant="ghost" className="w-full justify-start">
                    <Link href={`/h/${hospitalSlug}/ward/discharges`}>
                      <DoorOpen className="mr-2 h-4 w-4" />
                      Discharge Queue
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </WorkspaceContentStack>
        }
      />
    </WorkspacePageShell>
  );
}

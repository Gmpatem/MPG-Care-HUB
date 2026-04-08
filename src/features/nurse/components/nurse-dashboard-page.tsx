"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Activity,
  BedDouble,
  CheckCircle2,
  ChevronRight,
  ClipboardCheck,
  HeartPulse,
  ListChecks,
  Move,
  Stethoscope,
  UserRound,
  Users,
} from "lucide-react";

import { StatusBadge } from "@/components/layout/status-badge";
import { WorkspaceEmptyState } from "@/components/layout/workspace-empty-state";
import { WorkspacePageHeader } from "@/components/layout/workspace-page-header";
import { WorkspaceSectionHeader } from "@/components/layout/workspace-section-header";
import { PatientSummaryPanel } from "@/components/layout/patient-summary-panel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AttentionPanel, ActivityFeed } from "@/components/layout";
import type { AttentionItem, ActivityItem } from "@/components/layout";
import { KpiCard, KpiSummaryStrip } from "@/components/layout/kpi-card";
import { TodayViewPanel, type TodayItem } from "@/components/layout/today-view-panel";
import {
  WorkspacePageShell,
  WorkspaceTwoColumnLayout,
  WorkspaceContentStack,
} from "@/components/layout/workspace-page-shell";

type Admission = {
  id: string;
  patient_id: string;
  admitted_at: string;
  discharge_requested: boolean;
  discharge_requested_at: string | null;
  admission_reason: string | null;
  vitals_state: "missing" | "overdue" | "due" | "fresh";
  is_new_admission: boolean;
  latest_vitals: {
    recorded_at: string;
    blood_pressure_systolic: number | null;
    blood_pressure_diastolic: number | null;
    pulse_bpm: number | null;
    spo2: number | null;
  } | null;
  patient: {
    first_name: string;
    middle_name: string | null;
    last_name: string;
    patient_number: string | null;
    phone: string | null;
    sex: string | null;
  } | null;
  ward: {
    name: string;
    code: string | null;
  } | null;
  bed: {
    bed_number: string;
  } | null;
  admitting_doctor: {
    full_name: string;
    specialty: string | null;
  } | null;
};

function fullName(patient: Admission["patient"]) {
  if (!patient) return "Unknown patient";
  return [patient.first_name, patient.middle_name, patient.last_name].filter(Boolean).join(" ");
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

function formatDuration(admittedAt: string | null) {
  if (!admittedAt) return "—";
  const start = new Date(admittedAt).getTime();
  const now = Date.now();
  if (Number.isNaN(start)) return "—";

  const diffMs = Math.max(now - start, 0);
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  if (days > 0) return `${days}d ${remainingHours}h`;
  return `${hours}h`;
}

function vitalsTone(state: string): "danger" | "warning" | "info" | "success" {
  if (state === "overdue") return "danger";
  if (state === "missing") return "warning";
  if (state === "due") return "info";
  return "success";
}

function vitalsLabel(state: string) {
  if (state === "overdue") return "vitals overdue";
  if (state === "missing") return "no vitals yet";
  if (state === "due") return "vitals due soon";
  return "vitals fresh";
}

function CompactAdmissionCard({
  admission,
  isSelected,
  onSelect,
}: {
  admission: Admission;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full rounded-xl border p-4 text-left transition-all ${
        isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border/70 bg-background hover:border-primary/50 hover:bg-muted/30"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-foreground truncate">
              {fullName(admission.patient)}
            </span>
            {admission.is_new_admission ? (
              <Badge variant="outline" className="text-xs">new</Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {admission.patient?.patient_number ?? "No ID"} · Ward {admission.ward?.name ?? "—"}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <StatusBadge
              label={vitalsLabel(admission.vitals_state)}
              tone={vitalsTone(admission.vitals_state)}
              className="px-2 py-0.5 text-xs"
            />
            {admission.discharge_requested ? (
              <StatusBadge label="discharge requested" tone="warning" className="px-2 py-0.5 text-xs" />
            ) : null}
          </div>
        </div>
        <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${isSelected ? "rotate-90" : ""}`} />
      </div>
    </button>
  );
}

function ActivePatientWorkspace({
  admission,
  hospitalSlug,
}: {
  admission: Admission;
  hospitalSlug: string;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "vitals" | "notes" | "checklist">("overview");

  const patientName = fullName(admission.patient);

  return (
    <div className="space-y-4">
      {/* Patient Header */}
      <PatientSummaryPanel
        name={patientName}
        patientNumber={admission.patient?.patient_number}
        subtitle={`Ward ${admission.ward?.name ?? "—"} · Bed ${admission.bed?.bed_number ?? "Unassigned"}`}
        statusLabel={admission.discharge_requested ? "discharge requested" : "admitted"}
        statusTone={admission.discharge_requested ? "warning" : "success"}
        primaryItems={[
          { label: "Admitted", value: formatDateTime(admission.admitted_at) },
          { label: "Stay Duration", value: formatDuration(admission.admitted_at) },
          { label: "Doctor", value: admission.admitting_doctor?.full_name ?? "—" },
          { label: "Reason", value: admission.admission_reason ?? "—" },
        ]}
        secondaryItems={[
          { label: "Sex", value: admission.patient?.sex },
          { label: "Phone", value: admission.patient?.phone },
          { label: "Vitals State", value: vitalsLabel(admission.vitals_state) },
          { label: "Discharge Requested", value: admission.discharge_requested ? "Yes" : "No" },
        ]}
      />

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 rounded-lg border bg-muted/30 p-1">
        {[
          { id: "overview", label: "Overview", icon: Activity },
          { id: "vitals", label: "Vitals", icon: HeartPulse },
          { id: "notes", label: "Notes", icon: Stethoscope },
          { id: "checklist", label: "Checklist", icon: ListChecks },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              activeTab === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="h-4 w-4" />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <Card>
        <CardContent className="p-5">
          {activeTab === "overview" && (
            <div className="space-y-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-dashed p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <HeartPulse className="h-4 w-4" />
                    <span className="text-sm font-medium">Latest Vitals</span>
                  </div>
                  {admission.latest_vitals ? (
                    <div className="mt-3 grid gap-2 text-sm">
                      <p>BP: {admission.latest_vitals.blood_pressure_systolic ?? "—"} / {admission.latest_vitals.blood_pressure_diastolic ?? "—"}</p>
                      <p>Pulse: {admission.latest_vitals.pulse_bpm ?? "—"} bpm</p>
                      <p>SpO2: {admission.latest_vitals.spo2 ?? "—"} %</p>
                      <p className="text-muted-foreground">Recorded: {formatDateTime(admission.latest_vitals.recorded_at)}</p>
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">No vitals recorded yet</p>
                  )}
                </div>

                <div className="rounded-lg border border-dashed p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ClipboardCheck className="h-4 w-4" />
                    <span className="text-sm font-medium">Discharge Readiness</span>
                  </div>
                  <div className="mt-3 space-y-2">
                    <div className="flex items-center gap-2">
                      {admission.discharge_requested ? (
                        <>
                          <CheckCircle2 className="h-4 w-4 text-amber-500" />
                          <span className="text-sm">Discharge requested</span>
                        </>
                      ) : (
                        <>
                          <div className="h-4 w-4 rounded-full border-2 border-muted" />
                          <span className="text-sm text-muted-foreground">Discharge not requested</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {admission.discharge_requested
                        ? "Checklist and billing clearance required before final discharge"
                        : "Doctor must request discharge before ward can process"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button asChild>
                  <Link href={`/h/${hospitalSlug}/nurse/admissions/${admission.id}`}>
                    Open Full Chart
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/h/${hospitalSlug}/ward/admissions/${admission.id}`}>
                    Ward View
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/h/${hospitalSlug}/nurse/admissions/${admission.id}/vitals`}>
                    <HeartPulse className="mr-2 h-4 w-4" />
                    Record Vitals
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/h/${hospitalSlug}/nurse/admissions/${admission.id}/notes`}>
                    <Stethoscope className="mr-2 h-4 w-4" />
                    Add Note
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {activeTab === "vitals" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Vitals Management</h4>
                <Button asChild size="sm">
                  <Link href={`/h/${hospitalSlug}/nurse/admissions/${admission.id}/vitals`}>
                    <HeartPulse className="mr-2 h-4 w-4" />
                    Record Vitals
                  </Link>
                </Button>
              </div>
              
              {admission.latest_vitals ? (
                <div className="rounded-lg border p-4">
                  <p className="text-sm font-medium mb-3">Latest Vitals</p>
                  <div className="grid gap-3 text-sm md:grid-cols-2">
                    <div className="rounded bg-muted/50 p-2">
                      <span className="text-muted-foreground">BP</span>
                      <p className="font-medium">{admission.latest_vitals.blood_pressure_systolic ?? "—"} / {admission.latest_vitals.blood_pressure_diastolic ?? "—"}</p>
                    </div>
                    <div className="rounded bg-muted/50 p-2">
                      <span className="text-muted-foreground">Pulse</span>
                      <p className="font-medium">{admission.latest_vitals.pulse_bpm ?? "—"} bpm</p>
                    </div>
                    <div className="rounded bg-muted/50 p-2">
                      <span className="text-muted-foreground">SpO2</span>
                      <p className="font-medium">{admission.latest_vitals.spo2 ?? "—"} %</p>
                    </div>
                    <div className="rounded bg-muted/50 p-2">
                      <span className="text-muted-foreground">Recorded</span>
                      <p className="font-medium">{formatDateTime(admission.latest_vitals.recorded_at)}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <WorkspaceEmptyState
                  title="No vitals recorded yet"
                  description="Record initial vitals to establish baseline monitoring for this admission."
                />
              )}

              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/h/${hospitalSlug}/nurse/admissions/${admission.id}`}>
                    View Vitals History
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {activeTab === "notes" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Nursing Notes</h4>
                <Button asChild size="sm">
                  <Link href={`/h/${hospitalSlug}/nurse/admissions/${admission.id}/notes`}>
                    <Stethoscope className="mr-2 h-4 w-4" />
                    Add Note
                  </Link>
                </Button>
              </div>
              <WorkspaceEmptyState
                title="Notes not loaded in quick view"
                description="Open the full nurse chart to see complete note history and add new observations."
              />
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/h/${hospitalSlug}/nurse/admissions/${admission.id}`}>
                    View All Notes
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {activeTab === "checklist" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Discharge Checklist</h4>
                <Button asChild size="sm">
                  <Link href={`/h/${hospitalSlug}/ward/admissions/${admission.id}`}>
                    <ListChecks className="mr-2 h-4 w-4" />
                    Open Checklist
                  </Link>
                </Button>
              </div>
              
              <div className="rounded-lg border p-4">
                <div className="flex items-center gap-3">
                  {admission.discharge_requested ? (
                    <>
                      <div className="rounded-full bg-amber-100 p-2">
                        <ClipboardCheck className="h-5 w-5 text-amber-700" />
                      </div>
                      <div>
                        <p className="font-medium">Discharge Requested</p>
                        <p className="text-sm text-muted-foreground">
                          Complete checklist and billing clearance to finalize
                        </p>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="rounded-full bg-muted p-2">
                        <div className="h-5 w-5 rounded-full border-2 border-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">Not Ready for Discharge</p>
                        <p className="text-sm text-muted-foreground">
                          Doctor has not requested discharge yet
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/h/${hospitalSlug}/ward/admissions/${admission.id}`}>
                    View Full Checklist
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/h/${hospitalSlug}/ward/discharges`}>
                    Discharge Queue
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Record Vitals</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm" className="w-full">
              <Link href={`/h/${hospitalSlug}/nurse/admissions/${admission.id}/vitals`}>
                <HeartPulse className="mr-2 h-4 w-4" />
                Record
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Add Note</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm" variant="outline" className="w-full">
              <Link href={`/h/${hospitalSlug}/nurse/admissions/${admission.id}/notes`}>
                <Stethoscope className="mr-2 h-4 w-4" />
                Add
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Transfer</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm" variant="outline" className="w-full">
              <Link href={`/h/${hospitalSlug}/ward/admissions/${admission.id}`}>
                <Move className="mr-2 h-4 w-4" />
                Move
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Discharge</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm" variant={admission.discharge_requested ? "default" : "outline"} className="w-full">
              <Link href={`/h/${hospitalSlug}/ward/discharges`}>
                <ClipboardCheck className="mr-2 h-4 w-4" />
                {admission.discharge_requested ? "Process" : "Queue"}
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function NurseDashboardPage({
  hospitalSlug,
  hospitalName,
  admissions,
  stats,
  attentionItems = [],
  recentActivity = [],
}: {
  hospitalSlug: string;
  hospitalName: string;
  admissions: Admission[];
  stats: {
    total_admissions: number;
    discharge_requested: number;
    overdue_vitals: number;
    missing_vitals: number;
    due_vitals: number;
    new_admissions: number;
  };
  attentionItems?: AttentionItem[];
  recentActivity?: ActivityItem[];
}) {
  const [selectedAdmissionId, setSelectedAdmissionId] = useState<string | null>(null);

  const priorityAdmissions = admissions.filter(
    (row) => row.discharge_requested || row.vitals_state === "overdue" || row.vitals_state === "missing"
  );
  const standardAdmissions = admissions.filter(
    (row) => !row.discharge_requested && row.vitals_state !== "overdue" && row.vitals_state !== "missing"
  );

  const selectedAdmission = admissions.find((a) => a.id === selectedAdmissionId);

  // Generate attention items from data if not provided
  const generatedAttentionItems: AttentionItem[] = attentionItems.length > 0
    ? attentionItems
    : [
        ...(stats.overdue_vitals > 0 ? [{
          id: "overdue-vitals",
          title: `${stats.overdue_vitals} patient${stats.overdue_vitals > 1 ? 's' : ''} with overdue vitals`,
          description: "Vitals have not been recorded within expected timeframe",
          tone: "danger" as const,
          href: `/h/${hospitalSlug}/nurse`,
          actionLabel: "Record Vitals",
        }] : []),
        ...(stats.discharge_requested > 0 ? [{
          id: "discharges",
          title: `${stats.discharge_requested} discharge${stats.discharge_requested > 1 ? 's' : ''} pending`,
          description: "Patients ready for discharge — complete checklist",
          tone: "success" as const,
          href: `/h/${hospitalSlug}/ward/discharges`,
          actionLabel: "Process Discharges",
        }] : []),
        ...(stats.new_admissions > 0 ? [{
          id: "new-admissions",
          title: `${stats.new_admissions} new admission${stats.new_admissions > 1 ? 's' : ''} (24h)`,
          description: "Newly admitted patients may need initial assessment",
          tone: "info" as const,
          href: `/h/${hospitalSlug}/nurse`,
          actionLabel: "Review New",
        }] : []),
      ].filter(Boolean);

  // Generate activity from admissions
  const generatedActivity: ActivityItem[] = recentActivity.length > 0
    ? recentActivity
    : admissions
        .filter(a => a.is_new_admission)
        .slice(0, 5)
        .map((a, i) => ({
          id: a.id || `activity-${i}`,
          type: "admission" as const,
          title: `New admission`,
          description: `${fullName(a.patient)} · ${a.ward?.name || "Unknown ward"}`,
          timestamp: a.admitted_at || new Date().toISOString(),
          href: `/h/${hospitalSlug}/nurse/admissions/${a.id}`,
        }));

  // Generate Today View items
  const todayUrgentItems: TodayItem[] = [
    ...(stats.overdue_vitals > 0 ? [{
      id: "overdue-vitals",
      title: "Overdue vitals need recording",
      description: `${stats.overdue_vitals} patient${stats.overdue_vitals > 1 ? 's' : ''} past due for vital signs`,
      tone: "urgent" as const,
      count: stats.overdue_vitals,
      href: `/h/${hospitalSlug}/nurse`,
      actionLabel: "Record Vitals",
    }] : []),
  ];

  const todayReadyItems: TodayItem[] = [
    ...(stats.discharge_requested > 0 ? [{
      id: "discharges",
      title: "Patients ready for discharge",
      description: `${stats.discharge_requested} discharge${stats.discharge_requested > 1 ? 's' : ''} pending checklist completion`,
      tone: "ready" as const,
      count: stats.discharge_requested,
      href: `/h/${hospitalSlug}/ward/discharges`,
      actionLabel: "Process Discharges",
    }] : []),
    ...(stats.missing_vitals > 0 ? [{
      id: "missing-vitals",
      title: "Missing vitals to record",
      description: `${stats.missing_vitals} patient${stats.missing_vitals > 1 ? 's' : ''} need initial vital signs`,
      tone: "ready" as const,
      count: stats.missing_vitals,
      href: `/h/${hospitalSlug}/nurse`,
      actionLabel: "Record Vitals",
    }] : []),
  ];

  const todayWaitingItems: TodayItem[] = [
    ...(stats.due_vitals > 0 ? [{
      id: "due-vitals",
      title: "Vitals due soon",
      description: `${stats.due_vitals} patient${stats.due_vitals > 1 ? 's' : ''} due for routine vital signs`,
      tone: "waiting" as const,
      count: stats.due_vitals,
      href: `/h/${hospitalSlug}/nurse`,
      actionLabel: "View Patients",
    }] : []),
  ];

  const todayBlockedItems: TodayItem[] = [
    ...(stats.new_admissions > 0 ? [{
      id: "new-admissions",
      title: "New admissions need assessment",
      description: `${stats.new_admissions} patient${stats.new_admissions > 1 ? 's' : ''} admitted within 24h need initial care`,
      tone: "blocked" as const,
      count: stats.new_admissions,
      href: `/h/${hospitalSlug}/nurse`,
      actionLabel: "Review New",
    }] : []),
  ];

  return (
    <WorkspacePageShell>
      <WorkspacePageHeader
        eyebrow="Inpatient Care"
        title="Nursing Station"
        description={`${hospitalName} inpatient workspace. Monitor patients, record vitals, manage notes, and coordinate discharge readiness.`}
        primaryAction={
          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/ward`}>
              <BedDouble className="mr-2 h-4 w-4" />
              Ward Workspace
            </Link>
          </Button>
        }
        secondaryActions={
          <>
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/census`}>
                <Users className="mr-2 h-4 w-4" />
                Census
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/ward/discharges`}>
                <ClipboardCheck className="mr-2 h-4 w-4" />
                Discharge Queue
              </Link>
            </Button>
          </>
        }
      />

      {/* Today View - Nursing priorities */}
      <TodayViewPanel
        title="Start Here Today"
        description="What needs your nursing attention now"
        urgentItems={todayUrgentItems}
        readyItems={todayReadyItems}
        waitingItems={todayWaitingItems}
        blockedItems={todayBlockedItems}
        completedLabel="patients cared for today"
        emptyMessage="All patients up to date"
        emptyDescription="No vitals are overdue and no discharge tasks are pending."
      />

      {/* KPI Summary Strip - Primary nursing metrics */}
      <KpiSummaryStrip>
        <KpiCard
          title="Active Admissions"
          value={stats.total_admissions}
          description={stats.total_admissions > 0 
            ? `${stats.new_admissions} newly admitted in last 24h`
            : "No patients currently admitted"}
          icon={<BedDouble className="h-4 w-4" />}
          tone={stats.total_admissions > 0 ? "info" : "neutral"}
          action={{ label: "View Patients", href: `/h/${hospitalSlug}/nurse` }}
        />
        <KpiCard
          title="Discharge Pending"
          value={stats.discharge_requested}
          description={stats.discharge_requested > 0 
            ? "Patients ready for discharge — complete checklist"
            : "No discharge requests pending"}
          icon={<ClipboardCheck className="h-4 w-4" />}
          tone={stats.discharge_requested > 0 ? "success" : "neutral"}
          action={{ label: "Process Discharges", href: `/h/${hospitalSlug}/ward/discharges` }}
        />
        <KpiCard
          title="Vitals Attention"
          value={stats.overdue_vitals + stats.missing_vitals}
          description={stats.overdue_vitals > 0 
            ? `${stats.overdue_vitals} overdue, ${stats.missing_vitals} missing — need immediate attention`
            : stats.missing_vitals > 0 
              ? `${stats.missing_vitals} patients need vitals recorded`
              : "All vitals up to date"}
          icon={<HeartPulse className="h-4 w-4" />}
          tone={stats.overdue_vitals > 0 ? "danger" : stats.missing_vitals > 0 ? "warning" : "success"}
          action={{ label: "Record Vitals", href: `/h/${hospitalSlug}/nurse` }}
        />
        <KpiCard
          title="New Admissions"
          value={stats.new_admissions}
          description={stats.new_admissions > 0 
            ? "Patients admitted within last 24 hours need assessment"
            : "No new admissions in last 24h"}
          icon={<UserRound className="h-4 w-4" />}
          tone={stats.new_admissions > 0 ? "info" : "neutral"}
        />
      </KpiSummaryStrip>

      {/* Two Column Layout */}
      <WorkspaceTwoColumnLayout
        ratio="60-40"
        main={
          <div className="space-y-4">
            <WorkspaceSectionHeader
              title="Admitted Patients"
              description="Select a patient to open their care workspace"
            />

            <Card>
              <CardHeader className="border-b py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Patient List</CardTitle>
                  <Badge variant="secondary">{admissions.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 py-4">
                {admissions.length === 0 ? (
                  <WorkspaceEmptyState
                    title="No admitted patients"
                    description="Admitted patients will appear here once assigned to ward beds."
                  />
                ) : (
                  <>
                    {priorityAdmissions.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Priority Attention
                        </p>
                        {priorityAdmissions.map((admission) => (
                          <CompactAdmissionCard
                            key={admission.id}
                            admission={admission}
                            isSelected={selectedAdmissionId === admission.id}
                            onSelect={() => setSelectedAdmissionId(admission.id)}
                          />
                        ))}
                      </div>
                    )}

                    {standardAdmissions.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Standard Monitoring
                        </p>
                        {standardAdmissions.map((admission) => (
                          <CompactAdmissionCard
                            key={admission.id}
                            admission={admission}
                            isSelected={selectedAdmissionId === admission.id}
                            onSelect={() => setSelectedAdmissionId(admission.id)}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        }
        side={
          <WorkspaceContentStack>
            {/* Attention Panel for nursing priorities */}
            {generatedAttentionItems.length > 0 && (
              <AttentionPanel
                title="Nursing Attention"
                description="Patients requiring priority care"
                items={generatedAttentionItems}
              />
            )}

            {selectedAdmission ? (
              <ActivePatientWorkspace admission={selectedAdmission} hospitalSlug={hospitalSlug} />
            ) : (
              <WorkspaceEmptyState
                title="No Patient Selected"
                description="Select a patient from the list on the left to open their care workspace. You'll be able to manage vitals, notes, and discharge readiness from here."
                action={
                  <>
                    <Button asChild variant="outline">
                      <Link href={`/h/${hospitalSlug}/ward`}>Open Ward Workspace</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href={`/h/${hospitalSlug}/census`}>View Census</Link>
                    </Button>
                  </>
                }
                className="h-full min-h-[400px]"
              />
            )}

            {/* Recent Activity */}
            <ActivityFeed
              title="Recent Admissions"
              description="Patients admitted within 24 hours"
              items={generatedActivity}
              compact
            />
          </WorkspaceContentStack>
        }
      />
    </WorkspacePageShell>
  );
}

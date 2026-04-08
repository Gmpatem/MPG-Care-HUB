"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  FlaskConical,
  Stethoscope,
  UserRound,
  Users,
  FileText,
  Pill,
  Activity,
  ChevronRight,
  BedDouble,
  AlertCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WorkspacePageHeader } from "@/components/layout/workspace-page-header";
import { WorkspaceSectionHeader } from "@/components/layout/workspace-section-header";
import { WorkspaceStatCard } from "@/components/layout/workspace-stat-card";
import { PatientSummaryPanel } from "@/components/layout/patient-summary-panel";
import { WorkspaceEmptyState } from "@/components/layout/workspace-empty-state";
import { StatusBadge } from "@/components/layout/status-badge";
import { AttentionPanel, ActivityFeed } from "@/components/layout";
import type { AttentionItem, ActivityItem } from "@/components/layout";
import { KpiCard, KpiSummaryStrip } from "@/components/layout/kpi-card";
import { HandoffHint } from "@/components/layout/workflow-handoff-card";
import { TodayViewPanel, type TodayItem } from "@/components/layout/today-view-panel";
import {
  WorkspacePageShell,
  WorkspaceTwoColumnLayout,
} from "@/components/layout/workspace-page-shell";
import type {
  DoctorQueueRow,
  DoctorStageCounts,
  DoctorSummary,
  EncounterStage,
} from "@/features/doctor-workflow/types";

type HospitalLite = {
  id: string;
  name: string;
  slug: string;
};

function fullName(row: DoctorQueueRow) {
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

function encounterLabel(stage: EncounterStage | null) {
  switch (stage) {
    case "awaiting_results":
      return "awaiting lab results";
    case "results_review":
      return "ready for review";
    case "admission_requested":
      return "admission requested";
    case "treatment_decided":
      return "treatment decided";
    case "completed":
      return "completed";
    case "initial_review":
    default:
      return "initial review";
  }
}

function encounterTone(stage: EncounterStage | null): "neutral" | "info" | "warning" | "success" | "danger" {
  switch (stage) {
    case "awaiting_results":
      return "warning";
    case "results_review":
      return "success";
    case "admission_requested":
      return "danger";
    case "treatment_decided":
      return "success";
    case "completed":
      return "neutral";
    case "initial_review":
    default:
      return "info";
  }
}

function actionLabel(row: DoctorQueueRow) {
  if (!row.encounter_id) return "Start Encounter";
  switch (row.encounter_stage) {
    case "awaiting_results":
      return "Track Results";
    case "results_review":
      return "Finalize Decision";
    case "admission_requested":
      return "Continue Admission";
    case "completed":
      return "Review";
    case "treatment_decided":
      return "Finalize";
    default:
      return "Continue";
  }
}

function actionPriority(row: DoctorQueueRow): number {
  if (!row.encounter_id) return 1;
  switch (row.encounter_stage) {
    case "results_review":
      return 2;
    case "awaiting_results":
      return 3;
    case "admission_requested":
      return 4;
    case "treatment_decided":
      return 5;
    case "completed":
      return 6;
    default:
      return 1;
  }
}

function bucketRows(rows: DoctorQueueRow[]) {
  return {
    urgent: rows
      .filter((r) => r.encounter_stage === "results_review" || (!r.encounter_id && r.appointment_status === "checked_in"))
      .sort((a, b) => actionPriority(a) - actionPriority(b))
      .slice(0, 5),
    waiting: rows
      .filter((r) => r.encounter_stage === "awaiting_results" || r.encounter_stage === "admission_requested")
      .slice(0, 5),
    completed: rows.filter((r) => r.encounter_stage === "completed").slice(0, 3),
  };
}

function CompactQueueCard({
  row,
  hospitalSlug,
  isSelected,
  onSelect,
}: {
  row: DoctorQueueRow;
  hospitalSlug: string;
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
            <span className="font-semibold text-foreground truncate">{fullName(row) || "Unknown patient"}</span>
            {row.queue_number ? (
              <Badge variant="outline" className="text-xs">#{row.queue_number}</Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            {row.patient_number ?? "No ID"} · {row.visit_type ?? "outpatient"}
          </p>
          <div className="flex flex-wrap items-center gap-1.5 pt-1">
            <StatusBadge
              label={encounterLabel(row.encounter_stage)}
              tone={encounterTone(row.encounter_stage)}
              className="px-2 py-0.5 text-xs capitalize"
            />
            {row.requires_lab ? (
              <StatusBadge label="lab" tone="warning" className="px-2 py-0.5 text-xs" />
            ) : null}
          </div>
          {/* Cross-role handoff hint */}
          <div className="pt-1">
            {!row.encounter_id ? (
              <HandoffHint
                from="intake"
                to="doctor"
                status="ready"
                description="From front desk"
              />
            ) : row.encounter_stage === "awaiting_results" ? (
              <HandoffHint
                from="doctor"
                to="lab"
                status="waiting"
                description="Awaiting results"
              />
            ) : row.encounter_stage === "results_review" ? (
              <HandoffHint
                from="lab"
                to="doctor"
                status="ready"
                description="Results ready"
              />
            ) : row.encounter_stage === "admission_requested" ? (
              <HandoffHint
                from="doctor"
                to="ward"
                status="waiting"
                description="Admission pending"
              />
            ) : null}
          </div>
        </div>
        <ChevronRight className={`h-4 w-4 shrink-0 transition-transform ${isSelected ? "rotate-90" : ""}`} />
      </div>
    </button>
  );
}

function ActivePatientWorkspace({
  row,
  hospital,
}: {
  row: DoctorQueueRow;
  hospital: HospitalLite;
}) {
  const [activeTab, setActiveTab] = useState<"overview" | "encounter" | "labs" | "prescriptions">("overview");

  const patientName = fullName(row) || "Unknown patient";
  const hasEncounter = Boolean(row.encounter_id);
  const stage = row.encounter_stage ?? "initial_review";

  return (
    <div className="space-y-4">
      {/* Patient Header */}
      <PatientSummaryPanel
        name={patientName}
        patientNumber={row.patient_number}
        subtitle={`${row.visit_type ?? "outpatient"} visit · Queue #${row.queue_number ?? "—"}`}
        statusLabel={encounterLabel(row.encounter_stage)}
        statusTone={encounterTone(row.encounter_stage)}
        primaryItems={[
          { label: "Chief Complaint", value: row.chief_complaint ?? "—" },
          { label: "Checked In", value: formatDateTime(row.check_in_at) },
          { label: "Assigned To", value: row.assigned_staff_name ?? "Unassigned" },
          { label: "Visit Type", value: row.visit_type ?? "—" },
        ]}
        secondaryItems={[
          { label: "Scheduled", value: formatDateTime(row.scheduled_at) },
          { label: "Results Reviewed", value: formatDateTime(row.results_reviewed_at) },
          { label: "Final Decision", value: formatDateTime(row.final_decision_at) },
          { label: "Disposition", value: row.disposition_type?.replaceAll("_", " ") },
        ]}
      />

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-1 rounded-lg border bg-muted/30 p-1">
        {[
          { id: "overview", label: "Overview", icon: Activity },
          { id: "encounter", label: "Encounter", icon: FileText },
          { id: "labs", label: "Labs", icon: FlaskConical },
          { id: "prescriptions", label: "Prescriptions", icon: Pill },
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
              <div>
                <h4 className="font-medium text-foreground">Current Stage</h4>
                <p className="mt-1 text-sm text-muted-foreground">
                  {hasEncounter
                    ? `This patient is in the "${encounterLabel(row.encounter_stage)}" stage of their clinical encounter.`
                    : "No encounter has been started yet. Begin the consultation to record findings and create orders."}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-dashed p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Stethoscope className="h-4 w-4" />
                    <span className="text-sm font-medium">Next Step</span>
                  </div>
                  <p className="mt-2 text-sm">
                    {!hasEncounter
                      ? "Start encounter to record complaint and assessment"
                      : stage === "awaiting_results"
                      ? "Wait for lab results or check lab queue"
                      : stage === "results_review"
                      ? "Review results and finalize treatment decision"
                      : stage === "treatment_decided"
                      ? "Finalize encounter and send to pharmacy"
                      : stage === "admission_requested"
                      ? "Coordinate admission handoff with ward"
                      : "Continue clinical assessment"}
                  </p>
                </div>

                <div className="rounded-lg border border-dashed p-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <ClipboardCheck className="h-4 w-4" />
                    <span className="text-sm font-medium">Actions Available</span>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="outline" className="text-xs">Order Labs</Badge>
                    <Badge variant="outline" className="text-xs">Write Prescription</Badge>
                    <Badge variant="outline" className="text-xs">Request Admission</Badge>
                    <Badge variant="outline" className="text-xs">View History</Badge>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button asChild>
                  <Link href={`/h/${hospital.slug}/doctor/appointments/${row.appointment_id}/open`}>
                    {actionLabel(row)}
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/h/${hospital.slug}/doctor/patients/${row.patient_id}`}>
                    Open Patient Chart
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/h/${hospital.slug}/doctor/patients/${row.patient_id}/labs/new`}>
                    <FlaskConical className="mr-2 h-4 w-4" />
                    Order Lab
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href={`/h/${hospital.slug}/doctor/patients/${row.patient_id}/prescriptions/new`}>
                    <Pill className="mr-2 h-4 w-4" />
                    Prescribe
                  </Link>
                </Button>
              </div>
            </div>
          )}

          {activeTab === "encounter" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Encounter Details</h4>
                <Button asChild size="sm">
                  <Link href={`/h/${hospital.slug}/doctor/appointments/${row.appointment_id}/open`}>
                    {hasEncounter ? "Open Encounter" : "Start Encounter"}
                  </Link>
                </Button>
              </div>
              {!hasEncounter ? (
                <WorkspaceEmptyState
                  variant="default"
                  title="No encounter started"
                  description="Begin the consultation to document findings, record the chief complaint, and create lab or prescription orders."
                  action={
                    <Button asChild size="sm">
                      <Link href={`/h/${hospital.slug}/doctor/appointments/${row.appointment_id}/open`}>
                        Start Encounter
                      </Link>
                    </Button>
                  }
                />
              ) : (
                <div className="space-y-3">
                  <div className="grid gap-3 text-sm md:grid-cols-2">
                    <div className="rounded-lg bg-muted/50 p-3">
                      <span className="text-muted-foreground">Status</span>
                      <p className="font-medium">{row.encounter_status ?? "draft"}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <span className="text-muted-foreground">Stage</span>
                      <p className="font-medium capitalize">{encounterLabel(row.encounter_stage)}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <span className="text-muted-foreground">Chief Complaint</span>
                      <p className="font-medium">{row.chief_complaint ?? "—"}</p>
                    </div>
                    <div className="rounded-lg bg-muted/50 p-3">
                      <span className="text-muted-foreground">Admission Requested</span>
                      <p className="font-medium">{row.admission_requested ? "Yes" : "No"}</p>
                    </div>
                  </div>
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/h/${hospital.slug}/encounters`}>View All Encounters</Link>
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeTab === "labs" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Lab Orders</h4>
                <Button asChild size="sm">
                  <Link href={`/h/${hospital.slug}/doctor/patients/${row.patient_id}/labs/new`}>
                    <FlaskConical className="mr-2 h-4 w-4" />
                    Order Lab
                  </Link>
                </Button>
              </div>
              <WorkspaceEmptyState
                title="Lab orders not loaded in quick view"
                description="Open the patient chart to see complete lab history and results, or click Order Lab to create new orders."
              />
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/h/${hospital.slug}/doctor/patients/${row.patient_id}`}>
                    View Patient Labs
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/h/${hospital.slug}/lab`}>Lab Queue</Link>
                </Button>
              </div>
            </div>
          )}

          {activeTab === "prescriptions" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Prescriptions</h4>
                <Button asChild size="sm">
                  <Link href={`/h/${hospital.slug}/doctor/patients/${row.patient_id}/prescriptions/new`}>
                    <Pill className="mr-2 h-4 w-4" />
                    Write Prescription
                  </Link>
                </Button>
              </div>
              <WorkspaceEmptyState
                title="Prescriptions not loaded in quick view"
                description="Open the patient chart to see complete prescription history, or click Write Prescription to create new orders."
              />
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm">
                  <Link href={`/h/${hospital.slug}/doctor/patients/${row.patient_id}`}>
                    View Patient Prescriptions
                  </Link>
                </Button>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/h/${hospital.slug}/pharmacy`}>Pharmacy Queue</Link>
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function DoctorDashboard({
  hospital,
  queueRows,
  stageCounts,
  attentionItems = [],
  recentActivity = [],
}: {
  hospital: HospitalLite;
  summary: DoctorSummary | null;
  queueRows: DoctorQueueRow[];
  stageCounts: DoctorStageCounts;
  attentionItems?: AttentionItem[];
  recentActivity?: ActivityItem[];
}) {
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);

  const buckets = bucketRows(queueRows);
  const selectedPatient = queueRows.find((r) => r.patient_id === selectedPatientId);

  // Generate attention items from data if not provided
  const generatedAttentionItems: AttentionItem[] = attentionItems.length > 0
    ? attentionItems
    : [
        ...(stageCounts.ready_for_final_decision > 0 ? [{
          id: "results-ready",
          title: `${stageCounts.ready_for_final_decision} patient${stageCounts.ready_for_final_decision > 1 ? 's' : ''} ready for review`,
          description: "Lab results are back and waiting for final decision",
          tone: "success" as const,
          href: `/h/${hospital.slug}/doctor`,
          actionLabel: "Review Now",
        }] : []),
        ...(stageCounts.admission_requested > 0 ? [{
          id: "admissions",
          title: `${stageCounts.admission_requested} admission${stageCounts.admission_requested > 1 ? 's' : ''} pending`,
          description: "Patients waiting for ward admission coordination",
          tone: "warning" as const,
          href: `/h/${hospital.slug}/ward`,
          actionLabel: "View Admissions",
        }] : []),
        ...(stageCounts.new_consultations > 5 ? [{
          id: "busy-queue",
          title: "Busy consultation queue",
          description: `${stageCounts.new_consultations} patients waiting for first review`,
          tone: "info" as const,
          href: `/h/${hospital.slug}/doctor`,
          actionLabel: "See Queue",
        }] : []),
      ].filter(Boolean);

  // Generate activity from queue rows
  const generatedActivity: ActivityItem[] = recentActivity.length > 0
    ? recentActivity
    : queueRows
        .filter(r => r.encounter_stage === "completed")
        .slice(0, 5)
        .map((r, i) => ({
          id: r.appointment_id || `activity-${i}`,
          type: "encounter" as const,
          title: `Encounter completed`,
          description: `${fullName(r)} · ${r.disposition_type?.replace('_', ' ') || 'Finalized'}`,
          timestamp: r.final_decision_at || new Date().toISOString(),
          href: `/h/${hospital.slug}/doctor/patients/${r.patient_id}`,
          status: "completed" as const,
        }));

  // Generate Today View items
  const todayUrgentItems: TodayItem[] = [
    ...(stageCounts.ready_for_final_decision > 0 ? [{
      id: "results-ready",
      title: "Results ready for review",
      description: `${stageCounts.ready_for_final_decision} patient${stageCounts.ready_for_final_decision > 1 ? 's' : ''} with lab results awaiting final decision`,
      tone: "urgent" as const,
      count: stageCounts.ready_for_final_decision,
      href: `/h/${hospital.slug}/doctor`,
      actionLabel: "Review Now",
    }] : []),
    ...(stageCounts.new_consultations > 5 ? [{
      id: "busy-queue",
      title: "Busy consultation queue",
      description: `${stageCounts.new_consultations} patients waiting for first review`,
      tone: "urgent" as const,
      count: stageCounts.new_consultations,
      href: `/h/${hospital.slug}/doctor`,
      actionLabel: "See Queue",
    }] : []),
  ];

  const todayReadyItems: TodayItem[] = [
    ...(stageCounts.new_consultations > 0 && stageCounts.new_consultations <= 5 ? [{
      id: "new-patients",
      title: "New patients to review",
      description: `${stageCounts.new_consultations} patient${stageCounts.new_consultations > 1 ? 's' : ''} waiting for first consultation`,
      tone: "ready" as const,
      count: stageCounts.new_consultations,
      href: `/h/${hospital.slug}/doctor`,
      actionLabel: "Start Review",
    }] : []),
  ];

  const todayWaitingItems: TodayItem[] = [
    ...(stageCounts.awaiting_results > 0 ? [{
      id: "awaiting-results",
      title: "Awaiting lab results",
      description: `${stageCounts.awaiting_results} case${stageCounts.awaiting_results > 1 ? 's' : ''} waiting on investigation results`,
      tone: "waiting" as const,
      count: stageCounts.awaiting_results,
      href: `/h/${hospital.slug}/lab`,
      actionLabel: "Check Lab",
    }] : []),
  ];

  const todayBlockedItems: TodayItem[] = [
    ...(stageCounts.admission_requested > 0 ? [{
      id: "admissions",
      title: "Admissions need coordination",
      description: `${stageCounts.admission_requested} patient${stageCounts.admission_requested > 1 ? 's' : ''} waiting for ward admission`,
      tone: "blocked" as const,
      count: stageCounts.admission_requested,
      href: `/h/${hospital.slug}/ward`,
      actionLabel: "View Ward",
    }] : []),
  ];

  const completedToday = queueRows.filter(r => r.encounter_stage === "completed").length;

  return (
    <WorkspacePageShell>
      {/* Page Header */}
      <WorkspacePageHeader
        eyebrow="Clinical Workspace"
        title="Doctor Workspace"
        description="Patient-centered clinical workstation. Review your queue, select a patient to work with, and access encounter, lab, and prescription workflows in one place."
        primaryAction={
          <Button asChild>
            <Link href={`/h/${hospital.slug}/encounters`}>
              <Stethoscope className="mr-2 h-4 w-4" />
              Encounters
            </Link>
          </Button>
        }
        secondaryActions={
          <>
            <Button asChild variant="outline">
              <Link href={`/h/${hospital.slug}/doctor/rounds`}>
                <BedDouble className="mr-2 h-4 w-4" />
                Rounds
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/h/${hospital.slug}/doctor/prescriptions/new`}>
                <Pill className="mr-2 h-4 w-4" />
                Prescribe
              </Link>
            </Button>
          </>
        }
      />

      {/* Today View - Clinical priorities */}
      <TodayViewPanel
        title="Start Here Today"
        description="What needs your clinical attention now"
        urgentItems={todayUrgentItems}
        readyItems={todayReadyItems}
        waitingItems={todayWaitingItems}
        blockedItems={todayBlockedItems}
        completedToday={completedToday}
        completedLabel="encounters completed today"
        emptyMessage="No patients waiting for review"
        emptyDescription="The consultation queue is clear. New patients will appear here when they check in."
      />

      {/* KPI Summary Strip - Primary clinical metrics */}
      <KpiSummaryStrip>
        <KpiCard
          title="Needs Review"
          value={stageCounts.new_consultations}
          description={stageCounts.new_consultations > 0 
            ? "New patients waiting for first consultation"
            : "No new patients waiting"}
          icon={<Users className="h-4 w-4" />}
          tone={stageCounts.new_consultations > 5 ? "warning" : stageCounts.new_consultations > 0 ? "info" : "neutral"}
          action={{ label: "View Queue", href: `/h/${hospital.slug}/doctor` }}
        />
        <KpiCard
          title="Awaiting Results"
          value={stageCounts.awaiting_results}
          description={stageCounts.awaiting_results > 0 
            ? "Cases waiting on lab/investigation results"
            : "No cases awaiting results"}
          icon={<FlaskConical className="h-4 w-4" />}
          tone={stageCounts.awaiting_results > 0 ? "info" : "neutral"}
          action={{ label: "Check Lab", href: `/h/${hospital.slug}/lab` }}
        />
        <KpiCard
          title="Ready for Decision"
          value={stageCounts.ready_for_final_decision}
          description={stageCounts.ready_for_final_decision > 0 
            ? "Results back — ready for final treatment decision"
            : "No cases ready for finalization"}
          icon={<ClipboardCheck className="h-4 w-4" />}
          tone={stageCounts.ready_for_final_decision > 0 ? "success" : "neutral"}
          action={{ label: "Review Now", href: `/h/${hospital.slug}/doctor` }}
        />
        <KpiCard
          title="Admissions Pending"
          value={stageCounts.admission_requested}
          description={stageCounts.admission_requested > 0 
            ? "Patients waiting for ward admission"
            : "No admission requests pending"}
          icon={<BedDouble className="h-4 w-4" />}
          tone={stageCounts.admission_requested > 0 ? "warning" : "neutral"}
          action={{ label: "View Ward", href: `/h/${hospital.slug}/ward` }}
        />
      </KpiSummaryStrip>

      {/* Attention Panel for clinical priorities */}
      {generatedAttentionItems.length > 0 && (
        <AttentionPanel
          title="Clinical Attention"
          description="Patients requiring priority review or action"
          items={generatedAttentionItems}
          className="mb-6"
        />
      )}

      {/* Main Workspace - Two Column */}
      <WorkspaceTwoColumnLayout
        ratio="60-40"
        main={
          <div className="space-y-4">
            <WorkspaceSectionHeader
              title="Patient Queue"
              description="Select a patient to open their clinical workspace"
            />

            <Card>
              <CardHeader className="border-b py-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Waiting Patients</CardTitle>
                  <Badge variant="secondary">{queueRows.length}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 py-4">
                {queueRows.length === 0 ? (
                  <WorkspaceEmptyState
                    variant="queue"
                    title="Queue is clear"
                    description="No patients are currently waiting. The queue will update automatically as patients check in at the front desk."
                  />
                ) : (
                  <>
                    {buckets.urgent.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Priority / New
                        </p>
                        {buckets.urgent.map((row) => (
                          <CompactQueueCard
                            key={row.appointment_id}
                            row={row}
                            hospitalSlug={hospital.slug}
                            isSelected={selectedPatientId === row.patient_id}
                            onSelect={() => setSelectedPatientId(row.patient_id)}
                          />
                        ))}
                      </div>
                    )}

                    {buckets.waiting.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          In Progress
                        </p>
                        {buckets.waiting.map((row) => (
                          <CompactQueueCard
                            key={row.appointment_id}
                            row={row}
                            hospitalSlug={hospital.slug}
                            isSelected={selectedPatientId === row.patient_id}
                            onSelect={() => setSelectedPatientId(row.patient_id)}
                          />
                        ))}
                      </div>
                    )}

                    {buckets.completed.length > 0 && (
                      <div className="space-y-2 pt-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Recently Completed
                        </p>
                        {buckets.completed.map((row) => (
                          <CompactQueueCard
                            key={row.appointment_id}
                            row={row}
                            hospitalSlug={hospital.slug}
                            isSelected={selectedPatientId === row.patient_id}
                            onSelect={() => setSelectedPatientId(row.patient_id)}
                          />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>

            <Button asChild variant="outline" className="w-full">
              <Link href={`/h/${hospital.slug}/encounters`}>
                View All Encounters
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        }
        side={
          <div className="space-y-6">
            {selectedPatient ? (
              <ActivePatientWorkspace row={selectedPatient} hospital={hospital} />
            ) : (
              <WorkspaceEmptyState
                variant="default"
                title="Select a patient to begin"
                description="Choose a patient from the queue on the left to open their clinical workspace. You'll be able to manage their encounter, labs, and prescriptions from here."
                action={
                  <>
                    <Button asChild variant="outline">
                      <Link href={`/h/${hospital.slug}/patients`}>Find Patient</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link href={`/h/${hospital.slug}/doctor/rounds`}>Go to Rounds</Link>
                    </Button>
                  </>
                }
                className="h-full min-h-[400px]"
              />
            )}

            {/* Recent Clinical Activity */}
            <ActivityFeed
              title="Recent Completions"
              description="Recently finalized encounters"
              items={generatedActivity}
              compact
              emptyMessage="No recent completions"
              emptyDescription="Completed encounters will appear here"
            />
          </div>
        }
      />
    </WorkspacePageShell>
  );
}

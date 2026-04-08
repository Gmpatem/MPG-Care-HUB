import Link from "next/link";

import { StatusBadge } from "@/components/layout/status-badge";
import { TaskReadinessRow } from "@/components/layout/task-readiness-summary";
import { WorkspaceEmptyState } from "@/components/layout/workspace-empty-state";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DoctorQueueRow, EncounterStage } from "@/features/doctor-workflow/types";
import { getEncounterStageReadiness } from "@/lib/ui/task-state";

function formatDateTime(value: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function getFullName(row: DoctorQueueRow) {
  return [row.first_name, row.middle_name, row.last_name].filter(Boolean).join(" ");
}

function appointmentTone(status: string | null) {
  switch (status) {
    case "checked_in":
      return "info" as const;
    case "completed":
      return "success" as const;
    case "cancelled":
      return "danger" as const;
    default:
      return "neutral" as const;
  }
}

function encounterTone(status: string | null) {
  switch (status) {
    case "finalized":
      return "success" as const;
    case "cancelled":
      return "danger" as const;
    case "draft":
      return "neutral" as const;
    default:
      return "neutral" as const;
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
      return "Continue Admission Case";
    case "completed":
      return "Review Encounter";
    default:
      return "Continue Encounter";
  }
}

function EncounterStageBadge({ 
  stage, 
  hasEncounter 
}: { 
  stage: EncounterStage | null; 
  hasEncounter: boolean;
}) {
  const signal = getEncounterStageReadiness(stage, hasEncounter);
  return <TaskReadinessRow signal={signal} />;
}

function sectionTitle(section: string) {
  switch (section) {
    case "new":
      return "New Consultations";
    case "awaiting":
      return "Awaiting Lab Results";
    case "decision":
      return "Ready for Final Decision";
    case "admission":
      return "Admission Requested";
    case "completed":
      return "Completed Today";
    default:
      return "Doctor Queue";
  }
}

function sectionDescription(section: string) {
  switch (section) {
    case "new":
      return "Patients needing first doctor review.";
    case "awaiting":
      return "Cases still waiting on investigation results.";
    case "decision":
      return "Results are back and ready for doctor action.";
    case "admission":
      return "Cases moving into inpatient workflow.";
    case "completed":
      return "Finished or finalized clinical work.";
    default:
      return "Clinical worklist for the day.";
  }
}

function bucketRows(rows: DoctorQueueRow[]) {
  return {
    new: rows.filter((row) => !row.encounter_id || row.encounter_stage === "initial_review"),
    awaiting: rows.filter((row) => row.encounter_stage === "awaiting_results"),
    decision: rows.filter((row) => row.encounter_stage === "results_review"),
    admission: rows.filter((row) => row.encounter_stage === "admission_requested"),
    completed: rows.filter((row) => row.encounter_stage === "completed" || row.encounter_status === "finalized"),
  };
}

function QueueItem({
  hospitalSlug,
  row,
}: {
  hospitalSlug: string;
  row: DoctorQueueRow;
}) {
  const badges = [];
  if (row.requires_lab) {
    badges.push({ label: "lab needed", tone: "warning" as const });
  }
  if (row.disposition_type) {
    badges.push({ label: row.disposition_type.replaceAll("_", " "), tone: "neutral" as const });
  }

  const statusBadges = [];
  if (row.appointment_status) {
    statusBadges.push(
      <StatusBadge
        key="appt"
        label={row.appointment_status}
        tone={appointmentTone(row.appointment_status)}
        className="px-2.5 py-1 capitalize font-medium"
      />
    );
  }
  if (row.encounter_status) {
    statusBadges.push(
      <StatusBadge
        key="enc"
        label={row.encounter_status}
        tone={encounterTone(row.encounter_status)}
        className="px-2.5 py-1 capitalize font-medium"
      />
    );
  }

  return (
    <div className="rounded-2xl border border-border/70 bg-background p-4 shadow-[0_8px_24px_rgba(15,23,42,0.03)]">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          {/* Header: Name + Statuses */}
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-foreground">
              {getFullName(row) || "Unknown patient"}
            </h3>
            {statusBadges}
            <EncounterStageBadge 
              stage={row.encounter_stage} 
              hasEncounter={!!row.encounter_id} 
            />
            {badges.map((badge, index) => (
              <StatusBadge
                key={index}
                label={badge.label}
                tone={badge.tone}
                className="px-2.5 py-1 capitalize font-medium"
              />
            ))}
          </div>

          {/* Primary Meta */}
          <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
            <p>{row.patient_number ?? "No patient number"} · {row.visit_type ?? "outpatient"}</p>
            <p>Assigned: {row.assigned_staff_name ?? "Unassigned"}</p>
            <p>Scheduled: {formatDateTime(row.scheduled_at)}</p>
            <p>Checked in: {formatDateTime(row.check_in_at)}</p>
          </div>

          {/* Secondary Meta - Always visible but styled differently */}
          <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
            <p>Queue: {row.queue_number ?? "—"}</p>
            <p>Chief complaint: {row.chief_complaint ?? "—"}</p>
            <p>Results reviewed: {formatDateTime(row.results_reviewed_at)}</p>
            <p>Final decision: {formatDateTime(row.final_decision_at)}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href={`/h/${hospitalSlug}/doctor/patients/${row.patient_id}`}>
              View Patient
            </Link>
          </Button>

          <Button asChild variant="outline" size="sm">
            <Link href={`/h/${hospitalSlug}/encounters`}>
              Encounters
            </Link>
          </Button>

          <Button asChild size="sm">
            <Link href={`/h/${hospitalSlug}/doctor/appointments/${row.appointment_id}/open`}>
              {actionLabel(row)}
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

function QueueSection({
  hospitalSlug,
  section,
  rows,
}: {
  hospitalSlug: string;
  section: string;
  rows: DoctorQueueRow[];
}) {
  if (rows.length === 0) return null;

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">{sectionTitle(section)}</h2>
        <p className="text-sm text-muted-foreground">{sectionDescription(section)}</p>
      </div>

      <div className="space-y-4">
        {rows.map((row) => (
          <QueueItem
            key={row.appointment_id}
            hospitalSlug={hospitalSlug}
            row={row}
          />
        ))}
      </div>
    </div>
  );
}

export function DoctorQueueList({
  hospitalSlug,
  rows,
}: {
  hospitalSlug: string;
  rows: DoctorQueueRow[];
}) {
  const buckets = bucketRows(rows);

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Doctor Worklist</CardTitle>
        <CardDescription>
          Clinical cases grouped by stage so doctors can move through care with less context switching.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-8 py-5">
        {rows.length === 0 ? (
          <WorkspaceEmptyState
            title="No patients in the doctor worklist right now"
            description="Checked-in visits and active clinical cases will appear here automatically as they move into doctor review."
          />
        ) : (
          <>
            <QueueSection hospitalSlug={hospitalSlug} section="new" rows={buckets.new} />
            <QueueSection hospitalSlug={hospitalSlug} section="awaiting" rows={buckets.awaiting} />
            <QueueSection hospitalSlug={hospitalSlug} section="decision" rows={buckets.decision} />
            <QueueSection hospitalSlug={hospitalSlug} section="admission" rows={buckets.admission} />
            <QueueSection hospitalSlug={hospitalSlug} section="completed" rows={buckets.completed} />
          </>
        )}
      </CardContent>
    </Card>
  );
}

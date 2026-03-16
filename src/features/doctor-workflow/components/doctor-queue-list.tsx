import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DoctorQueueRow, EncounterStage } from "@/features/doctor-workflow/types";

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

function appointmentVariant(status: string | null): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "checked_in":
      return "default";
    case "completed":
      return "secondary";
    case "cancelled":
      return "destructive";
    default:
      return "outline";
  }
}

function encounterVariant(status: string | null): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "draft":
      return "outline";
    case "finalized":
      return "secondary";
    case "cancelled":
      return "destructive";
    default:
      return "outline";
  }
}

function stageLabel(stage: EncounterStage | null, encounterId: string | null) {
  if (!encounterId || !stage) return "new consultation";

  switch (stage) {
    case "initial_review":
      return "initial review";
    case "awaiting_results":
      return "awaiting results";
    case "results_review":
      return "results review";
    case "treatment_decided":
      return "treatment decided";
    case "admission_requested":
      return "admission requested";
    case "completed":
      return "completed";
    default:
      return "initial review";
  }
}

function stageVariant(stage: EncounterStage | null, encounterId: string | null): "default" | "secondary" | "destructive" | "outline" {
  if (!encounterId || !stage) return "default";

  switch (stage) {
    case "initial_review":
      return "default";
    case "awaiting_results":
      return "outline";
    case "results_review":
      return "secondary";
    case "admission_requested":
      return "destructive";
    case "treatment_decided":
      return "secondary";
    case "completed":
      return "secondary";
    default:
      return "outline";
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

function sectionTitle(section: string) {
  switch (section) {
    case "new":
      return "New Consultations";
    case "awaiting":
      return "Awaiting Lab Results";
    case "decision":
      return "Ready For Final Decision";
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
      return "Patients needing initial doctor review.";
    case "awaiting":
      return "Open cases waiting on investigations.";
    case "decision":
      return "Results available, waiting on final doctor decision.";
    case "admission":
      return "Patients moving into inpatient flow.";
    case "completed":
      return "Finished or finalized cases.";
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
        <h2 className="text-lg font-semibold">{sectionTitle(section)}</h2>
        <p className="text-sm text-muted-foreground">{sectionDescription(section)}</p>
      </div>

      <div className="space-y-4">
        {rows.map((row) => (
          <div key={row.appointment_id} className="rounded-lg border p-4">
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="text-lg font-semibold">
                    {getFullName(row) || "Unknown patient"}
                  </h3>

                  <Badge variant={appointmentVariant(row.appointment_status)} className="capitalize">
                    {row.appointment_status ?? "scheduled"}
                  </Badge>

                  {row.encounter_status ? (
                    <Badge variant={encounterVariant(row.encounter_status)} className="capitalize">
                      {row.encounter_status}
                    </Badge>
                  ) : null}

                  <Badge variant={stageVariant(row.encounter_stage, row.encounter_id)} className="capitalize">
                    {stageLabel(row.encounter_stage, row.encounter_id)}
                  </Badge>

                  {row.requires_lab ? <Badge variant="outline">Lab Needed</Badge> : null}
                  {row.disposition_type ? <Badge variant="outline" className="capitalize">{row.disposition_type.replaceAll("_", " ")}</Badge> : null}
                </div>

                <div className="grid gap-1 text-sm text-muted-foreground">
                  <p>
                    {row.patient_number ?? "No patient number"} · {row.visit_type ?? "outpatient"}
                  </p>
                  <p>Assigned: {row.assigned_staff_name ?? "Unassigned"}</p>
                  <p>Scheduled: {formatDateTime(row.scheduled_at)}</p>
                  <p>Checked In: {formatDateTime(row.check_in_at)}</p>
                  <p>Queue: {row.queue_number ?? "—"}</p>
                  <p>Chief Complaint: {row.chief_complaint ?? "—"}</p>
                  <p>Results Reviewed: {formatDateTime(row.results_reviewed_at)}</p>
                  <p>Final Decision: {formatDateTime(row.final_decision_at)}</p>
                </div>
              </div>

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
          Clinical cases grouped by stage so doctors can move through care efficiently.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-8 py-5">
        {rows.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
            No patients in the doctor worklist right now.
          </div>
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
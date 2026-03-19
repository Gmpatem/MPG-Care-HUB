import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  finalizeEncounterWorkflow,
  markEncounterAdmissionRequested,
  markEncounterAwaitingResults,
  markEncounterResultsReview,
  markEncounterTreatmentDecided,
} from "@/features/encounters/actions/update-encounter-workflow";
import { Button } from "@/components/ui/button";
import { getEncounterLabResults } from "@/features/lab/server/get-encounter-lab-results";
import { EncounterLabResultsPanel } from "@/features/lab/components/encounter-lab-results-panel";
import { EncounterWorkflowButtons } from "@/features/encounters/components/encounter-workflow-buttons";

type PageProps = {
  params: Promise<{
    hospitalSlug: string;
    encounterId: string;
  }>;
};

function stageLabel(stage: string | null) {
  if (!stage) return "initial review";
  return stage.replaceAll("_", " ");
}

function dispositionLabel(disposition: string | null) {
  if (!disposition) return "—";
  return disposition.replaceAll("_", " ");
}

function stageTone(stage: string | null) {
  switch (stage) {
    case "awaiting_results":
      return "border-amber-200 bg-amber-50 text-amber-900";
    case "results_review":
      return "border-blue-200 bg-blue-50 text-blue-900";
    case "treatment_decided":
      return "border-emerald-200 bg-emerald-50 text-emerald-900";
    case "admission_requested":
      return "border-rose-200 bg-rose-50 text-rose-900";
    case "completed":
      return "border-slate-200 bg-slate-50 text-slate-900";
    default:
      return "border-slate-200 bg-slate-50 text-slate-900";
  }
}

function nextStepTitle(stage: string | null) {
  switch (stage) {
    case "awaiting_results":
      return "Next Best Action: Review Results";
    case "results_review":
      return "Next Best Action: Make Final Decision";
    case "treatment_decided":
      return "Next Best Action: Finalize Encounter";
    case "admission_requested":
      return "Next Best Action: Complete Admission Handoff";
    case "completed":
      return "Encounter Completed";
    default:
      return "Next Best Action: Continue Initial Review";
  }
}

function nextStepDescription(stage: string | null, requiresLab: boolean, admissionRequested: boolean) {
  switch (stage) {
    case "awaiting_results":
      return "This case is waiting on investigations. Review the results when available and move the case into results review.";
    case "results_review":
      return "Results are ready to review. Decide whether this patient should receive treatment, follow-up, referral, or admission.";
    case "treatment_decided":
      return "The treatment plan has been decided. Confirm linked actions like prescription and finalize the encounter.";
    case "admission_requested":
      return "Admission has been requested. Complete the ward handoff and finalize the encounter when ready.";
    case "completed":
      return "This encounter has already been completed. Use the linked actions below to review the case.";
    default:
      if (requiresLab) {
        return "Initial review is still active and this case likely needs investigations. Move it to awaiting results after lab ordering.";
      }

      if (admissionRequested) {
        return "Initial review is active and admission is already flagged. Continue into admission handling.";
      }

      return "Use this page to finish the first clinical review, decide whether labs are needed, and move the case forward.";
    }
}

export default async function EncounterDetailPage({ params }: PageProps) {
  const { hospitalSlug, encounterId } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: hospital } = await supabase
    .from("hospitals")
    .select("id, name, slug")
    .eq("slug", hospitalSlug)
    .maybeSingle();

  if (!hospital) notFound();

  const { data: encounter, error } = await supabase
    .from("encounters")
    .select(`
      id,
      encounter_datetime,
      status,
      stage,
      requires_lab,
      disposition_type,
      results_reviewed_at,
      final_decision_at,
      chief_complaint,
      history_notes,
      assessment_notes,
      plan_notes,
      final_notes,
      diagnosis_text,
      vitals_json,
      appointment_id,
      admission_requested,
      started_at,
      finalized_at,
      created_at,
      patients (
        id,
        patient_number,
        first_name,
        last_name
      )
    `)
    .eq("id", encounterId)
    .eq("hospital_id", hospital.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!encounter) notFound();

  const patient = Array.isArray(encounter.patients)
    ? encounter.patients[0]
    : encounter.patients;

  const vitals = (encounter.vitals_json ?? {}) as Record<string, string | number | null>;
  const labOrders = await getEncounterLabResults(hospital.slug, encounter.id);

  const markAwaitingResultsAction = markEncounterAwaitingResults.bind(null, hospital.slug, encounter.id);
  const markResultsReviewAction = markEncounterResultsReview.bind(null, hospital.slug, encounter.id);
  const markTreatmentAction = markEncounterTreatmentDecided.bind(null, hospital.slug, encounter.id);
  const markAdmissionAction = markEncounterAdmissionRequested.bind(null, hospital.slug, encounter.id);
  const finalizeAction = finalizeEncounterWorkflow.bind(null, hospital.slug, encounter.id);

  const stage = encounter.stage ?? "initial_review";
  const isCompleted = encounter.status === "finalized" || stage === "completed";

  return (
    <main className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Encounter Detail</p>
          <h1 className="text-3xl font-bold">
            {patient
              ? `${patient.last_name}, ${patient.first_name}`
              : "Unknown patient"}
          </h1>
          <p className="text-muted-foreground">
            Encounter Date: {new Date(encounter.encounter_datetime).toLocaleString()}
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href={`/h/${hospital.slug}/encounters`}>Back to Encounters</Link>
        </Button>
      </div>

      <div className={`rounded-xl border p-6 ${stageTone(stage)}`}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-2">
            <h2 className="text-xl font-semibold">{nextStepTitle(stage)}</h2>
            <p className="max-w-3xl text-sm">
              {nextStepDescription(stage, Boolean(encounter.requires_lab), Boolean(encounter.admission_requested))}
            </p>
          </div>

          <EncounterWorkflowButtons
            stage={stage}
            isCompleted={isCompleted}
            markAwaitingResultsAction={markAwaitingResultsAction}
            markResultsReviewAction={markResultsReviewAction}
            markTreatmentAction={markTreatmentAction}
            markAdmissionAction={markAdmissionAction}
            finalizeAction={finalizeAction}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
        <div className="space-y-4 rounded-xl border p-6">
          <h2 className="text-xl font-semibold">Patient Snapshot</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Patient:</span> {patient ? `${patient.patient_number} - ${patient.last_name}, ${patient.first_name}` : "-"}</p>
            <p><span className="font-medium">Status:</span> {encounter.status}</p>
            <p><span className="font-medium">Stage:</span> <span className="capitalize">{stageLabel(encounter.stage)}</span></p>
            <p><span className="font-medium">Disposition:</span> <span className="capitalize">{dispositionLabel(encounter.disposition_type)}</span></p>
            <p><span className="font-medium">Requires Lab:</span> {encounter.requires_lab ? "Yes" : "No"}</p>
            <p><span className="font-medium">Admission Requested:</span> {encounter.admission_requested ? "Yes" : "No"}</p>
            <p><span className="font-medium">Results Reviewed:</span> {encounter.results_reviewed_at ? new Date(encounter.results_reviewed_at).toLocaleString() : "-"}</p>
            <p><span className="font-medium">Final Decision:</span> {encounter.final_decision_at ? new Date(encounter.final_decision_at).toLocaleString() : "-"}</p>
            <p><span className="font-medium">Linked Appointment:</span> {encounter.appointment_id ?? "-"}</p>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border p-6">
          <h2 className="text-xl font-semibold">Latest Vitals Snapshot</h2>
          <div className="grid gap-2 text-sm md:grid-cols-2">
            <p><span className="font-medium">Temperature:</span> {String(vitals.temperature_c ?? vitals.temperature ?? "-")}</p>
            <p>
              <span className="font-medium">Blood Pressure:</span>{" "}
              {vitals.blood_pressure
                ? String(vitals.blood_pressure)
                : `${String(vitals.blood_pressure_systolic ?? "-")} / ${String(vitals.blood_pressure_diastolic ?? "-")}`}
            </p>
            <p><span className="font-medium">Pulse Rate:</span> {String(vitals.pulse_bpm ?? vitals.pulse_rate ?? "-")}</p>
            <p><span className="font-medium">Respiratory Rate:</span> {String(vitals.respiratory_rate ?? "-")}</p>
            <p><span className="font-medium">Oxygen Saturation:</span> {String(vitals.spo2 ?? vitals.oxygen_saturation ?? "-")}</p>
            <p><span className="font-medium">Weight:</span> {String(vitals.weight_kg ?? "-")}</p>
            <p><span className="font-medium">Height:</span> {String(vitals.height_cm ?? "-")}</p>
            <p><span className="font-medium">Pain Score:</span> {String(vitals.pain_score ?? "-")}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border p-6">
        <h2 className="text-xl font-semibold">Linked Clinical Actions</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Use the actions below based on the current stage of this case.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">
          {(stage === "initial_review" || stage === "awaiting_results") ? (
            <Button asChild variant="outline">
              <Link href={`/h/${hospital.slug}/doctor/patients/${patient?.id}/labs/new`}>Order Lab</Link>
            </Button>
          ) : null}

          {(stage === "results_review" || stage === "treatment_decided" || stage === "completed") ? (
            <Button asChild variant="outline">
              <Link href={`/h/${hospital.slug}/doctor/patients/${patient?.id}/prescriptions/new`}>Prescribe</Link>
            </Button>
          ) : null}

          {(stage === "admission_requested" || encounter.admission_requested) ? (
            <Button asChild variant="outline">
              <Link href={`/h/${hospital.slug}/ward/admissions`}>Ward Admission Intake</Link>
            </Button>
          ) : null}

          {(stage === "completed" || encounter.admission_requested) ? (
            <Button asChild variant="outline">
              <Link href={`/h/${hospital.slug}/doctor/rounds`}>Doctor Rounds</Link>
            </Button>
          ) : null}

          <Button asChild variant="outline">
            <Link href={`/h/${hospital.slug}/ward/discharges`}>Ward Discharges</Link>
          </Button>

          <Button asChild variant="outline">
            <Link href={`/h/${hospital.slug}/doctor/patients/${patient?.id}`}>Doctor Workspace</Link>
          </Button>
        </div>
      </div>

      <EncounterLabResultsPanel
        hospitalSlug={hospital.slug}
        patientId={patient?.id ?? ""}
        encounterId={encounter.id}
        labOrders={labOrders}
      />

      <div className="grid gap-6">
        <div className="rounded-xl border p-6">
          <h2 className="text-xl font-semibold">Chief Complaint</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
            {encounter.chief_complaint ?? "No chief complaint."}
          </p>
        </div>

        <div className="rounded-xl border p-6">
          <h2 className="text-xl font-semibold">History Notes</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
            {encounter.history_notes ?? "No history notes."}
          </p>
        </div>

        <div className="rounded-xl border p-6">
          <h2 className="text-xl font-semibold">Assessment Notes</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
            {encounter.assessment_notes ?? "No assessment notes."}
          </p>
        </div>

        <div className="rounded-xl border p-6">
          <h2 className="text-xl font-semibold">Working Diagnosis</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
            {encounter.diagnosis_text ?? "No working diagnosis."}
          </p>
        </div>

        <div className="rounded-xl border p-6">
          <h2 className="text-xl font-semibold">Plan Notes</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
            {encounter.plan_notes ?? "No plan notes."}
          </p>
        </div>

        <div className="rounded-xl border p-6">
          <h2 className="text-xl font-semibold">Final Clinical Notes</h2>
          <p className="mt-3 whitespace-pre-wrap text-sm text-muted-foreground">
            {encounter.final_notes ?? "No final clinical notes yet."}
          </p>
        </div>
      </div>
    </main>
  );
}

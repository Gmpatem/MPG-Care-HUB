import Link from "next/link";
import { BedDouble, ClipboardCheck, FileClock, UserRound, History } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WorkspacePageHeader } from "@/components/layout/workspace-page-header";
import { WorkspaceSectionHeader } from "@/components/layout/workspace-section-header";
import { WorkspaceStatCard } from "@/components/layout/workspace-stat-card";
import { WorkflowStepCard } from "@/components/layout/workflow-step-card";
import { InfoGrid } from "@/components/layout/info-grid";
import { TimelineSection, type TimelineEvent } from "@/components/layout/timeline-feed";
import { DischargeChecklistPanel } from "@/features/ward/components/discharge-checklist-panel";
import { OpenAdmissionActivityButton } from "@/features/ward/components/open-admission-activity-button";
import { BillingSummaryCard } from "@/features/billing/components/billing-summary-card";
import {
  SharedPatientContext,
  fullName,
  formatDateTime,
} from "@/components/layout/shared-patient-context";
import { RelatedActionsSection } from "@/components/layout/related-workspace-actions";
import { PatientJourneyStrip } from "@/components/layout/patient-journey-strip";

function generateAdmissionTimeline(
  admission: {
    id: string;
    admitted_at: string;
    discharge_requested: boolean;
    discharge_requested_at: string | null;
    admission_reason: string | null;
    patient: {
      patient_number: string | null;
      first_name: string;
      middle_name: string | null;
      last_name: string;
      sex: string | null;
      phone: string | null;
    } | null;
    ward: {
      name: string;
      code: string | null;
      ward_type: string | null;
    } | null;
    bed: {
      bed_number: string;
      status: string | null;
    } | null;
    admitting_doctor: {
      full_name: string;
      specialty: string | null;
    } | null;
  },
  checklist: {
    items: Array<{
      key: string;
      label: string;
      required: boolean;
      completed: boolean;
      notes: string | null;
    }>;
    summary: {
      total: number;
      completed: number;
      required_total: number;
      required_completed: number;
      ready: boolean;
    };
  }
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  // Admission event
  events.push({
    id: `admission-${admission.id}`,
    type: "admission",
    title: "Patient admitted",
    description: admission.admission_reason ?? undefined,
    actor: admission.admitting_doctor
      ? {
          name: admission.admitting_doctor.full_name,
          role: admission.admitting_doctor.specialty ?? "Physician",
        }
      : undefined,
    timestamp: admission.admitted_at,
    details: [
      { label: "Ward", value: admission.ward?.name ?? "Unknown" },
      { label: "Bed", value: admission.bed?.bed_number ?? "Unassigned" },
      { label: "Ward Type", value: admission.ward?.ward_type ?? "—" },
    ],
  });

  // Discharge requested event
  if (admission.discharge_requested && admission.discharge_requested_at) {
    events.push({
      id: `discharge-request-${admission.id}`,
      type: "discharge",
      title: "Discharge requested",
      description: "Doctor has requested patient discharge",
      actor: admission.admitting_doctor
        ? {
            name: admission.admitting_doctor.full_name,
            role: "Attending Physician",
          }
        : undefined,
      timestamp: admission.discharge_requested_at,
      status: checklist.summary.ready
        ? { label: "Ready", tone: "success" }
        : { label: "Pending clearance", tone: "warning" },
    });
  }

  return events;
}

export function WardAdmissionDetailPage({
  hospitalSlug,
  admission,
  checklist,
  billing,
}: {
  hospitalSlug: string;
  admission: {
    id: string;
    admitted_at: string;
    discharge_requested: boolean;
    discharge_requested_at: string | null;
    admission_reason: string | null;
    discharge_notes: string | null;
    patient: {
      patient_number: string | null;
      first_name: string;
      middle_name: string | null;
      last_name: string;
      sex: string | null;
      phone: string | null;
    } | null;
    ward: {
      name: string;
      code: string | null;
      ward_type: string | null;
    } | null;
    bed: {
      bed_number: string;
      status: string | null;
    } | null;
    admitting_doctor: {
      full_name: string;
      specialty: string | null;
    } | null;
  };
  checklist: {
    items: Array<{
      key: string;
      label: string;
      required: boolean;
      completed: boolean;
      notes: string | null;
    }>;
    summary: {
      total: number;
      completed: number;
      required_total: number;
      required_completed: number;
      ready: boolean;
    };
  };
  billing: {
    invoiceCount: number;
    totalAmount: number;
    amountPaid: number;
    balanceDue: number;
    cleared: boolean;
  };
}) {
  const timelineEvents = generateAdmissionTimeline(admission, checklist);

  return (
    <main className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Ward Admission Chart"
        title={fullName(admission.patient)}
        description="Review the inpatient chart, monitor discharge readiness, and confirm billing and checklist completion before final discharge."
        actions={
          <>
            <Button asChild>
              <Link href={`/h/${hospitalSlug}/ward`}>Back to Ward</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/ward/discharges`}>Discharge Queue</Link>
            </Button>
            <OpenAdmissionActivityButton
              hospitalSlug={hospitalSlug}
              admissionId={admission.id}
              variant="outline"
              size="default"
            />
          </>
        }
      />

      {/* Patient Journey Context */}
      <PatientJourneyStrip
        hospitalSlug={hospitalSlug}
        stages={[
          { stage: "intake", status: "complete" },
          { stage: "checkin", status: "complete" },
          { stage: "doctor", status: "complete" },
          { stage: "lab", status: "optional" },
          { stage: "pharmacy", status: "optional" },
          { stage: "admission", status: "complete" },
          { stage: "inpatient", status: admission.discharge_requested ? "complete" : "active" },
          { stage: "billing", status: billing.cleared ? "complete" : "waiting" },
          { stage: "discharge", status: checklist.summary.ready && billing.cleared ? "waiting" : "blocked" },
        ]}
        currentInterpretation={admission.discharge_requested
          ? checklist.summary.ready && billing.cleared
            ? "Patient cleared for discharge."
            : checklist.summary.ready
              ? "Discharge checklist complete. Awaiting billing clearance."
              : billing.cleared
                ? "Billing cleared. Awaiting discharge checklist completion."
                : "Discharge requested. Checklist and billing still pending."
          : "Patient admitted and under inpatient care."
        }
        nextStep={admission.discharge_requested
          ? checklist.summary.ready && billing.cleared
            ? "Complete final discharge documentation."
            : "Complete remaining checklist items and process any outstanding payments."
          : "Continue inpatient care and monitoring."
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WorkspaceStatCard
          title="Ward"
          value={admission.ward?.name ?? "—"}
          description={`Code: ${admission.ward?.code ?? "—"}`}
          icon={<BedDouble className="h-4 w-4" />}
          valueClassName="text-xl"
        />
        <WorkspaceStatCard
          title="Bed"
          value={admission.bed?.bed_number ?? "Unassigned"}
          description={`Bed status: ${admission.bed?.status ?? "—"}`}
          icon={<UserRound className="h-4 w-4" />}
          valueClassName="text-xl"
        />
        <WorkspaceStatCard
          title="Discharge Requested"
          value={admission.discharge_requested ? "Yes" : "No"}
          description={admission.discharge_requested_at ? `Requested: ${formatDateTime(admission.discharge_requested_at)}` : "Not yet requested"}
          icon={<ClipboardCheck className="h-4 w-4" />}
          valueClassName="text-xl"
        />
        <WorkspaceStatCard
          title="Checklist Progress"
          value={`${checklist.summary.completed}/${checklist.summary.total}`}
          description={checklist.summary.ready ? "Ready for discharge flow" : "Still incomplete"}
          icon={<FileClock className="h-4 w-4" />}
          valueClassName="text-xl"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.2fr_.95fr]">
        <div className="space-y-6">
          {/* Shared Patient Context */}
          <SharedPatientContext
            hospitalSlug={hospitalSlug}
            patient={admission.patient}
            admission={admission}
            showRelatedLinks={true}
            primaryItems={[
              { label: "Sex", value: admission.patient?.sex },
              { label: "Phone", value: admission.patient?.phone },
              { label: "Admitted At", value: formatDateTime(admission.admitted_at) },
              { label: "Ward Type", value: admission.ward?.ward_type },
            ]}
            secondaryItems={[
              { label: "Doctor", value: admission.admitting_doctor?.full_name ?? "Unknown" },
              { label: "Specialty", value: admission.admitting_doctor?.specialty },
              { label: "Ward Code", value: admission.ward?.code },
              { label: "Bed Status", value: admission.bed?.status },
            ]}
          />

          {/* Admission Timeline */}
          <TimelineSection
            title="Admission Timeline"
            description="Chronological history of admission events"
            events={timelineEvents}
            viewAllHref={`/h/${hospitalSlug}/ward/admissions/${admission.id}/activity`}
            viewAllLabel="View full activity"
          />

          {/* Related Actions */}
          <RelatedActionsSection
            hospitalSlug={hospitalSlug}
            patientId={admission.patient?.patient_number ?? undefined}
            admissionId={admission.id}
            currentWorkspace="ward"
            title="Continue Care"
          />

          <section className="surface-panel p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Admission Notes"
              description="Core admission context before discharge handling."
            />

            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Admission Reason
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground">
                  {admission.admission_reason ?? "—"}
                </p>
              </div>

              <div className="rounded-2xl border border-border/70 bg-background/70 p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  Discharge Notes
                </p>
                <p className="mt-2 text-sm leading-6 text-foreground">
                  {admission.discharge_notes ?? "—"}
                </p>
              </div>
            </div>
          </section>

          <DischargeChecklistPanel
            hospitalSlug={hospitalSlug}
            admissionId={admission.id}
            items={checklist.items}
            summary={checklist.summary}
          />
        </div>

        <div className="space-y-6">
          <RelatedActionsSection
            hospitalSlug={hospitalSlug}
            patientId={admission.patient?.patient_number ?? undefined}
            admissionId={admission.id}
            currentWorkspace="ward"
            title="Related Workspaces"
          />

          <BillingSummaryCard
            invoiceCount={billing.invoiceCount}
            totalAmount={billing.totalAmount}
            amountPaid={billing.amountPaid}
            balanceDue={billing.balanceDue}
            cleared={billing.cleared}
          />

          <section className="surface-panel p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Chart Snapshot"
              description="Quick admission context"
            />

            <div className="mt-4">
              <InfoGrid
                items={[
                  { label: "Discharge Requested At", value: formatDateTime(admission.discharge_requested_at) },
                  { label: "Required Checklist", value: `${checklist.summary.required_completed}/${checklist.summary.required_total}` },
                  { label: "Checklist Ready", value: checklist.summary.ready ? "Yes" : "No" },
                  { label: "Billing Cleared", value: billing.cleared ? "Yes" : "No" },
                ]}
              />
            </div>
          </section>

          <section className="surface-panel p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Ward Flow"
              description="Safe discharge preparation routine"
            />

            <div className="mt-4 space-y-3">
              <WorkflowStepCard
                step="Step 1"
                title="Review chart context"
                description="Confirm the patient, doctor, ward, bed, and admission reason before discharge work begins."
              />

              <WorkflowStepCard
                step="Step 2"
                title="Complete the checklist"
                description="Work through discharge requirements item by item so blockers remain visible."
              />

              <WorkflowStepCard
                step="Step 3"
                title="Confirm billing clearance"
                description="Use billing status together with checklist readiness before final discharge handling."
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

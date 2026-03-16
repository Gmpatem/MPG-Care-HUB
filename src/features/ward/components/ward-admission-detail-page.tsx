import Link from "next/link";
import { BedDouble, ClipboardCheck, FileClock, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WorkspacePageHeader } from "@/components/layout/workspace-page-header";
import { WorkspaceSectionHeader } from "@/components/layout/workspace-section-header";
import { WorkspaceStatCard } from "@/components/layout/workspace-stat-card";
import { DischargeChecklistPanel } from "@/features/ward/components/discharge-checklist-panel";
import { OpenAdmissionActivityButton } from "@/features/ward/components/open-admission-activity-button";
import { BillingSummaryCard } from "@/features/billing/components/billing-summary-card";

function fullName(patient: {
  first_name: string;
  middle_name: string | null;
  last_name: string;
} | null) {
  if (!patient) return "Unknown patient";
  return [patient.first_name, patient.middle_name, patient.last_name].filter(Boolean).join(" ");
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
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
          <section className="rounded-2xl border p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Admission Summary"
              description="Core ward placement and patient identity"
            />

            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                <p className="font-medium text-foreground">{fullName(admission.patient)}</p>
                <p className="mt-1">{admission.patient?.patient_number ?? "No patient number"}</p>
                <p className="mt-1">Sex: {admission.patient?.sex ?? "—"}</p>
                <p className="mt-1">Phone: {admission.patient?.phone ?? "—"}</p>
              </div>

              <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
                <p>Admitted at: {formatDateTime(admission.admitted_at)}</p>
                <p className="mt-1">Doctor: {admission.admitting_doctor?.full_name ?? "Unknown"}</p>
                <p className="mt-1">Specialty: {admission.admitting_doctor?.specialty ?? "—"}</p>
                <p className="mt-1">Ward type: {admission.ward?.ward_type ?? "—"}</p>
              </div>
            </div>

            <div className="mt-4 rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Admission Reason</p>
              <p className="mt-1">{admission.admission_reason ?? "—"}</p>
            </div>

            <div className="mt-4 rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground">Discharge Notes</p>
              <p className="mt-1">{admission.discharge_notes ?? "—"}</p>
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
          <BillingSummaryCard
            invoiceCount={billing.invoiceCount}
            totalAmount={billing.totalAmount}
            amountPaid={billing.amountPaid}
            balanceDue={billing.balanceDue}
            cleared={billing.cleared}
          />

          <section className="rounded-2xl border p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Ward Flow"
              description="Safe discharge preparation routine"
            />

            <div className="mt-4 space-y-3">
              <div className="rounded-xl border bg-muted/40 p-4">
                <p className="text-sm font-medium">Step 1: Review chart context</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Confirm the patient, doctor, ward, bed, and admission reason before discharge work begins.
                </p>
              </div>

              <div className="rounded-xl border bg-muted/40 p-4">
                <p className="text-sm font-medium">Step 2: Complete the checklist</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Work through discharge requirements item by item so blockers remain visible.
                </p>
              </div>

              <div className="rounded-xl border bg-muted/40 p-4">
                <p className="text-sm font-medium">Step 3: Confirm billing clearance</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Use billing status together with checklist readiness before final discharge handling.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

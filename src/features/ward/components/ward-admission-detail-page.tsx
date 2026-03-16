import Link from "next/link";
import { Button } from "@/components/ui/button";
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
      <div className="rounded-xl border p-5 space-y-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Ward Admission Chart</p>
          <h1 className="text-3xl font-semibold tracking-tight">{fullName(admission.patient)}</h1>
          <p className="text-sm text-muted-foreground">
            {admission.patient?.patient_number ?? "No patient number"} · Ward {admission.ward?.name ?? "—"} · Bed {admission.bed?.bed_number ?? "Unassigned"}
          </p>
        </div>

        <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
          <p>Admitted: {formatDateTime(admission.admitted_at)}</p>
          <p>Doctor: {admission.admitting_doctor?.full_name ?? "Unknown"}</p>
          <p>Phone: {admission.patient?.phone ?? "—"}</p>
          <p>Reason: {admission.admission_reason ?? "—"}</p>
        </div>

        <div className="flex flex-wrap gap-3">
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
        </div>
      </div>

      <BillingSummaryCard
        invoiceCount={billing.invoiceCount}
        totalAmount={billing.totalAmount}
        amountPaid={billing.amountPaid}
        balanceDue={billing.balanceDue}
        cleared={billing.cleared}
      />

      <DischargeChecklistPanel
        hospitalSlug={hospitalSlug}
        admissionId={admission.id}
        items={checklist.items}
        summary={checklist.summary}
      />
    </main>
  );
}
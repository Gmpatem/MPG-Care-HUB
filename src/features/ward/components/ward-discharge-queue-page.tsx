import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FinalizePatientDischargeForm } from "@/features/ward/components/finalize-patient-discharge-form";
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

export function WardDischargeQueuePage({
  hospitalSlug,
  hospitalName,
  admissions = [],
}: {
  hospitalSlug: string;
  hospitalName: string;
  admissions?: Array<{
    id: string;
    patient: {
      patient_number: string | null;
      first_name: string;
      middle_name: string | null;
      last_name: string;
      phone: string | null;
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
    } | null;
    admitted_at: string;
    discharge_requested_at: string | null;
    admission_reason: string | null;
    readiness: {
      dischargeRequested: boolean;
      nurseCleared: boolean;
      checklistReady: boolean;
      checklistCompleted: number;
      checklistRequiredTotal: number;
      balanceDue: number;
      billingReady: boolean;
      readyForFinalDischarge: boolean;
    };
    billing: {
      invoiceCount: number;
      totalAmount: number;
      amountPaid: number;
      balanceDue: number;
      cleared: boolean;
    };
  }>;
}) {
  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border p-5">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Ward Discharge Queue</p>
          <h1 className="text-3xl font-semibold tracking-tight">Discharges</h1>
          <p className="text-sm text-muted-foreground">
            Review discharge readiness, resolve blockers, and finalize discharge for {hospitalName}.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href={`/h/${hospitalSlug}/ward`}>Open Ward</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/nurse`}>Open Nurse Dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/census`}>Open Census</Link>
          </Button>
        </div>
      </div>

      {admissions.length === 0 ? (
        <div className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
          No discharge-requested admissions right now.
        </div>
      ) : (
        <div className="space-y-5">
          {admissions.map((admission) => (
            <section key={admission.id} className="rounded-xl border p-5">
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold">{fullName(admission.patient)}</h2>
                      {admission.readiness.readyForFinalDischarge ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                          ready
                        </span>
                      ) : (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                          blocked
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {admission.patient?.patient_number ?? "No patient number"} ·
                      Ward {admission.ward?.name ?? "—"} ·
                      Bed {admission.bed?.bed_number ?? "Unassigned"}
                    </p>

                    <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
                      <p>Doctor: {admission.admitting_doctor?.full_name ?? "Unknown"}</p>
                      <p>Admitted: {formatDateTime(admission.admitted_at)}</p>
                      <p>Requested: {formatDateTime(admission.discharge_requested_at)}</p>
                      <p>Phone: {admission.patient?.phone ?? "—"}</p>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Reason: {admission.admission_reason ?? "—"}
                    </p>

                    <div className="mt-3 grid gap-2 text-sm md:grid-cols-4">
                      <div className={`rounded-md px-3 py-2 ${admission.readiness.dischargeRequested ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                        Doctor Request: {admission.readiness.dischargeRequested ? "Yes" : "No"}
                      </div>
                      <div className={`rounded-md px-3 py-2 ${admission.readiness.checklistReady ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                        Checklist: {admission.readiness.checklistCompleted}/{admission.readiness.checklistRequiredTotal}
                      </div>
                      <div className={`rounded-md px-3 py-2 ${admission.readiness.billingReady ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                        Billing: {admission.readiness.billingReady ? "Cleared" : `Balance ${admission.readiness.balanceDue.toFixed(2)}`}
                      </div>
                      <div className={`rounded-md px-3 py-2 ${admission.readiness.readyForFinalDischarge ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                        Final Status: {admission.readiness.readyForFinalDischarge ? "Ready" : "Blocked"}
                      </div>
                    </div>
                  </div>

                  <div className="w-full max-w-md space-y-3">
                    <div className="flex flex-wrap gap-2">
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/h/${hospitalSlug}/ward/admissions/${admission.id}`}>
                          Open Ward Chart
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm">
                        <Link href={`/h/${hospitalSlug}/nurse/admissions/${admission.id}`}>
                          Open Nurse Chart
                        </Link>
                      </Button>
                    </div>

                    <FinalizePatientDischargeForm
                      hospitalSlug={hospitalSlug}
                      admissionId={admission.id}
                      disabled={!admission.readiness.readyForFinalDischarge}
                    />
                  </div>
                </div>

                <BillingSummaryCard
                  invoiceCount={admission.billing.invoiceCount}
                  totalAmount={admission.billing.totalAmount}
                  amountPaid={admission.billing.amountPaid}
                  balanceDue={admission.billing.balanceDue}
                  cleared={admission.billing.cleared}
                />
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
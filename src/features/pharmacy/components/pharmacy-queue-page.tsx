import Link from "next/link";
import { Button } from "@/components/ui/button";

function fullName(patient: any) {
  if (!patient) return "Unknown patient";
  return [patient.first_name, patient.middle_name, patient.last_name].filter(Boolean).join(" ");
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function statusTone(status: string) {
  if (status === "dispensed") return "bg-emerald-100 text-emerald-700";
  if (status === "partially_dispensed") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
}

function EmptyState({ hospitalSlug }: { hospitalSlug: string }) {
  return (
    <div className="rounded-xl border border-dashed p-6">
      <h3 className="text-base font-semibold">No prescriptions received yet</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        The pharmacy queue only shows prescriptions already created by doctors for this hospital.
      </p>
      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
        <p>To make prescriptions appear here:</p>
        <ul className="list-disc pl-5">
          <li>Open a patient from the Doctor workspace</li>
          <li>Create a prescription from the doctor patient flow</li>
          <li>Return here and the prescription should appear as incoming for dispensing</li>
        </ul>
      </div>
      <div className="mt-4">
        <Button asChild variant="outline">
          <Link href={`/h/${hospitalSlug}/doctor`}>Open Doctor Workspace</Link>
        </Button>
      </div>
    </div>
  );
}

function Section({
  title,
  description,
  prescriptions,
  hospitalSlug,
}: {
  title: string;
  description: string;
  prescriptions: any[];
  hospitalSlug: string;
}) {
  return (
    <section className="rounded-xl border">
      <div className="border-b px-4 py-3">
        <h2 className="font-medium">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      {prescriptions.length === 0 ? (
        <div className="px-4 py-8 text-sm text-muted-foreground">No prescriptions in this section.</div>
      ) : (
        <div className="divide-y">
          {prescriptions.map((prescription) => (
            <div
              key={prescription.id}
              className="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-start lg:justify-between"
            >
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{fullName(prescription.patient)}</p>

                  <span className={`rounded-full px-2 py-0.5 text-xs ${statusTone(prescription.status)}`}>
                    {prescription.status}
                  </span>

                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                    {prescription.prescribed_by_staff?.full_name ? "from doctor" : "received"}
                  </span>

                  {prescription.no_stock_count > 0 ? (
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-700">
                      {prescription.no_stock_count} no stock
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                      stock ready
                    </span>
                  )}
                </div>

                <p className="text-sm text-muted-foreground">
                  {prescription.patient?.patient_number ?? "No patient number"} · Received {formatDateTime(prescription.prescribed_at)}
                </p>

                <p className="text-sm text-muted-foreground">
                  Prescriber: {prescription.prescribed_by_staff?.full_name ?? "Unknown"}
                </p>

                <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-4">
                  <p>Total items: {prescription.item_count}</p>
                  <p>Pending: {prescription.pending_count}</p>
                  <p>Partial: {prescription.partial_count}</p>
                  <p>Dispensed: {prescription.dispensed_count}</p>
                </div>

                <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-3">
                  <p>Ready items: {prescription.stock_ready_count}</p>
                  <p>No stock items: {prescription.no_stock_count}</p>
                  <p>Completion: {prescription.completion_ratio}%</p>
                </div>

                {prescription.notes ? (
                  <p className="text-sm text-muted-foreground">{prescription.notes}</p>
                ) : null}
              </div>

              <div className="flex gap-2">
                <Button asChild>
                  <Link href={`/h/${hospitalSlug}/pharmacy/prescriptions/${prescription.id}`}>
                    Open for Dispensing
                  </Link>
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

export function PharmacyQueuePage({
  hospitalSlug,
  hospitalName,
  prescriptions,
}: {
  hospitalSlug: string;
  hospitalName: string;
  prescriptions: any[];
}) {
  const incoming = prescriptions.filter((p) => p.workflow_bucket === "incoming");
  const partial = prescriptions.filter((p) => p.workflow_bucket === "partial");
  const completed = prescriptions.filter((p) => p.workflow_bucket === "completed");

  const activeCount = prescriptions.filter((p) => p.status === "active").length;
  const partialCount = prescriptions.filter((p) => p.status === "partially_dispensed").length;
  const dispensedCount = prescriptions.filter((p) => p.status === "dispensed").length;
  const noStockPrescriptionCount = prescriptions.filter((p) => p.no_stock_count > 0).length;

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Pharmacy receiving and dispensing queue</p>
          <h1 className="text-3xl font-semibold tracking-tight">Pharmacy</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Receive doctor prescriptions, prepare them for dispensing, and track fulfillment progress for {hospitalName}.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Total Prescriptions</p>
          <div className="mt-2 text-2xl font-semibold">{prescriptions.length}</div>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Incoming From Doctors</p>
          <div className="mt-2 text-2xl font-semibold">{incoming.length}</div>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">In Progress</p>
          <div className="mt-2 text-2xl font-semibold">{partial.length}</div>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Completed</p>
          <div className="mt-2 text-2xl font-semibold">{completed.length}</div>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Needs Stock Attention</p>
          <div className="mt-2 text-2xl font-semibold">{noStockPrescriptionCount}</div>
        </div>
      </div>

      {prescriptions.length === 0 ? (
        <EmptyState hospitalSlug={hospitalSlug} />
      ) : (
        <>
          <Section
            title="Incoming From Doctors"
            description="New prescriptions received from doctors and waiting for first dispensing action."
            prescriptions={incoming}
            hospitalSlug={hospitalSlug}
          />

          <Section
            title="Dispensing In Progress"
            description="Prescriptions that already have partial dispensing activity and still need work."
            prescriptions={partial}
            hospitalSlug={hospitalSlug}
          />

          <Section
            title="Completed Dispensing"
            description="Fully dispensed prescriptions kept here for verification and review."
            prescriptions={completed}
            hospitalSlug={hospitalSlug}
          />
        </>
      )}

      <div className="rounded-xl border p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground">Connection note</p>
        <p className="mt-1">
          This queue reads directly from the hospital's <code>prescriptions</code> and <code>prescription_items</code> tables.
          If the page is empty, no prescriptions have been created yet for this hospital or the current user cannot see them.
        </p>
      </div>
    </main>
  );
}
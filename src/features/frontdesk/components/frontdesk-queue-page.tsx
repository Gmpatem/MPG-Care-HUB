import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { CheckInVitalsForm } from "@/features/frontdesk/components/check-in-vitals-form";
import type { FrontdeskQueueRow } from "@/features/frontdesk/server/get-frontdesk-queue";

type HospitalLite = {
  id: string;
  name: string;
  slug: string;
};

function formatDateTime(value: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function fullName(row: FrontdeskQueueRow) {
  return [row.first_name, row.middle_name, row.last_name].filter(Boolean).join(" ");
}

function statusVariant(status: string | null): "default" | "secondary" | "destructive" | "outline" {
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

function VitalsQuickView({ row }: { row: FrontdeskQueueRow }) {
  const vitals = row.latest_vitals;

  if (!vitals) {
    return <p className="text-sm text-muted-foreground">No intake vitals recorded yet.</p>;
  }

  return (
    <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
      <p>Temp:  {vitals.temperature_c ?? "—"}</p>
      <p>
        BP:  {vitals.blood_pressure_systolic ?? "—"} / {vitals.blood_pressure_diastolic ?? "—"}
      </p>
      <p>Pulse: {vitals.pulse_bpm ?? "—"}</p>
      <p>Resp: {vitals.respiratory_rate ?? "—"}</p>
      <p>SpO2: {vitals.spo2 ?? "—"}</p>
      <p>Weight: {vitals.weight_kg ?? "—"}</p>
      <p>Height: {vitals.height_cm ?? "—"}</p>
      <p>Pain: {vitals.pain_score ?? "—"}</p>
    </div>
  );
}

export function FrontdeskQueuePage({
  hospital,
  queueRows,
}: {
  hospital: HospitalLite;
  queueRows: FrontdeskQueueRow[];
}) {
  return (
    <main className="space-y-6">
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Today&apos;s Queue</CardTitle>
          <CardDescription>
            Check in patients, capture intake vitals, and hand off to clinical staff.
          </CardDescription>
        </CardHeader>

        <CardContent className="py-5">
          {queueRows.length === 0 ? (
            <div className="space-y-4 rounded-lg border border-dashed p-6">
              <div>
                <h2 className="text-base font-semibold">No visits in queue</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Create a new visit or walk-in to start front desk flow.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/h/${hospital.slug}/frontdesk/patients`}
                  className="inline-flex h-10 items-center rounded-md border px-4 text-sm font-medium"
                >
                  Find Patient
                </Link>

                <Link
                  href={`/h/${hospital.slug}/frontdesk/visits/new?mode=walk-in`}
                  className="inline-flex h-10 items-center rounded-md border px-4 text-sm font-medium"
                >
                  New Walk-In
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {queueRows.map((row) => (
                <div key={row.appointment_id} className="rounded-lg border p-4">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold">
                          {fullName(row) || "Unknown patient"}
                        </h2>
                        <Badge variant={statusVariant(row.status)} className="capitalize">
                          {row.status ?? "scheduled"}
                        </Badge>
                      </div>

                      <div className="grid gap-1 text-sm text-muted-foreground">
                        <p>
                          {row.patient_number ?? "No patient number"} · {row.visit_type ?? "outpatient"}
                        </p>
                        <p>Doctor: {row.staff_name ?? "Unassigned"}</p>
                        <p>Scheduled: {formatDateTime(row.scheduled_at)}</p>
                        <p>Checked In: {formatDateTime(row.check_in_at)}</p>
                        <p>Queue: {row.queue_number ?? "—"}</p>
                        <p>Reason: {row.reason ?? "—"}</p>
                      </div>
                    </div>

                    <div className="min-w-[260px]">
                      {row.status === "checked_in" ? (
                        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                          Patient already checked in.
                        </div>
                      ) : (
                        <CheckInVitalsForm
                          hospitalSlug={hospital.slug}
                          appointmentId={row.appointment_id}
                          patientId={row.patient_id}
                        />
                      )}
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg bg-muted/30 p-3">
                    <p className="mb-2 text-sm font-medium">Latest Intake Snapshot</p>
                    <VitalsQuickView row={row} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
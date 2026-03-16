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

function formatDuration(admittedAt: string | null) {
  if (!admittedAt) return "—";
  const start = new Date(admittedAt).getTime();
  const now = Date.now();
  if (Number.isNaN(start)) return "—";

  const diffMs = Math.max(now - start, 0);
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  if (days > 0) return `${days}d ${remainingHours}h`;
  return `${hours}h`;
}

export function CensusPage({
  hospitalSlug,
  hospitalName,
  wards,
  stats,
}: {
  hospitalSlug: string;
  hospitalName: string;
  wards: any[];
  stats: {
    total_wards: number;
    total_admissions: number;
    discharge_requested: number;
    total_beds: number;
    occupied_beds: number;
    available_beds: number;
  };
}) {
  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border p-5">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Ward Census</p>
          <h1 className="text-3xl font-semibold tracking-tight">Census</h1>
          <p className="text-sm text-muted-foreground">
            View admitted patients by ward, check bed occupancy, and move quickly into charts and discharge work for {hospitalName}.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href={`/h/${hospitalSlug}/ward`}>Open Ward</Link>
          </Button>

          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/ward/admissions`}>Admission Intake</Link>
          </Button>

          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/ward/discharges`}>Discharge Queue</Link>
          </Button>

          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/ward/config`}>Ward Config</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Wards</p>
          <div className="mt-2 text-2xl font-semibold">{stats.total_wards}</div>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Admissions</p>
          <div className="mt-2 text-2xl font-semibold">{stats.total_admissions}</div>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Discharge Requested</p>
          <div className="mt-2 text-2xl font-semibold">{stats.discharge_requested}</div>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Total Beds</p>
          <div className="mt-2 text-2xl font-semibold">{stats.total_beds}</div>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Occupied Beds</p>
          <div className="mt-2 text-2xl font-semibold">{stats.occupied_beds}</div>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Available Beds</p>
          <div className="mt-2 text-2xl font-semibold">{stats.available_beds}</div>
        </div>
      </div>

      {wards.length === 0 ? (
        <div className="rounded-xl border border-dashed p-5 text-sm text-muted-foreground">
          No wards found yet. Configure wards and beds first, then admit patients to populate the census.
        </div>
      ) : (
        <div className="space-y-6">
          {wards.map((ward) => (
            <section key={ward.id} className="rounded-xl border">
              <div className="border-b px-4 py-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{ward.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {ward.code ?? "No code"} · {ward.ward_type ?? "general"}
                    </p>
                  </div>

                  <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-4">
                    <p>Admissions: {ward.admissions.length}</p>
                    <p>Occupied Beds: {ward.occupied_beds}</p>
                    <p>Available Beds: {ward.available_beds}</p>
                    <p>Discharge Requested: {ward.discharge_requested_count}</p>
                  </div>
                </div>
              </div>

              <div className="px-4 py-4">
                {ward.admissions.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                    No active admissions in this ward.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {ward.admissions.map((admission: any) => (
                      <div
                        key={admission.id}
                        className={`flex flex-col gap-4 rounded-xl border p-4 lg:flex-row lg:items-start lg:justify-between ${
                          admission.discharge_requested ? "border-amber-200 bg-amber-50/40" : ""
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">{fullName(admission.patient)}</p>

                            {admission.discharge_requested ? (
                              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                                discharge requested
                              </span>
                            ) : (
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                                admitted
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground">
                            {admission.patient?.patient_number ?? "No patient number"} ·
                            Bed {admission.bed?.bed_number ?? "Unassigned"} ·
                            Doctor {admission.admitting_doctor?.full_name ?? "Unknown"}
                          </p>

                          <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
                            <p>Admitted: {formatDateTime(admission.admitted_at)}</p>
                            <p>Stay: {formatDuration(admission.admitted_at)}</p>
                            <p>Phone: {admission.patient?.phone ?? "—"}</p>
                            <p>Encounter: {admission.encounter_id ?? "—"}</p>
                          </div>

                          <p className="text-sm text-muted-foreground">
                            Reason: {admission.admission_reason ?? "—"}
                          </p>

                          {admission.discharge_requested ? (
                            <p className="text-sm text-amber-700">
                              Discharge requested at {formatDateTime(admission.discharge_requested_at)}
                            </p>
                          ) : null}
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button asChild>
                            <Link href={`/h/${hospitalSlug}/ward/admissions/${admission.id}`}>
                              Open Chart
                            </Link>
                          </Button>

                          <Button asChild size="sm" variant="outline">
                            <Link href={`/h/${hospitalSlug}/ward/discharges`}>
                              Discharge Queue
                            </Link>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          ))}
        </div>
      )}
    </main>
  );
}
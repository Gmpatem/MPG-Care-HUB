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

export function WardCensusPage({
  hospitalSlug,
  hospitalName,
  wards,
  admissions,
}: {
  hospitalSlug: string;
  hospitalName: string;
  wards: any[];
  admissions: any[];
}) {
  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Ward census</p>
          <h1 className="text-3xl font-semibold tracking-tight">Census</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            View current admissions, bed occupancy, and ward distribution for {hospitalName}.
          </p>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/ward/admissions`}>Admissions Queue</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/ward/discharges`}>Discharges</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Active admissions</p>
          <div className="mt-2 text-2xl font-semibold">{admissions.length}</div>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Configured wards</p>
          <div className="mt-2 text-2xl font-semibold">{wards.length}</div>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Occupied beds</p>
          <div className="mt-2 text-2xl font-semibold">
            {wards.reduce((sum: number, ward: any) => sum + Number(ward.occupied_beds ?? 0), 0)}
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        {wards.length === 0 ? (
          <div className="rounded-xl border border-dashed p-6 text-sm text-muted-foreground">
            No wards configured yet. Create wards and beds to make the inpatient flow clearer.
          </div>
        ) : (
          wards.map((ward: any) => (
            <section key={ward.id} className="rounded-xl border">
              <div className="border-b px-4 py-4">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{ward.name}</h2>
                    <p className="text-sm text-muted-foreground">
                      {ward.code ?? "No code"} · {ward.ward_type ?? "general"} · Beds {ward.occupied_beds}/{ward.active_beds}
                    </p>
                  </div>
                </div>
              </div>

              {(ward.patients ?? []).length === 0 ? (
                <div className="px-4 py-6 text-sm text-muted-foreground">
                  No admitted patients currently assigned to this ward.
                </div>
              ) : (
                <div className="divide-y">
                  {ward.patients.map((admission: any) => (
                    <div
                      key={admission.id}
                      className="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-start lg:justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium">{fullName(admission.patient)}</p>
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                            {admission.status}
                          </span>
                          {admission.discharge_requested ? (
                            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                              discharge requested
                            </span>
                          ) : null}
                        </div>

                        <p className="text-sm text-muted-foreground">
                          {admission.patient?.patient_number ?? "No patient number"} · Bed {admission.bed?.bed_number ?? "Unassigned"}
                        </p>

                        <p className="text-sm text-muted-foreground">
                          Admitted: {formatDateTime(admission.admitted_at)}
                        </p>
                      </div>

                      <Button asChild>
                        <Link href={`/h/${hospitalSlug}/ward/admissions/${admission.id}`}>
                          Open Admission
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))
        )}
      </div>
    </main>
  );
}
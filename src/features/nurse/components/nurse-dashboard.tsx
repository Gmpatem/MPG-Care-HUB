import Link from "next/link";

type NurseDashboardData = {
  hospital: {
    id: string;
    slug: string;
    name: string;
  };
  totals: {
    admitted: number;
    due: number;
    overdue: number;
    stable: number;
  };
  rows: Array<{
    id: string;
    patient_id: string;
    encounter_id: string | null;
    admitted_at: string;
    patient: {
      id: string;
      patient_number: string | null;
      full_name: string;
      sex: string | null;
      date_of_birth: string | null;
      phone: string | null;
    } | null;
    ward: {
      id: string;
      name: string;
      code: string | null;
      ward_type: string | null;
    } | null;
    bed: {
      id: string;
      bed_number: string;
      status: string | null;
    } | null;
    latest_vital: {
      id: string;
      admission_id: string | null;
      recorded_at: string;
      temperature_c: number | null;
      blood_pressure_systolic: number | null;
      blood_pressure_diastolic: number | null;
      pulse_bpm: number | null;
      respiratory_rate: number | null;
      spo2: number | null;
      pain_score: number | null;
    } | null;
    next_due_at: string;
    vitals_status: string;
    vitals_frequency_hours: number;
  }>;
};

function statusClasses(status: string) {
  if (status === "overdue") return "border-red-200 bg-red-100 text-red-700";
  if (status === "due") return "border-amber-200 bg-amber-100 text-amber-700";
  return "border-emerald-200 bg-emerald-100 text-emerald-700";
}

export function NurseDashboard({ data }: { data: NurseDashboardData }) {
  return (
    <main className="space-y-6">
      <div className="rounded-lg border p-5">
        <p className="text-sm text-muted-foreground">Nurse Workspace</p>
        <h1 className="text-3xl font-bold">{data.hospital.name}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Monitor admitted patients, track vitals timing, and open patient charts quickly.
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Admitted</p>
          <p className="mt-2 text-2xl font-bold">{data.totals.admitted}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Vitals Due</p>
          <p className="mt-2 text-2xl font-bold">{data.totals.due}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Overdue</p>
          <p className="mt-2 text-2xl font-bold">{data.totals.overdue}</p>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Up to Date</p>
          <p className="mt-2 text-2xl font-bold">{data.totals.stable}</p>
        </div>
      </section>

      <section className="rounded-lg border">
        <div className="border-b p-4">
          <h2 className="text-lg font-semibold">Ward Monitoring</h2>
          <p className="text-sm text-muted-foreground">
            Open an admission chart to record vitals and nurse documentation.
          </p>
        </div>

        <div className="divide-y">
          {data.rows.length ? (
            data.rows.map((row) => (
              <div
                key={row.id}
                className="grid gap-4 p-4 lg:grid-cols-[1.4fr_.9fr_.9fr_.9fr_auto]"
              >
                <div className="space-y-1">
                  <p className="font-medium">
                    {row.patient?.full_name ?? "Unknown patient"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {row.patient?.patient_number ?? "No number"} ·{" "}
                    {row.patient?.phone ?? "No phone"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Ward: {row.ward?.name ?? "-"} · Bed: {row.bed?.bed_number ?? "-"}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium">Latest Vitals</p>
                  <p className="text-sm text-muted-foreground">
                    {row.latest_vital
                      ? new Date(row.latest_vital.recorded_at).toLocaleString()
                      : "No vitals yet"}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium">Next Due</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(row.next_due_at).toLocaleString()}
                  </p>
                </div>

                <div>
                  <p className="text-sm font-medium">Status</p>
                  <span
                    className={`mt-1 inline-flex rounded-md border px-2 py-1 text-xs font-medium ${statusClasses(
                      row.vitals_status
                    )}`}
                  >
                    {row.vitals_status === "ok"
                      ? "Up to date"
                      : row.vitals_status === "due"
                      ? "Due now"
                      : "Overdue"}
                  </span>
                </div>

                <div className="flex items-start justify-end">
                  <Link
                    href={`/h/${data.hospital.slug}/ward/admissions/${row.id}`}
                    className="inline-flex rounded-md border px-3 py-2 text-sm font-medium"
                  >
                    Open Chart
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="p-6 text-sm text-muted-foreground">
              No admitted patients found.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

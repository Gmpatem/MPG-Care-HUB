import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getPharmacyDashboardData } from "@/features/pharmacy/server/get-pharmacy-dashboard-data";
import { PharmacyWorkflowCard } from "@/features/pharmacy/components/pharmacy-workflow-card";

type Props = {
  params: Promise<{
    hospitalSlug: string;
  }>;
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

export default async function PharmacyDashboardRoute({ params }: Props) {
  const { hospitalSlug } = await params;
  const data = await getPharmacyDashboardData(hospitalSlug);

  return (
    <main className="space-y-6">
      <div className="space-y-4 rounded-xl border p-5">
        <div>
          <p className="text-sm text-muted-foreground">Pharmacy</p>
          <h1 className="text-3xl font-semibold tracking-tight">Pharmacy Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Prescription queue, stock readiness, and dispensing workflow for {data.hospital.name}.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <Button asChild>
            <Link href={`/h/${hospitalSlug}`}>Hospital Dashboard</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/admin/medications`}>Medications</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/admin/pharmacy-stock`}>Stock</Link>
          </Button>
        </div>
      </div>

      <PharmacyWorkflowCard
        hospitalSlug={hospitalSlug}
        stats={data.stats}
      />

      <section className="space-y-4 rounded-xl border p-5">
        <div>
          <h2 className="text-lg font-semibold">Prescription Queue</h2>
          <p className="text-sm text-muted-foreground">
            Current prescriptions entering the pharmacy workflow.
          </p>
        </div>

        {data.rows.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            No prescriptions in the queue yet.
          </div>
        ) : (
          <div className="space-y-3">
            {data.rows.map((row) => (
              <div key={row.id} className="rounded-lg border p-4">
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium">{row.patient_full_name}</h3>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                        {row.status}
                      </span>
                      {row.stock_ready ? (
                        <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                          ready
                        </span>
                      ) : null}
                      {row.stock_blocked ? (
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                          stock blocked
                        </span>
                      ) : null}
                    </div>

                    <p className="text-sm text-muted-foreground">
                      {row.patient_number ?? "No patient number"} · Items {row.item_count} · Prescribed {formatDateTime(row.prescribed_at)}
                    </p>
                  </div>

                  <div>
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/h/${hospitalSlug}/pharmacy/prescriptions/${row.id}`}>
                        Open Prescription
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
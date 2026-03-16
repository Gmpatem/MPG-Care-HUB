import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { LabTestRow } from "@/features/lab/server/get-lab-page-data";

type LabTestsPageProps = {
  hospitalSlug: string;
  hospitalName: string;
  tests: LabTestRow[];
};

function formatMoney(value: number | null) {
  if (value == null) return "—";
  return new Intl.NumberFormat("en-CM", {
    style: "currency",
    currency: "XAF",
    maximumFractionDigits: 0,
  }).format(value);
}

export function LabTestsPage({
  hospitalSlug,
  hospitalName,
  tests,
}: LabTestsPageProps) {
  const activeCount = tests.filter((test) => test.active).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Laboratory catalog</p>
          <h1 className="text-3xl font-semibold tracking-tight">Lab Tests</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage the tests offered by {hospitalName}. Doctors will order from this catalog.
          </p>
        </div>

        <Button asChild>
          <Link href={`/h/${hospitalSlug}/lab/tests/new`}>Add Lab Test</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Total tests</p>
          <div className="mt-2 text-2xl font-semibold">{tests.length}</div>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Active</p>
          <div className="mt-2 text-2xl font-semibold">{activeCount}</div>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Inactive</p>
          <div className="mt-2 text-2xl font-semibold">{tests.length - activeCount}</div>
        </div>
      </div>

      <div className="rounded-xl border">
        <div className="border-b px-4 py-3">
          <h2 className="font-medium">Available test catalog</h2>
        </div>

        {tests.length === 0 ? (
          <div className="px-4 py-8 text-sm text-muted-foreground">
            No lab tests yet. Add your first test so doctors can order from the catalog.
          </div>
        ) : (
          <div className="divide-y">
            {tests.map((test) => (
              <div
                key={test.id}
                className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{test.name}</p>

                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        test.active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {test.active ? "Active" : "Inactive"}
                    </span>

                    {test.code ? (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                        {test.code}
                      </span>
                    ) : null}
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {test.description || "No description provided."}
                  </p>
                </div>

                <div className="text-sm font-medium">{formatMoney(test.price)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
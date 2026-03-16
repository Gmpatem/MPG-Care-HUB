import Link from "next/link";
import { Button } from "@/components/ui/button";
import type { LabOrderRow } from "@/features/lab/server/get-lab-orders-page-data";

type LabOrdersPageProps = {
  hospitalSlug: string;
  hospitalName: string;
  orders: LabOrderRow[];
};

function fullName(patient: LabOrderRow["patient"]) {
  if (!patient) return "Unknown patient";
  return [patient.first_name, patient.middle_name, patient.last_name].filter(Boolean).join(" ");
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return date.toLocaleString();
}

export function LabOrdersPage({
  hospitalSlug,
  hospitalName,
  orders,
}: LabOrdersPageProps) {
  const orderedCount = orders.filter((order) => order.status !== "completed").length;
  const completedCount = orders.filter((order) => order.status === "completed").length;

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Laboratory queue</p>
          <h1 className="text-3xl font-semibold tracking-tight">Lab Orders</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review pending and completed lab work for {hospitalName}.
          </p>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/lab`}>Back to Lab</Link>
          </Button>
          <Button asChild>
            <Link href={`/h/${hospitalSlug}/lab/tests`}>Manage Test Catalog</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Total orders</p>
          <div className="mt-2 text-2xl font-semibold">{orders.length}</div>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Pending / in lab</p>
          <div className="mt-2 text-2xl font-semibold">{orderedCount}</div>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Completed</p>
          <div className="mt-2 text-2xl font-semibold">{completedCount}</div>
        </div>
      </div>

      <div className="rounded-xl border">
        <div className="border-b px-4 py-3">
          <h2 className="font-medium">Lab work queue</h2>
        </div>

        {orders.length === 0 ? (
          <div className="px-4 py-8 text-sm text-muted-foreground">
            No lab orders yet. Once doctors place lab requests, they will appear here.
          </div>
        ) : (
          <div className="divide-y">
            {orders.map((order) => (
              <div
                key={order.id}
                className="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-start lg:justify-between"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{fullName(order.patient)}</p>

                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        order.status === "completed"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {order.status === "completed" ? "Completed" : "Pending"}
                    </span>

                    {order.priority ? (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700 uppercase">
                        {order.priority}
                      </span>
                    ) : null}
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {order.patient?.patient_number ?? "No patient number"} · Ordered {formatDateTime(order.ordered_at)}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Doctor: {order.ordered_by_staff?.full_name ?? "Unassigned"}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Results entered: {order.entered_count} / {order.item_count}
                  </p>

                  {order.clinical_notes ? (
                    <p className="text-sm text-muted-foreground">{order.clinical_notes}</p>
                  ) : null}
                </div>

                <div className="flex gap-2">
                  <Button asChild>
                    <Link href={`/h/${hospitalSlug}/lab/orders/${order.id}`}>Open Order</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
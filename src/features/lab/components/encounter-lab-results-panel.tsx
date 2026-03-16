import Link from "next/link";
import { Button } from "@/components/ui/button";

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export function EncounterLabResultsPanel({
  hospitalSlug,
  patientId,
  encounterId,
  labOrders,
}: {
  hospitalSlug: string;
  patientId: string;
  encounterId: string;
  labOrders: any[];
}) {
  const totalOrders = labOrders.length;
  const completedOrders = labOrders.filter((order) => order.status === "completed").length;
  const hasReadyResults = labOrders.some((order) =>
    (order.lab_order_items ?? []).some((item: any) => item.result_text || item.entered_at)
  );

  return (
    <section className="space-y-4 rounded-xl border p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">Lab Results</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Review encounter-linked lab orders and returned results.
          </p>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/doctor/patients/${patientId}/labs/new`}>
              Order Lab
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/lab/orders`}>
              Open Lab Queue
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Linked orders</p>
          <div className="mt-1 text-2xl font-semibold">{totalOrders}</div>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Completed</p>
          <div className="mt-1 text-2xl font-semibold">{completedOrders}</div>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Results ready</p>
          <div className="mt-1 text-2xl font-semibold">{hasReadyResults ? "Yes" : "No"}</div>
        </div>
      </div>

      {labOrders.length === 0 ? (
        <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          No lab orders linked to this encounter yet.
        </div>
      ) : (
        <div className="space-y-4">
          {labOrders.map((order) => {
            const enteredCount = (order.lab_order_items ?? []).filter((item: any) => item.result_text || item.entered_at).length;
            const itemCount = (order.lab_order_items ?? []).length;

            return (
              <div key={order.id} className="rounded-xl border">
                <div className="flex flex-col gap-3 border-b px-4 py-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">Lab Order</p>

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
                      Ordered: {formatDateTime(order.ordered_at)} · Results entered: {enteredCount} / {itemCount}
                    </p>

                    {order.clinical_notes ? (
                      <p className="text-sm text-muted-foreground">{order.clinical_notes}</p>
                    ) : null}
                  </div>

                  <Button asChild variant="outline">
                    <Link href={`/h/${hospitalSlug}/lab/orders/${order.id}`}>
                      Open in Lab
                    </Link>
                  </Button>
                </div>

                <div className="divide-y">
                  {(order.lab_order_items ?? []).length === 0 ? (
                    <div className="px-4 py-4 text-sm text-muted-foreground">
                      No test items found for this order.
                    </div>
                  ) : (
                    order.lab_order_items.map((item: any) => {
                      const displayName = item.lab_test?.name ?? item.test_name;
                      const displayCode = item.lab_test?.code ?? null;

                      return (
                        <div key={item.id} className="space-y-2 px-4 py-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="font-medium">
                              {displayName}
                              {displayCode ? ` (${displayCode})` : ""}
                            </p>

                            {item.result_text || item.entered_at ? (
                              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                                Result available
                              </span>
                            ) : (
                              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                                Awaiting result
                              </span>
                            )}
                          </div>

                          <div className="grid gap-3 text-sm sm:grid-cols-2">
                            <p>
                              <span className="font-medium">Result:</span>{" "}
                              <span className="text-muted-foreground">{item.result_text || "—"}</span>
                            </p>
                            <p>
                              <span className="font-medium">Unit:</span>{" "}
                              <span className="text-muted-foreground">{item.unit || "—"}</span>
                            </p>
                            <p>
                              <span className="font-medium">Reference Range:</span>{" "}
                              <span className="text-muted-foreground">{item.reference_range || "—"}</span>
                            </p>
                            <p>
                              <span className="font-medium">Entered At:</span>{" "}
                              <span className="text-muted-foreground">{formatDateTime(item.entered_at)}</span>
                            </p>
                          </div>

                          {item.notes ? (
                            <p className="text-sm text-muted-foreground">
                              <span className="font-medium text-foreground">Lab Note:</span> {item.notes}
                            </p>
                          ) : null}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
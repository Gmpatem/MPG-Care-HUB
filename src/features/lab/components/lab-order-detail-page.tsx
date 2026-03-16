import Link from "next/link";
import { Button } from "@/components/ui/button";
import { LabOrderItemResultForm } from "@/features/lab/components/lab-order-item-result-form";
import { CompleteLabOrderButton } from "@/features/lab/components/complete-lab-order-button";

function fullName(patient: any) {
  if (!patient) return "Unknown patient";
  return [patient.first_name, patient.middle_name, patient.last_name].filter(Boolean).join(" ");
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  return date.toLocaleString();
}

export function LabOrderDetailPage({
  hospitalSlug,
  order,
  items,
}: {
  hospitalSlug: string;
  order: any;
  items: any[];
}) {
  const enteredCount = items.filter((item) => item.entered_at || item.result_text).length;
  const isCompleted = order.status === "completed";

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Lab order detail</p>
          <h1 className="text-3xl font-semibold tracking-tight">Lab Order</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review test items, enter results, and complete this lab order.
          </p>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/lab/orders`}>Back to Queue</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-xl border p-5">
            <p className="text-sm text-muted-foreground">Patient</p>
            <h2 className="mt-1 text-lg font-semibold">{fullName(order.patient)}</h2>
            <p className="text-sm text-muted-foreground">
              {order.patient?.patient_number ?? "No patient number"} · {order.patient?.sex ?? "unknown"} · {order.patient?.phone ?? "No phone"}
            </p>
          </div>

          <div className="rounded-xl border p-5">
            <h2 className="text-lg font-semibold">Order Summary</h2>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <p><span className="font-medium">Status:</span> {order.status ?? "ordered"}</p>
              <p><span className="font-medium">Priority:</span> {order.priority ?? "routine"}</p>
              <p><span className="font-medium">Ordered At:</span> {formatDateTime(order.ordered_at)}</p>
              <p><span className="font-medium">Completed At:</span> {formatDateTime(order.completed_at)}</p>
              <p><span className="font-medium">Ordering Doctor:</span> {order.ordered_by_staff?.full_name ?? "Unknown"}</p>
              <p><span className="font-medium">Results Entered:</span> {enteredCount} / {items.length}</p>
            </div>

            <div className="mt-4">
              <p className="font-medium">Clinical Notes</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                {order.clinical_notes || "—"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Test Items</h2>
              <p className="text-sm text-muted-foreground">
                Enter results for each requested test.
              </p>
            </div>

            {items.length === 0 ? (
              <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                This lab order has no items yet.
              </div>
            ) : (
              items.map((item) => (
                <LabOrderItemResultForm
                  key={item.id}
                  hospitalSlug={hospitalSlug}
                  labOrderId={order.id}
                  item={item}
                />
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border p-5">
            <h2 className="text-lg font-semibold">Completion</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Mark this order completed after results have been entered for all items.
            </p>

            <div className="mt-4">
              <CompleteLabOrderButton
                hospitalSlug={hospitalSlug}
                labOrderId={order.id}
                disabled={isCompleted}
              />
            </div>

            {isCompleted ? (
              <p className="mt-3 text-sm text-emerald-700">
                This order has already been marked completed.
              </p>
            ) : null}
          </div>

          <div className="rounded-xl border p-5">
            <h2 className="text-lg font-semibold">Next integration step</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              After this queue is working, the next patch should surface completed results back inside doctor encounter and workspace pages.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
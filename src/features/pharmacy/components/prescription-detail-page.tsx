import Link from "next/link";
import { Button } from "@/components/ui/button";
import { DispensePrescriptionItemForm } from "@/features/pharmacy/components/dispense-prescription-item-form";

function fullName(patient: any) {
  if (!patient) return "Unknown patient";
  return [patient.first_name, patient.middle_name, patient.last_name].filter(Boolean).join(" ");
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

function itemStatusTone(status: string) {
  if (status === "dispensed") return "bg-emerald-100 text-emerald-700";
  if (status === "partially_dispensed") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
}

export function PrescriptionDetailPage({
  hospitalSlug,
  prescription,
  items,
  dispensations,
}: {
  hospitalSlug: string;
  prescription: any;
  items: any[];
  dispensations: any[];
}) {
  const pendingItems = items.filter((item) => item.status === "pending").length;
  const partialItems = items.filter((item) => item.status === "partially_dispensed").length;
  const dispensedItems = items.filter((item) => item.status === "dispensed").length;
  const noStockItems = items.filter((item) => Number(item.total_available_stock ?? 0) <= 0).length;

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Prescription detail</p>
          <h1 className="text-3xl font-semibold tracking-tight">Prescription</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Review medication items, stock availability, and dispensing progress.
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href={`/h/${hospitalSlug}/pharmacy`}>Back to Pharmacy</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Status</p>
          <div className="mt-2 text-lg font-semibold capitalize">{prescription.status}</div>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Pending Items</p>
          <div className="mt-2 text-2xl font-semibold">{pendingItems}</div>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Partial Items</p>
          <div className="mt-2 text-2xl font-semibold">{partialItems}</div>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Dispensed Items</p>
          <div className="mt-2 text-2xl font-semibold">{dispensedItems}</div>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">No Stock Items</p>
          <div className="mt-2 text-2xl font-semibold">{noStockItems}</div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-6">
          <div className="rounded-xl border p-5">
            <p className="text-sm text-muted-foreground">Patient</p>
            <h2 className="mt-1 text-lg font-semibold">{fullName(prescription.patient)}</h2>
            <p className="text-sm text-muted-foreground">
              {prescription.patient?.patient_number ?? "No patient number"} · {prescription.patient?.sex ?? "unknown"} · {prescription.patient?.phone ?? "No phone"}
            </p>
          </div>

          <div className="rounded-xl border p-5">
            <h2 className="text-lg font-semibold">Prescription Summary</h2>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <p><span className="font-medium">Status:</span> {prescription.status}</p>
              <p><span className="font-medium">Prescribed At:</span> {formatDateTime(prescription.prescribed_at)}</p>
              <p><span className="font-medium">Doctor:</span> {prescription.prescribed_by_staff?.full_name ?? "Unknown"}</p>
              <p><span className="font-medium">Encounter:</span> {prescription.encounter_id ?? "—"}</p>
            </div>

            <div className="mt-4">
              <p className="font-medium">Notes</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                {prescription.notes || "—"}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-semibold">Medication Items</h2>
              <p className="text-sm text-muted-foreground">
                Each item shows remaining quantity, stock on hand, and available batches.
              </p>
            </div>

            {items.length === 0 ? (
              <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                This prescription has no items yet.
              </div>
            ) : (
              items.map((item) => (
                <div key={item.id} className="space-y-4 rounded-xl border p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-medium">
                          {item.medication?.generic_name || item.medication?.brand_name || item.medication_name}
                        </h3>
                        <span className={`rounded-full px-2 py-0.5 text-xs ${itemStatusTone(item.status)}`}>
                          {item.status}
                        </span>
                        {Number(item.total_available_stock ?? 0) > 0 ? (
                          <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                            stock ready
                          </span>
                        ) : (
                          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-700">
                            no stock
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground">
                        Dose: {item.dose || "—"} · Frequency: {item.frequency || "—"} · Route: {item.route || item.medication?.route || "—"}
                      </p>
                    </div>

                    <div className="grid min-w-[220px] gap-1 text-sm text-muted-foreground">
                      <p>Prescribed: {item.quantity_prescribed ?? "—"}</p>
                      <p>Already dispensed: {Number(item.already_dispensed_quantity ?? 0)}</p>
                      <p>Remaining: {Number(item.remaining_quantity ?? 0)}</p>
                      <p>Total stock on hand: {Number(item.total_available_stock ?? 0)}</p>
                    </div>
                  </div>

                  <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                    <p>Duration: {item.duration || "—"}</p>
                    <p>Instructions: {item.instructions || "—"}</p>
                  </div>

                  <DispensePrescriptionItemForm
                    hospitalSlug={hospitalSlug}
                    prescriptionId={prescription.id}
                    item={item}
                  />
                </div>
              ))
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border p-5">
            <h2 className="text-lg font-semibold">Dispensation History</h2>

            {dispensations.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                No dispensations recorded yet.
              </p>
            ) : (
              <div className="mt-4 space-y-4">
                {dispensations.map((dispensation) => {
                  const dispensationItems = Array.isArray(dispensation.dispensation_items)
                    ? dispensation.dispensation_items
                    : [];

                  const totalQuantity = dispensationItems.reduce(
                    (sum: number, entry: any) => sum + Number(entry.quantity_dispensed ?? 0),
                    0
                  );

                  const totalValue = dispensationItems.reduce(
                    (sum: number, entry: any) => sum + Number(entry.line_total ?? 0),
                    0
                  );

                  return (
                    <div key={dispensation.id} className="rounded-lg border p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium capitalize">{dispensation.status}</p>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                          {dispensationItems.length} item rows
                        </span>
                      </div>

                      <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                        <p>Dispensed at: {formatDateTime(dispensation.dispensed_at)}</p>
                        <p>Staff: {dispensation.dispensed_by_staff?.full_name ?? "Unknown"}</p>
                        <p>Total quantity: {totalQuantity}</p>
                        <p>Total value: {totalValue.toFixed(2)}</p>
                      </div>

                      {dispensationItems.length > 0 ? (
                        <div className="mt-3 space-y-2">
                          {dispensationItems.map((entry: any) => (
                            <div key={entry.id} className="rounded-md bg-muted/40 px-3 py-2 text-sm">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <span>Prescription item: {entry.prescription_item_id}</span>
                                <span>Batch: {entry.batch_id ?? "—"}</span>
                              </div>
                              <div className="mt-1 flex flex-wrap gap-4 text-muted-foreground">
                                <span>Qty: {Number(entry.quantity_dispensed ?? 0)}</span>
                                <span>Unit: {Number(entry.unit_price ?? 0).toFixed(2)}</span>
                                <span>Total: {Number(entry.line_total ?? 0).toFixed(2)}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : null}

                      {dispensation.notes ? (
                        <p className="mt-3 text-sm text-muted-foreground">{dispensation.notes}</p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-xl border p-5">
            <h2 className="text-lg font-semibold">Batch Guidance</h2>
            <div className="mt-3 space-y-3">
              {items.flatMap((item) =>
                (item.available_batches ?? []).slice(0, 2).map((batch: any) => (
                  <div
                    key={`${item.id}-${batch.id}`}
                    className="rounded-lg border p-3 text-sm text-muted-foreground"
                  >
                    <p className="font-medium text-foreground">
                      {item.medication?.generic_name || item.medication_name}
                    </p>
                    <p className="mt-1">
                      Batch {batch.batch_number} · Available {Number(batch.quantity_available ?? 0)} · Price {Number(batch.selling_price ?? 0).toFixed(2)}
                    </p>
                    <p>Expiry: {formatDate(batch.expiry_date)}</p>
                  </div>
                ))
              )}

              {items.every((item) => (item.available_batches ?? []).length === 0) ? (
                <p className="text-sm text-muted-foreground">
                  No stock batches available for the prescription items yet.
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
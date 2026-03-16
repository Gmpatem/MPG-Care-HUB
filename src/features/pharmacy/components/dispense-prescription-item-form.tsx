"use client";

import { useActionState } from "react";
import {
  dispensePrescriptionItem,
  type DispensePrescriptionItemState,
} from "@/features/pharmacy/actions/dispense-prescription-item";
import { Button } from "@/components/ui/button";

const initialState: DispensePrescriptionItemState = {};

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export function DispensePrescriptionItemForm({
  hospitalSlug,
  prescriptionId,
  item,
}: {
  hospitalSlug: string;
  prescriptionId: string;
  item: any;
}) {
  const action = dispensePrescriptionItem.bind(null, hospitalSlug, prescriptionId, item.id);
  const [state, formAction, pending] = useActionState(action, initialState);

  const medicationName =
    item.medication?.generic_name ||
    item.medication?.brand_name ||
    item.medication_name;

  const availableBatches = item.available_batches ?? [];
  const totalAvailableStock = Number(item.total_available_stock ?? 0);
  const remainingQuantity = Number(item.remaining_quantity ?? 0);
  const alreadyDispensed = Number(item.already_dispensed_quantity ?? 0);
  const prescribedQuantity = Number(item.quantity_prescribed ?? 0);
  const isFullyDispensed = Boolean(item.is_fully_dispensed);

  const defaultQuantity =
    remainingQuantity > 0
      ? String(remainingQuantity)
      : prescribedQuantity > 0
      ? String(prescribedQuantity)
      : "";

  return (
    <form action={formAction} className="space-y-4 rounded-xl border bg-background p-4">
      <div className="space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-medium">{medicationName}</h3>
          <span
            className={`rounded-full px-2 py-0.5 text-xs ${
              item.status === "dispensed"
                ? "bg-emerald-100 text-emerald-700"
                : item.status === "partially_dispensed"
                ? "bg-amber-100 text-amber-700"
                : "bg-slate-100 text-slate-700"
            }`}
          >
            {item.status}
          </span>
        </div>

        <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-4">
          <p>Dose: {item.dose || "—"}</p>
          <p>Frequency: {item.frequency || "—"}</p>
          <p>Route: {item.route || item.medication?.route || "—"}</p>
          <p>Duration: {item.duration || "—"}</p>
        </div>

        <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-4">
          <p>Prescribed: {item.quantity_prescribed ?? "—"}</p>
          <p>Already dispensed: {alreadyDispensed}</p>
          <p>Remaining: {remainingQuantity}</p>
          <p>Stock on hand: {totalAvailableStock}</p>
        </div>

        <p className="text-sm text-muted-foreground">
          Instructions: {item.instructions || "—"}
        </p>
      </div>

      {state.message ? (
        <div
          className={`rounded-md px-3 py-2 text-sm ${
            state.success
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      {isFullyDispensed ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-4 text-sm text-emerald-700">
          This item has already been fully dispensed.
        </div>
      ) : availableBatches.length === 0 ? (
        <div className="rounded-md border border-dashed px-3 py-4 text-sm text-muted-foreground">
          No available stock batch found for this medication.
        </div>
      ) : (
        <>
          <label className="grid gap-2 text-sm">
            <span className="font-medium">Stock Batch</span>
            <select
              name="batch_id"
              defaultValue={item.preferred_batch_id ?? ""}
              className="h-11 rounded-md border bg-background px-3 text-sm"
            >
              <option value="">Select batch</option>
              {availableBatches.map((batch: any) => (
                <option key={batch.id} value={batch.id}>
                  {batch.batch_number} · Available {Number(batch.quantity_available ?? 0)} · Exp {formatDate(batch.expiry_date)} · Price {Number(batch.selling_price ?? 0).toFixed(2)}
                </option>
              ))}
            </select>
          </label>

          <div className="rounded-md bg-muted/40 px-3 py-3 text-sm text-muted-foreground">
            Batch priority is shown in earliest-expiry order, using hospital stock batches with available quantity only.
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <label className="grid gap-2 text-sm">
              <span className="font-medium">Quantity Dispensed</span>
              <input
                name="quantity_dispensed"
                type="number"
                min="0.01"
                step="0.01"
                defaultValue={defaultQuantity}
                className="h-11 rounded-md border bg-background px-3 text-sm"
              />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Notes</span>
              <input
                name="notes"
                className="h-11 rounded-md border bg-background px-3 text-sm"
                placeholder="Optional dispensing note"
              />
            </label>
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? "Dispensing..." : "Dispense"}
            </Button>
          </div>
        </>
      )}
    </form>
  );
}
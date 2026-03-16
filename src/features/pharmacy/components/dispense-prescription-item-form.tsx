"use client";

import { useActionState } from "react";
import { Pill, Save } from "lucide-react";

import {
  dispensePrescriptionItem,
  type DispensePrescriptionItemState,
} from "@/features/pharmacy/actions/dispense-prescription-item";

type BatchOption = {
  id: string;
  batch_number: string;
  quantity_available: number;
  selling_price: number;
  expiry_date: string | null;
};

type Props = {
  hospitalSlug: string;
  prescriptionId: string;
  item: {
    id: string;
    medication_name: string;
    dose: string | null;
    frequency: string | null;
    duration: string | null;
    route: string | null;
    quantity_prescribed: number | null;
    status: string;
    instructions: string | null;
  };
  batches: BatchOption[];
};

const initialState: DispensePrescriptionItemState = {};

export function DispensePrescriptionItemForm({
  hospitalSlug,
  prescriptionId,
  item,
  batches,
}: Props) {
  const action = dispensePrescriptionItem.bind(null, hospitalSlug, prescriptionId, item.id);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="rounded-xl border bg-background p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-lg bg-muted p-2">
              <Pill className="h-4 w-4 text-muted-foreground" />
            </div>
            <h3 className="font-medium">{item.medication_name}</h3>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
              {item.status}
            </span>
          </div>

          <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
            <p>Dose: {item.dose ?? "—"}</p>
            <p>Frequency: {item.frequency ?? "—"}</p>
            <p>Duration: {item.duration ?? "—"}</p>
            <p>Route: {item.route ?? "—"}</p>
          </div>

          <p className="text-sm text-muted-foreground">
            Instructions: {item.instructions ?? "—"}
          </p>
        </div>

        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center rounded-xl border bg-background px-4 text-sm font-medium hover:bg-muted disabled:opacity-60"
        >
          <Save className="mr-2 h-4 w-4" />
          {pending ? "Saving..." : "Save Dispensing"}
        </button>
      </div>

      {state?.message ? (
        <div
          className={`mt-4 rounded-xl px-4 py-3 text-sm ${
            state.success
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <div className="mt-4 grid gap-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm">
            <span className="font-medium">Batch</span>
            <select
              name="batch_id"
              className="h-11 rounded-xl border bg-background px-3 text-sm"
              required
            >
              <option value="">Select stock batch</option>
              {batches.map((batch) => (
                <option key={batch.id} value={batch.id}>
                  {batch.batch_number} · Qty {batch.quantity_available} · Price {batch.selling_price.toFixed(2)}
                  {batch.expiry_date ? ` · Exp ${batch.expiry_date}` : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Quantity to Dispense</span>
            <input
              name="quantity_dispensed"
              type="number"
              min="0.01"
              step="0.01"
              defaultValue={item.quantity_prescribed ?? ""}
              className="h-11 rounded-xl border bg-background px-3 text-sm"
              required
            />
          </label>
        </div>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Pharmacy Notes</span>
          <textarea
            name="notes"
            rows={3}
            className="rounded-xl border bg-background px-3 py-2 text-sm"
            placeholder="Optional stock or dispensing notes"
          />
        </label>
      </div>
    </form>
  );
}

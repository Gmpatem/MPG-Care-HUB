"use client";

import { useActionState } from "react";
import { FlaskConical, Save } from "lucide-react";

import {
  saveLabOrderItemResult,
  type SaveLabOrderItemResultState,
} from "@/features/lab/actions/save-lab-order-item-result";
import { Button } from "@/components/ui/button";

type LabOrderItemResultFormProps = {
  hospitalSlug: string;
  labOrderId: string;
  item: {
    id: string;
    test_name: string;
    result_text: string | null;
    unit: string | null;
    reference_range: string | null;
    notes: string | null;
    entered_at: string | null;
    status?: string | null;
    lab_test: {
      id: string;
      code: string | null;
      name: string;
    } | null;
  };
};

const initialState: SaveLabOrderItemResultState = {};

export function LabOrderItemResultForm({
  hospitalSlug,
  labOrderId,
  item,
}: LabOrderItemResultFormProps) {
  const action = saveLabOrderItemResult.bind(null, hospitalSlug, labOrderId, item.id);
  const [state, formAction, pending] = useActionState(action, initialState);

  const displayName = item.lab_test?.name ?? item.test_name;
  const displayCode = item.lab_test?.code ?? null;

  return (
    <form action={formAction} className="rounded-xl border bg-background p-4">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-lg bg-muted p-2">
              <FlaskConical className="h-4 w-4 text-muted-foreground" />
            </div>
            <h3 className="font-medium">{displayName}</h3>
            {displayCode ? (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                {displayCode}
              </span>
            ) : null}
            {item.entered_at ? (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                Result entered
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                Awaiting result
              </span>
            )}
          </div>
        </div>

        <Button type="submit" disabled={pending}>
          <Save className="mr-2 h-4 w-4" />
          {pending ? "Saving..." : "Save Result"}
        </Button>
      </div>

      {state.message ? (
        <div
          className={`mt-4 rounded-md px-3 py-2 text-sm ${
            state.success
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border border-red-200 bg-red-50 text-red-700"
          }`}
        >
          {state.message}
        </div>
      ) : null}

      <div className="mt-4 grid gap-4">
        <label className="grid gap-2 text-sm">
          <span className="font-medium">Result Text</span>
          <textarea
            name="result_text"
            rows={4}
            defaultValue={item.result_text ?? ""}
            placeholder="Enter the laboratory result"
            className="rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2 text-sm">
            <span className="font-medium">Unit</span>
            <input
              name="unit"
              defaultValue={item.unit ?? ""}
              placeholder="mg/dL"
              className="h-11 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Reference Range</span>
            <input
              name="reference_range"
              defaultValue={item.reference_range ?? ""}
              placeholder="70 - 110"
              className="h-11 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
        </div>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Notes</span>
          <textarea
            name="notes"
            rows={3}
            defaultValue={item.notes ?? ""}
            placeholder="Optional internal note"
            className="rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
          />
        </label>
      </div>

      {item.entered_at ? (
        <p className="mt-4 text-sm text-muted-foreground">
          Last saved result is already on this order item.
        </p>
      ) : null}
    </form>
  );
}

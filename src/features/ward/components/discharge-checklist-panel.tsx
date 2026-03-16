"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  toggleDischargeChecklistItem,
  type ToggleDischargeChecklistItemState,
} from "@/features/ward/actions/toggle-discharge-checklist-item";

const initialState: ToggleDischargeChecklistItemState = {};

function ChecklistItemForm({
  hospitalSlug,
  admissionId,
  item,
}: {
  hospitalSlug: string;
  admissionId: string;
  item: {
    key: string;
    label: string;
    required: boolean;
    completed: boolean;
    notes: string | null;
  };
}) {
  const action = toggleDischargeChecklistItem.bind(
    null,
    hospitalSlug,
    admissionId,
    item.key,
    !item.completed
  );

  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="rounded-lg border p-3 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-medium">{item.label}</p>
          <p className="text-xs text-muted-foreground">
            {item.required ? "Required" : "Optional"}
          </p>
        </div>

        <span
          className={`rounded-full px-2 py-0.5 text-xs ${
            item.completed
              ? "bg-emerald-100 text-emerald-700"
              : "bg-amber-100 text-amber-700"
          }`}
        >
          {item.completed ? "completed" : "pending"}
        </span>
      </div>

      <textarea
        name="notes"
        defaultValue={item.notes ?? ""}
        placeholder="Optional notes"
        rows={2}
        className="w-full rounded-md border px-3 py-2 text-sm"
      />

      {state.message ? (
        <div className="text-xs text-muted-foreground">{state.message}</div>
      ) : null}

      <Button type="submit" size="sm" variant="outline" disabled={pending}>
        {pending ? "Saving..." : item.completed ? "Mark Pending" : "Mark Complete"}
      </Button>
    </form>
  );
}

export function DischargeChecklistPanel({
  hospitalSlug,
  admissionId,
  items,
  summary,
}: {
  hospitalSlug: string;
  admissionId: string;
  items: Array<{
    key: string;
    label: string;
    required: boolean;
    completed: boolean;
    notes: string | null;
  }>;
  summary: {
    total: number;
    completed: number;
    required_total: number;
    required_completed: number;
    ready: boolean;
  };
}) {
  return (
    <section className="space-y-4 rounded-xl border p-5">
      <div>
        <h2 className="text-lg font-semibold">Discharge Checklist</h2>
        <p className="text-sm text-muted-foreground">
          Required before final discharge.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Completed</p>
          <div className="mt-2 text-2xl font-semibold">
            {summary.completed}/{summary.total}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Required Done</p>
          <div className="mt-2 text-2xl font-semibold">
            {summary.required_completed}/{summary.required_total}
          </div>
        </div>
        <div className="rounded-lg border p-4">
          <p className="text-sm text-muted-foreground">Checklist Status</p>
          <div className="mt-2">
            {summary.ready ? (
              <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700">
                ready
              </span>
            ) : (
              <span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-700">
                pending items
              </span>
            )}
          </div>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
          No discharge checklist configured for this admission workflow yet.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <ChecklistItemForm
              key={item.key}
              hospitalSlug={hospitalSlug}
              admissionId={admissionId}
              item={item}
            />
          ))}
        </div>
      )}
    </section>
  );
}
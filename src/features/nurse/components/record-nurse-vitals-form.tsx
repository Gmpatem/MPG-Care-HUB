"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  recordNurseVitals,
  type RecordNurseVitalsState,
} from "@/features/nurse/actions/record-nurse-vitals";

const initialState: RecordNurseVitalsState = {};

export function RecordNurseVitalsForm({
  hospitalSlug,
  admissionId,
}: {
  hospitalSlug: string;
  admissionId: string;
}) {
  const action = recordNurseVitals.bind(null, hospitalSlug, admissionId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border p-4">
      <div>
        <h2 className="text-lg font-semibold">Record Vitals</h2>
        <p className="text-sm text-muted-foreground">
          Enter the latest nurse round vitals for this admitted patient.
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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="grid gap-2 text-sm">
          <span className="font-medium">Temperature °C</span>
          <input name="temperature_c" type="number" step="0.1" className="h-11 rounded-md border px-3" />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Systolic BP</span>
          <input name="blood_pressure_systolic" type="number" className="h-11 rounded-md border px-3" />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Diastolic BP</span>
          <input name="blood_pressure_diastolic" type="number" className="h-11 rounded-md border px-3" />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Pulse BPM</span>
          <input name="pulse_bpm" type="number" className="h-11 rounded-md border px-3" />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Respiratory Rate</span>
          <input name="respiratory_rate" type="number" className="h-11 rounded-md border px-3" />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">SpO2 %</span>
          <input name="spo2" type="number" className="h-11 rounded-md border px-3" />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Pain Score</span>
          <input name="pain_score" type="number" min="0" max="10" className="h-11 rounded-md border px-3" />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Weight kg</span>
          <input name="weight_kg" type="number" step="0.1" className="h-11 rounded-md border px-3" />
        </label>
      </div>

      <label className="grid gap-2 text-sm">
        <span className="font-medium">Notes</span>
        <textarea name="notes" rows={3} className="rounded-md border px-3 py-2" />
      </label>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save Vitals"}
      </Button>
    </form>
  );
}
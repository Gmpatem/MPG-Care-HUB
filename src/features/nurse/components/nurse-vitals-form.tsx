"use client";

import { useActionState } from "react";
import { HeartPulse, Save } from "lucide-react";

import {
  recordNurseVitals,
  type RecordNurseVitalsState,
} from "@/features/nurse/actions/record-nurse-vitals";

type Props = {
  hospitalSlug: string;
  admissionId: string;
  patientId: string;
};

const initialState: RecordNurseVitalsState = {};

export function NurseVitalsForm({
  hospitalSlug,
  admissionId,
  patientId,
}: Props) {
  const action = recordNurseVitals.bind(null, hospitalSlug, admissionId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <section className="rounded-2xl border p-4 sm:p-5">
      <div className="mb-4 flex items-center gap-2">
        <div className="rounded-lg bg-muted p-2">
          <HeartPulse className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <h3 className="text-base font-semibold">Record Vitals</h3>
          <p className="text-sm text-muted-foreground">
            Enter the latest observations carefully and save them into the admission chart.
          </p>
        </div>
      </div>

      <form action={formAction} className="space-y-4">
        <input type="hidden" name="patient_id" value={patientId} />

        {state?.message ? (
          <div
            className={`rounded-xl px-4 py-3 text-sm ${
              state.success
                ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                : "border border-red-200 bg-red-50 text-red-700"
            }`}
          >
            {state.message}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label className="grid gap-2 text-sm">
            <span className="font-medium">Temperature (°C)</span>
            <input
              name="temperature_c"
              type="number"
              step="0.1"
              className="h-11 rounded-xl border bg-background px-3 text-sm"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Systolic BP</span>
            <input
              name="blood_pressure_systolic"
              type="number"
              className="h-11 rounded-xl border bg-background px-3 text-sm"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Diastolic BP</span>
            <input
              name="blood_pressure_diastolic"
              type="number"
              className="h-11 rounded-xl border bg-background px-3 text-sm"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Pulse (bpm)</span>
            <input
              name="pulse_bpm"
              type="number"
              className="h-11 rounded-xl border bg-background px-3 text-sm"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Respiratory Rate</span>
            <input
              name="respiratory_rate"
              type="number"
              className="h-11 rounded-xl border bg-background px-3 text-sm"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">SpO2 (%)</span>
            <input
              name="spo2"
              type="number"
              className="h-11 rounded-xl border bg-background px-3 text-sm"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Pain Score (0-10)</span>
            <input
              name="pain_score"
              type="number"
              min="0"
              max="10"
              className="h-11 rounded-xl border bg-background px-3 text-sm"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Weight (kg)</span>
            <input
              name="weight_kg"
              type="number"
              step="0.1"
              className="h-11 rounded-xl border bg-background px-3 text-sm"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Height (cm)</span>
            <input
              name="height_cm"
              type="number"
              step="0.1"
              className="h-11 rounded-xl border bg-background px-3 text-sm"
            />
          </label>

          <label className="grid gap-2 text-sm xl:col-span-3">
            <span className="font-medium">Notes</span>
            <textarea
              name="notes"
              rows={3}
              className="rounded-xl border bg-background px-3 py-2 text-sm"
              placeholder="Optional nursing note linked to this vitals entry"
            />
          </label>
        </div>

        <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
          Record the values exactly as observed. Save the form, then re-open the chart if you need to continue with nurse notes or discharge work.
        </div>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={pending}
            className="inline-flex h-11 items-center rounded-xl bg-black px-4 text-sm font-medium text-white disabled:opacity-60"
          >
            <Save className="mr-2 h-4 w-4" />
            {pending ? "Saving Vitals..." : "Save Vitals"}
          </button>
        </div>
      </form>
    </section>
  );
}

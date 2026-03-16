"use client";

import { useActionState, useState } from "react";
import { checkInWithVitals } from "@/features/frontdesk/actions/check-in-with-vitals";
import { Button } from "@/components/ui/button";

type ActionState = {
  success?: boolean;
  error?: string;
};

const initialState: ActionState = {};

function Field({
  label,
  name,
  type = "number",
  step,
  min,
  max,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  step?: string;
  min?: string;
  max?: string;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium">{label}</span>
      <input
        name={name}
        type={type}
        step={step}
        min={min}
        max={max}
        placeholder={placeholder}
        className="h-10 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
      />
    </label>
  );
}

export function CheckInVitalsForm({
  hospitalSlug,
  appointmentId,
  patientId,
  defaultOpen = false,
}: {
  hospitalSlug: string;
  appointmentId: string;
  patientId: string;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const [captureVitals, setCaptureVitals] = useState(true);

  const action = checkInWithVitals.bind(null, hospitalSlug);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <div className="space-y-3">
      {!open ? (
        <Button type="button" size="sm" onClick={() => setOpen(true)}>
          Check In
        </Button>
      ) : null}

      {open ? (
        <form action={formAction} className="space-y-4 rounded-lg border bg-muted/20 p-4">
          <input type="hidden" name="appointment_id" value={appointmentId} />
          <input type="hidden" name="patient_id" value={patientId} />
          <input type="hidden" name="vitals_enabled" value={captureVitals ? "true" : "false"} />

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="font-semibold">Check-In + Intake Vitals</h3>
              <p className="text-sm text-muted-foreground">
                Record arrival and optional basic vitals in one step.
              </p>
            </div>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={captureVitals}
                onChange={(e) => setCaptureVitals(e.target.checked)}
              />
              Capture vitals
            </label>
          </div>

          {state?.error ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.error}
            </div>
          ) : null}

          {state?.success ? (
            <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              Patient checked in successfully.
            </div>
          ) : null}

          {captureVitals ? (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <Field label="Temperature (°C)" name="temperature_c" step="0.1" min="25" max="45" />
              <Field label="Systolic BP" name="blood_pressure_systolic" min="1" />
              <Field label="Diastolic BP" name="blood_pressure_diastolic" min="1" />
              <Field label="Pulse (bpm)" name="pulse_bpm" min="1" />
              <Field label="Respiratory Rate" name="respiratory_rate" min="1" />
              <Field label="SpO2 (%)" name="spo2" min="0" max="100" />
              <Field label="Weight (kg)" name="weight_kg" step="0.1" min="0.1" />
              <Field label="Height (cm)" name="height_cm" step="0.1" min="0.1" />
              <Field label="Pain Score (0-10)" name="pain_score" min="0" max="10" />
              <label className="grid gap-2 text-sm md:col-span-2 xl:col-span-3">
                <span className="font-medium">Notes</span>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Optional intake notes"
                  className="rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
            </div>
          ) : null}

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={pending}>
              {pending ? "Saving..." : "Confirm Check-In"}
            </Button>

            <Button
              type="button"
              variant="outline"
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              Close
            </Button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
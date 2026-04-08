"use client";

import { useActionState } from "react";
import { createNurseVitals } from "@/features/ward/actions/create-nurse-vitals";
import {
  FormSection,
  FormGrid,
  FormField,
  FormActionsBar,
  FormFeedback,
} from "@/components/forms/form-section";
import { SubmitButton } from "@/components/forms/submit-button";

type FormState = {
  success?: boolean;
  error?: string;
};

type Props = {
  hospitalSlug: string;
  admissionId: string;
  patientId: string;
  encounterId?: string | null;
  staff: Array<{ id: string; full_name: string }>;
};

const initialState: FormState = {};

export function NurseVitalsForm({
  hospitalSlug,
  admissionId,
  patientId,
  encounterId,
  staff,
}: Props) {
  const action = createNurseVitals.bind(null, hospitalSlug, admissionId);
  const [state, formAction] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5 rounded-xl border p-4 sm:p-5">
      <div>
        <h3 className="text-lg font-semibold">Record Nurse Vitals</h3>
        <p className="text-sm text-muted-foreground">
          Enter patient vitals during ward rounds.
        </p>
      </div>

      <input type="hidden" name="patient_id" value={patientId} />
      <input type="hidden" name="encounter_id" value={encounterId ?? ""} />

      {state?.error && <FormFeedback type="error" message={state.error} />}
      {state?.success && (
        <FormFeedback type="success" message="Vitals recorded successfully" />
      )}

      {/* Staff Selection */}
      <FormField label="Recorded by" name="recorded_by_staff_id" required>
        <select
          name="recorded_by_staff_id"
          required
          className="h-11 w-full rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
        >
          <option value="">Select nurse/staff</option>
          {staff.map((member) => (
            <option key={member.id} value={member.id}>
              {member.full_name}
            </option>
          ))}
        </select>
      </FormField>

      {/* Vitals Grid */}
      <FormSection title="Vital Signs" description="Enter all available measurements">
        <FormGrid cols={4} dense>
          <FormField label="Temperature °C" name="temperature_c" optional>
            <input
              name="temperature_c"
              type="number"
              step="0.1"
              placeholder="36.5"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </FormField>
          <FormField label="BP Systolic" name="blood_pressure_systolic" optional>
            <input
              name="blood_pressure_systolic"
              type="number"
              placeholder="120"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </FormField>
          <FormField label="BP Diastolic" name="blood_pressure_diastolic" optional>
            <input
              name="blood_pressure_diastolic"
              type="number"
              placeholder="80"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </FormField>
          <FormField label="Pulse BPM" name="pulse_bpm" optional>
            <input
              name="pulse_bpm"
              type="number"
              placeholder="72"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </FormField>
          <FormField label="Respiratory Rate" name="respiratory_rate" optional>
            <input
              name="respiratory_rate"
              type="number"
              placeholder="16"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </FormField>
          <FormField label="SpO2 %" name="spo2" optional>
            <input
              name="spo2"
              type="number"
              placeholder="98"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </FormField>
          <FormField label="Pain (0-10)" name="pain_score" optional>
            <input
              name="pain_score"
              type="number"
              min="0"
              max="10"
              placeholder="0"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </FormField>
          <FormField label="Weight kg" name="weight_kg" optional>
            <input
              name="weight_kg"
              type="number"
              step="0.1"
              placeholder="70.0"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />
          </FormField>
        </FormGrid>
      </FormSection>

      {/* Notes */}
      <FormField label="Notes" name="notes" optional>
        <textarea
          name="notes"
          rows={3}
          placeholder="Additional observations or context..."
          className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
        />
      </FormField>

      <FormActionsBar>
        <SubmitButton pendingText="Saving vitals...">Save Vitals</SubmitButton>
      </FormActionsBar>
    </form>
  );
}

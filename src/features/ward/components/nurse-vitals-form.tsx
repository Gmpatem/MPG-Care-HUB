"use client";

import { useActionState } from "react";
import { createNurseVitals } from "@/features/ward/actions/create-nurse-vitals";

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
    <form action={formAction} className="space-y-4 rounded-lg border p-4">
      <div>
        <h3 className="text-lg font-semibold">Record Nurse Vitals</h3>
        <p className="text-sm text-muted-foreground">
          Enter patient vitals during ward rounds.
        </p>
      </div>

      <input type="hidden" name="patient_id" value={patientId} />
      <input type="hidden" name="encounter_id" value={encounterId ?? ""} />

      <div>
        <label className="block text-sm font-medium">Recorded by</label>
        <select name="recorded_by_staff_id" className="mt-1 w-full rounded-md border px-3 py-2" required>
          <option value="">Select nurse/staff</option>
          {staff.map((member) => (
            <option key={member.id} value={member.id}>
              {member.full_name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-3 md:grid-cols-4">
        <input name="temperature_c" type="number" step="0.1" placeholder="Temp °C" className="rounded-md border px-3 py-2" />
        <input name="blood_pressure_systolic" type="number" placeholder="BP systolic" className="rounded-md border px-3 py-2" />
        <input name="blood_pressure_diastolic" type="number" placeholder="BP diastolic" className="rounded-md border px-3 py-2" />
        <input name="pulse_bpm" type="number" placeholder="Pulse BPM" className="rounded-md border px-3 py-2" />
        <input name="respiratory_rate" type="number" placeholder="Respiratory rate" className="rounded-md border px-3 py-2" />
        <input name="spo2" type="number" placeholder="SpO2" className="rounded-md border px-3 py-2" />
        <input name="pain_score" type="number" min="0" max="10" placeholder="Pain score" className="rounded-md border px-3 py-2" />
        <input name="weight_kg" type="number" step="0.1" placeholder="Weight kg" className="rounded-md border px-3 py-2" />
      </div>

      <div>
        <textarea
          name="notes"
          rows={3}
          placeholder="Notes"
          className="w-full rounded-md border px-3 py-2"
        />
      </div>

      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      {state?.success ? <p className="text-sm text-green-600">Vitals recorded.</p> : null}

      <button type="submit" className="rounded-md bg-black px-4 py-2 text-white">
        Save vitals
      </button>
    </form>
  );
}



"use client";

import { useActionState } from "react";
import { createNurseNote, type CreateNurseNoteState } from "@/features/ward/actions/create-nurse-note";
import {
  FormSection,
  FormField,
  FormActionsBar,
  FormFeedback,
} from "@/components/forms/form-section";
import { SubmitButton } from "@/components/forms/submit-button";

const initialState: CreateNurseNoteState = {};

export function NurseNoteForm({
  hospitalSlug,
  admissionId,
}: {
  hospitalSlug: string;
  admissionId: string;
}) {
  const action = createNurseNote.bind(null, hospitalSlug, admissionId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5 rounded-xl border p-4 sm:p-5">
      <div>
        <h2 className="text-lg font-semibold">Add Nurse Note</h2>
        <p className="text-sm text-muted-foreground">
          Record intake, routine monitoring, handoff, incident, or discharge preparation notes.
        </p>
      </div>

      {state.message && (
        <FormFeedback
          type={state.success ? "success" : "error"}
          message={state.message}
        />
      )}

      <FormSection>
        <FormField label="Note Type" name="note_type" required>
          <select
            name="note_type"
            defaultValue="routine_monitoring"
            required
            className="h-11 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="intake">Intake</option>
            <option value="routine_monitoring">Routine Monitoring</option>
            <option value="handoff">Handoff</option>
            <option value="incident">Incident</option>
            <option value="discharge_prep">Discharge Preparation</option>
          </select>
        </FormField>

        <FormField label="Note" name="note_text" required>
          <textarea
            name="note_text"
            rows={5}
            required
            className="rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="Enter nursing observation, ward update, patient response, handoff details, or discharge preparation note..."
          />
        </FormField>
      </FormSection>

      <FormActionsBar>
        <SubmitButton pendingText="Saving note...">Save Nurse Note</SubmitButton>
      </FormActionsBar>
    </form>
  );
}

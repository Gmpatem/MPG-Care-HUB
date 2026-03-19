"use client";

import { useActionState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { InlineFeedback } from "@/components/feedback/inline-feedback";
import {
  addNurseNote,
  type AddNurseNoteState,
} from "@/features/nurse/actions/add-nurse-note";

const initialState: AddNurseNoteState = {};

export function AddNurseNoteForm({
  hospitalSlug,
  admissionId,
}: {
  hospitalSlug: string;
  admissionId: string;
}) {
  const action = addNurseNote.bind(null, hospitalSlug, admissionId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4 rounded-xl border p-4">
      <div>
        <h2 className="text-lg font-semibold">Add Nurse Note</h2>
        <p className="text-sm text-muted-foreground">
          Record routine observations, escalation notes, and bedside updates.
        </p>
      </div>

      {state.message ? (
        <InlineFeedback
          message={state.message}
          tone={state.success ? "success" : "error"}
        />
      ) : null}

      <label className="grid gap-2 text-sm">
        <span className="font-medium">Note Type</span>
        <select name="note_type" className="h-11 rounded-md border px-3">
          <option value="routine_monitoring">Routine Monitoring</option>
          <option value="escalation">Escalation</option>
          <option value="response_to_treatment">Response to Treatment</option>
          <option value="discharge_preparation">Discharge Preparation</option>
        </select>
      </label>

      <label className="grid gap-2 text-sm">
        <span className="font-medium">Note</span>
        <textarea name="note_text" rows={5} className="rounded-md border px-3 py-2" />
      </label>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save Nurse Note"}
      </Button>
    </form>
  );
}


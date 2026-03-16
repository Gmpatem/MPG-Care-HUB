"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
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

  return (
    <form action={formAction} className="space-y-4 rounded-xl border p-4">
      <div>
        <h2 className="text-lg font-semibold">Add Nurse Note</h2>
        <p className="text-sm text-muted-foreground">
          Record routine observations, escalation notes, and bedside updates.
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
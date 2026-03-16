"use client";

import { useActionState } from "react";
import { createNurseNote, type CreateNurseNoteState } from "@/features/ward/actions/create-nurse-note";
import { Button } from "@/components/ui/button";

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
    <form action={formAction} className="space-y-4 rounded-xl border p-5">
      <div>
        <h2 className="text-lg font-semibold">Add Nurse Note</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Record intake, routine monitoring, handoff, incident, or discharge preparation notes.
        </p>
      </div>

      {state.message ? (
        <div className={`rounded-md px-3 py-2 text-sm ${
          state.success
            ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border border-red-200 bg-red-50 text-red-700"
        }`}>
          {state.message}
        </div>
      ) : null}

      <label className="grid gap-2 text-sm">
        <span className="font-medium">Note Type</span>
        <select
          name="note_type"
          defaultValue="routine_monitoring"
          className="h-11 rounded-md border bg-background px-3 text-sm"
        >
          <option value="intake">intake</option>
          <option value="routine_monitoring">routine_monitoring</option>
          <option value="handoff">handoff</option>
          <option value="incident">incident</option>
          <option value="discharge_prep">discharge_prep</option>
        </select>
      </label>

      <label className="grid gap-2 text-sm">
        <span className="font-medium">Note</span>
        <textarea
          name="note_text"
          rows={5}
          className="rounded-md border bg-background px-3 py-2 text-sm"
          placeholder="Enter nursing observation, ward update, patient response, handoff details, or discharge preparation note..."
        />
      </label>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save Nurse Note"}
      </Button>
    </form>
  );
}
"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  addDoctorRoundNote,
  type AddDoctorRoundNoteState,
} from "@/features/doctor/actions/add-doctor-round-note";

const initialState: AddDoctorRoundNoteState = {};

export function AddDoctorRoundNoteForm({
  hospitalSlug,
  admissionId,
}: {
  hospitalSlug: string;
  admissionId: string;
}) {
  const action = addDoctorRoundNote.bind(null, hospitalSlug, admissionId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-4 rounded-xl border p-4">
      <div>
        <h3 className="font-medium">Add Doctor Round Note</h3>
        <p className="text-sm text-muted-foreground">
          Record the current round assessment and plan.
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
        <span className="font-medium">Subjective</span>
        <textarea
          name="subjective_notes"
          rows={2}
          className="rounded-md border px-3 py-2"
          placeholder="Symptoms, complaints, patient report"
        />
      </label>

      <label className="grid gap-2 text-sm">
        <span className="font-medium">Objective</span>
        <textarea
          name="objective_notes"
          rows={2}
          className="rounded-md border px-3 py-2"
          placeholder="Exam findings, observed status"
        />
      </label>

      <label className="grid gap-2 text-sm">
        <span className="font-medium">Assessment</span>
        <textarea
          name="assessment_notes"
          rows={2}
          className="rounded-md border px-3 py-2"
          placeholder="Clinical assessment"
        />
      </label>

      <label className="grid gap-2 text-sm">
        <span className="font-medium">Plan</span>
        <textarea
          name="plan_notes"
          rows={2}
          className="rounded-md border px-3 py-2"
          placeholder="Treatment or next steps"
        />
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          name="discharge_recommended"
          value="true"
          className="h-4 w-4"
        />
        <span>Recommend discharge during this round</span>
      </label>

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Save Round Note"}
      </Button>
    </form>
  );
}
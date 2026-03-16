"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  finalizePatientDischarge,
  type FinalizePatientDischargeState,
} from "@/features/ward/actions/finalize-patient-discharge";

const initialState: FinalizePatientDischargeState = {};

export function FinalizePatientDischargeForm({
  hospitalSlug,
  admissionId,
  disabled,
}: {
  hospitalSlug: string;
  admissionId: string;
  disabled: boolean;
}) {
  const action = finalizePatientDischarge.bind(null, hospitalSlug, admissionId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-3">
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
        <span className="font-medium">Discharge Notes</span>
        <textarea
          name="discharge_notes"
          rows={3}
          className="rounded-md border px-3 py-2"
          placeholder="Optional final discharge note"
        />
      </label>

      <Button type="submit" disabled={pending || disabled}>
        {pending ? "Finalizing..." : "Finalize Discharge"}
      </Button>
    </form>
  );
}
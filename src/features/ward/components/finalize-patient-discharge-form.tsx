"use client";

import { useActionState, useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";
import { InlineFeedback } from "@/components/feedback/inline-feedback";
import { emitAppToast } from "@/lib/ui/app-toast";
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
  const formRef = useRef<HTMLFormElement>(null);
  const toastFiredRef = useRef<string | null>(null);

  useEffect(() => {
    if (!state.message) return;

    const fingerprint = `${state.success ? "success" : "error"}:${state.message}`;
    if (toastFiredRef.current === fingerprint) return;

    toastFiredRef.current = fingerprint;

    emitAppToast({
      title: state.success ? "Discharge finalized" : "Discharge failed",
      description: state.message,
      tone: state.success ? "success" : "error",
    });
  }, [state.success, state.message]);

  function handleConfirmSubmit() {
    if (disabled || pending) return;

    const confirmed = window.confirm(
      "Finalize patient discharge now?\n\nThis will mark the admission as discharged and release the assigned bed."
    );

    if (confirmed) {
      formRef.current?.requestSubmit();
    }
  }

  return (
    <form ref={formRef} action={formAction} className="space-y-3">
      {state.message ? (
        <InlineFeedback
          message={state.message}
          tone={state.success ? "success" : "error"}
        />
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

      <Button type="button" disabled={pending || disabled} onClick={handleConfirmSubmit}>
        {pending ? "Finalizing..." : "Finalize Discharge"}
      </Button>
    </form>
  );
}

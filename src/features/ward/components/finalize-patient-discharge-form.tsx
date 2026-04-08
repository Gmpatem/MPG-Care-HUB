"use client";

import { useActionState, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { InlineFeedback } from "@/components/feedback/inline-feedback";
import { emitAppToast } from "@/lib/ui/app-toast";
import {
  ConfirmationModal,
  ConfirmationPanel,
} from "@/components/overlays";
import {
  finalizePatientDischarge,
  type FinalizePatientDischargeState,
} from "@/features/ward/actions/finalize-patient-discharge";

const initialState: FinalizePatientDischargeState = {};

export function FinalizePatientDischargeForm({
  hospitalSlug,
  admissionId,
  disabled,
  patientName,
  bedNumber,
  admissionDate,
}: {
  hospitalSlug: string;
  admissionId: string;
  disabled: boolean;
  /** Patient name for confirmation display */
  patientName?: string;
  /** Bed number for confirmation display */
  bedNumber?: string;
  /** Admission date for confirmation display */
  admissionDate?: string;
}) {
  const action = finalizePatientDischarge.bind(null, hospitalSlug, admissionId);
  const [state, formAction, pending] = useActionState(action, initialState);
  const formRef = useRef<HTMLFormElement>(null);
  const toastFiredRef = useRef<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // Handle state changes outside of useEffect to avoid cascading renders
  if (state.message && toastFiredRef.current !== `${state.success}:${state.message}`) {
    toastFiredRef.current = `${state.success}:${state.message}`;
    
    // Use setTimeout to defer toast and modal closing to next tick
    setTimeout(() => {
      emitAppToast({
        title: state.success ? "Discharge finalized" : "Discharge failed",
        description: state.message,
        tone: state.success ? "success" : "error",
      });

      // Close modal on success
      if (state.success) {
        setShowConfirm(false);
      }
    }, 0);
  }

  function handleConfirmSubmit() {
    if (disabled || pending) return;
    formRef.current?.requestSubmit();
  }

  const facts = [
    ...(patientName ? [{ label: "Patient", value: patientName, highlight: true }] : []),
    ...(bedNumber ? [{ label: "Current Bed", value: bedNumber }] : []),
    ...(admissionDate ? [{ label: "Admitted", value: admissionDate }] : []),
  ];

  return (
    <>
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

        <Button
          type="button"
          disabled={pending || disabled}
          onClick={() => setShowConfirm(true)}
        >
          {pending ? "Finalizing..." : "Finalize Discharge"}
        </Button>
      </form>

      {/* Rich Confirmation Dialog */}
      <ConfirmationModal
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Finalize Patient Discharge?"
        description="This action will mark the admission as discharged and release the assigned bed."
        onConfirm={handleConfirmSubmit}
        confirmLabel="Finalize Discharge"
        confirmVariant="default"
        pending={pending}
        confirmDisabled={disabled}
      >
        <ConfirmationPanel
          title="Review Before Finalizing"
          severity="warning"
          facts={facts.length > 0 ? facts : undefined}
          blockers={
            disabled
              ? [
                  {
                    message: "Discharge checklist incomplete",
                    requiredAction: "Complete all required discharge tasks first",
                  },
                ]
              : undefined
          }
        />
      </ConfirmationModal>
    </>
  );
}

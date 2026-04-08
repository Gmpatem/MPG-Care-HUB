"use client";

import { useActionState, useState } from "react";
import {
  ConfirmationModal,
  ConfirmationPanel,
} from "@/components/overlays";
import { completeLabOrder, type CompleteLabOrderState } from "@/features/lab/actions/complete-lab-order";

const initialState: CompleteLabOrderState = {};

export function CompleteLabOrderButton({
  hospitalSlug,
  labOrderId,
  disabled = false,
  patientName,
  testNames,
}: {
  hospitalSlug: string;
  labOrderId: string;
  disabled?: boolean;
  /** Patient name for confirmation display */
  patientName?: string;
  /** Test names for confirmation display */
  testNames?: string[];
}) {
  const [showConfirm, setShowConfirm] = useState(false);
  
  const action = async () => {
    return completeLabOrder(hospitalSlug, labOrderId);
  };

  const [state, formAction, pending] = useActionState(action, initialState);

  function handleConfirm() {
    formAction();
    setShowConfirm(false);
  }

  // Build facts for confirmation panel
  const facts = [
    ...(patientName ? [{ label: "Patient", value: patientName, highlight: true }] : []),
    ...(testNames && testNames.length > 0
      ? [{ label: "Tests", value: testNames.join(", ") }]
      : []),
  ];

  return (
    <>
      <button
        type="button"
        disabled={disabled || pending}
        onClick={() => setShowConfirm(true)}
        className="inline-flex h-10 items-center justify-center rounded-md bg-black px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Completing..." : disabled ? "Already Completed" : "Mark Order Completed"}
      </button>

      {state?.message ? (
        <p
          className={`mt-2 text-sm ${
            state.success ? "text-emerald-700" : "text-red-600"
          }`}
        >
          {state.message}
        </p>
      ) : null}

      {/* Rich Confirmation Dialog */}
      <ConfirmationModal
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Complete Lab Order?"
        description="This will mark all tests in this order as completed and make results available."
        onConfirm={handleConfirm}
        confirmLabel="Complete Order"
        pending={pending}
        confirmDisabled={disabled}
      >
        <ConfirmationPanel
          title="Review Before Completing"
          severity="info"
          facts={facts.length > 0 ? facts : undefined}
          blockers={
            disabled
              ? [
                  {
                    message: "Order already completed",
                    requiredAction: "This lab order has already been finalized",
                  },
                ]
              : undefined
          }
        />
      </ConfirmationModal>
    </>
  );
}

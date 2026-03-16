"use client";

import { useActionState } from "react";
import { completeLabOrder, type CompleteLabOrderState } from "@/features/lab/actions/complete-lab-order";

const initialState: CompleteLabOrderState = {};

export function CompleteLabOrderButton({
  hospitalSlug,
  labOrderId,
  disabled,
}: {
  hospitalSlug: string;
  labOrderId: string;
  disabled?: boolean;
}) {
  const action = async () => {
    return completeLabOrder(hospitalSlug, labOrderId);
  };

  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-3">
      <button
        type="submit"
        disabled={disabled || pending}
        className="inline-flex h-10 items-center justify-center rounded-md bg-black px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Completing..." : disabled ? "Already Completed" : "Mark Order Completed"}
      </button>

      {state?.message ? (
        <p
          className={`text-sm ${
            state.success ? "text-emerald-700" : "text-red-600"
          }`}
        >
          {state.message}
        </p>
      ) : null}
    </form>
  );
}

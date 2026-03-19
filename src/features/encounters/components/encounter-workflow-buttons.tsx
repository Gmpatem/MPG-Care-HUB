"use client";

import { useActionState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { EncounterWorkflowActionState } from "@/features/encounters/actions/update-encounter-workflow";

type WorkflowAction = (
  prevState: EncounterWorkflowActionState,
  formData: FormData
) => Promise<EncounterWorkflowActionState>;

function WorkflowActionButton({
  action,
  label,
  pendingLabel,
  variant = "default",
  confirmMessage,
}: {
  action: WorkflowAction;
  label: string;
  pendingLabel?: string;
  variant?: "default" | "outline";
  confirmMessage?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const isSuccess = !!state.success;
  const isError = !!state.message && !state.success;

  return (
    <div className="space-y-2">
      <form
        action={formAction}
        onSubmit={(event) => {
          if (confirmMessage && typeof window !== "undefined") {
            const confirmed = window.confirm(confirmMessage);
            if (!confirmed) {
              event.preventDefault();
            }
          }
        }}
      >
        <Button type="submit" variant={variant} disabled={pending}>
          {pending ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {pendingLabel ?? "Updating..."}
            </>
          ) : (
            label
          )}
        </Button>
      </form>

      {isSuccess ? (
        <p className="text-xs text-emerald-700 dark:text-emerald-400">{state.message}</p>
      ) : null}

      {isError ? (
        <p className="text-xs text-destructive">{state.message}</p>
      ) : null}
    </div>
  );
}

export function EncounterWorkflowButtons({
  stage,
  isCompleted,
  markAwaitingResultsAction,
  markResultsReviewAction,
  markTreatmentAction,
  markAdmissionAction,
  finalizeAction,
}: {
  stage: string;
  isCompleted: boolean;
  markAwaitingResultsAction: WorkflowAction;
  markResultsReviewAction: WorkflowAction;
  markTreatmentAction: WorkflowAction;
  markAdmissionAction: WorkflowAction;
  finalizeAction: WorkflowAction;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {!isCompleted && stage === "initial_review" ? (
        <>
          <WorkflowActionButton
            action={markAwaitingResultsAction}
            label="Move to Awaiting Results"
            pendingLabel="Moving..."
          />

          <WorkflowActionButton
            action={markTreatmentAction}
            label="Mark Treatment Decided"
            pendingLabel="Saving..."
            variant="outline"
          />

          <WorkflowActionButton
            action={markAdmissionAction}
            label="Request Admission"
            pendingLabel="Requesting..."
            variant="outline"
            confirmMessage="Request admission for this patient now?"
          />
        </>
      ) : null}

      {!isCompleted && stage === "awaiting_results" ? (
        <WorkflowActionButton
          action={markResultsReviewAction}
          label="Mark Results Review"
          pendingLabel="Updating..."
        />
      ) : null}

      {!isCompleted && stage === "results_review" ? (
        <>
          <WorkflowActionButton
            action={markTreatmentAction}
            label="Mark Treatment Decided"
            pendingLabel="Saving..."
          />

          <WorkflowActionButton
            action={markAdmissionAction}
            label="Request Admission"
            pendingLabel="Requesting..."
            variant="outline"
            confirmMessage="Request admission for this patient now?"
          />
        </>
      ) : null}

      {!isCompleted && stage === "treatment_decided" ? (
        <WorkflowActionButton
          action={finalizeAction}
          label="Finalize Encounter"
          pendingLabel="Finalizing..."
          confirmMessage="Finalize this encounter now? This will complete the doctor workflow for this visit."
        />
      ) : null}

      {!isCompleted && stage === "admission_requested" ? (
        <WorkflowActionButton
          action={finalizeAction}
          label="Finalize After Handoff"
          pendingLabel="Finalizing..."
          confirmMessage="Finalize this encounter after admission handoff?"
        />
      ) : null}

      {isCompleted ? (
        <div className="rounded-md border border-slate-300 bg-white/70 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-900/40">
          No further stage transition needed.
        </div>
      ) : null}
    </div>
  );
}

"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  ConfirmationModal,
  CompactConfirmation,
} from "@/components/overlays";
import { requestPatientDischarge } from "@/features/doctor/actions/request-patient-discharge";

export function RequestDischargeButton({
  hospitalSlug,
  admissionId,
  disabled = false,
  alreadyRequested = false,
  patientName,
}: {
  hospitalSlug: string;
  admissionId: string;
  disabled?: boolean;
  alreadyRequested?: boolean;
  /** Patient name for confirmation display */
  patientName?: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  function handleConfirm() {
    setError(null);
    setShowConfirm(false);

    startTransition(async () => {
      try {
        await requestPatientDischarge(hospitalSlug, admissionId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to request discharge.");
      }
    });
  }

  return (
    <>
      <div className="space-y-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={pending || disabled || alreadyRequested}
          onClick={() => setShowConfirm(true)}
        >
          {alreadyRequested ? "Discharge Requested" : pending ? "Requesting..." : "Request Discharge"}
        </Button>

        {error ? (
          <div className="text-sm text-red-600">{error}</div>
        ) : null}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmationModal
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Request Patient Discharge?"
        onConfirm={handleConfirm}
        confirmLabel="Request Discharge"
        pending={pending}
      >
        <CompactConfirmation
          action="Request discharge for"
          target={patientName || "this patient"}
          consequence="This will notify nursing staff to begin the discharge clearance process."
          severity="info"
        />
      </ConfirmationModal>
    </>
  );
}

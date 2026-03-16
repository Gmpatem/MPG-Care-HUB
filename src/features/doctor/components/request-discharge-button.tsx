"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { requestPatientDischarge } from "@/features/doctor/actions/request-patient-discharge";

export function RequestDischargeButton({
  hospitalSlug,
  admissionId,
  disabled = false,
  alreadyRequested = false,
}: {
  hospitalSlug: string;
  admissionId: string;
  disabled?: boolean;
  alreadyRequested?: boolean;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleClick() {
    setError(null);

    startTransition(async () => {
      try {
        await requestPatientDischarge(hospitalSlug, admissionId);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to request discharge.");
      }
    });
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending || disabled || alreadyRequested}
        onClick={handleClick}
      >
        {alreadyRequested ? "Discharge Requested" : pending ? "Requesting..." : "Request Discharge"}
      </Button>

      {error ? (
        <div className="text-sm text-red-600">{error}</div>
      ) : null}
    </div>
  );
}
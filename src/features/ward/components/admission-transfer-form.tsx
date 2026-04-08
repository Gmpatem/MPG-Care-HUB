"use client";

import { useActionState } from "react";
import { createAdmissionTransfer, type CreateAdmissionTransferState } from "@/features/ward/actions/create-admission-transfer";
import {
  FormSection,
  FormField,
  FormActionsBar,
  FormFeedback,
} from "@/components/forms/form-section";
import { SubmitButton } from "@/components/forms/submit-button";

const initialState: CreateAdmissionTransferState = {};

export function AdmissionTransferForm({
  hospitalSlug,
  admissionId,
  wards,
  beds,
  currentWardId,
}: {
  hospitalSlug: string;
  admissionId: string;
  wards: Array<{ id: string; name: string; code: string | null }>;
  beds: Array<{ id: string; ward_id: string; bed_number: string }>;
  currentWardId: string | null;
}) {
  const action = createAdmissionTransfer.bind(null, hospitalSlug, admissionId);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-5 rounded-xl border p-4 sm:p-5">
      <div>
        <h2 className="text-lg font-semibold">Transfer Patient</h2>
        <p className="text-sm text-muted-foreground">
          Move this admission to another ward or bed when the hospital workflow allows it.
        </p>
      </div>

      {state.message && (
        <FormFeedback
          type={state.success ? "success" : "error"}
          message={state.message}
        />
      )}

      <FormSection>
        <FormField label="Destination Ward" name="to_ward_id" required>
          <select
            name="to_ward_id"
            defaultValue=""
            required
            className="h-11 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">Select ward</option>
            {wards
              .filter((ward) => ward.id !== currentWardId)
              .map((ward) => (
                <option key={ward.id} value={ward.id}>
                  {ward.name} {ward.code ? `(${ward.code})` : ""}
                </option>
              ))}
          </select>
        </FormField>

        <FormField label="Destination Bed" name="to_bed_id" optional>
          <select
            name="to_bed_id"
            defaultValue=""
            className="h-11 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
          >
            <option value="">No bed / assign later</option>
            {beds.map((bed) => (
              <option key={bed.id} value={bed.id}>
                {bed.bed_number}
              </option>
            ))}
          </select>
        </FormField>

        <FormField
          label="Transfer Reason"
          name="transfer_reason"
          optional
          helper="Explain why the patient is being moved"
        >
          <textarea
            name="transfer_reason"
            rows={3}
            className="rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            placeholder="e.g., Patient requires specialized care available in destination ward"
          />
        </FormField>
      </FormSection>

      <FormActionsBar>
        <SubmitButton pendingText="Transferring...">Record Transfer</SubmitButton>
      </FormActionsBar>
    </form>
  );
}

"use client";

import { useActionState } from "react";
import { createAdmissionTransfer, type CreateAdmissionTransferState } from "@/features/ward/actions/create-admission-transfer";
import { Button } from "@/components/ui/button";

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
    <form action={formAction} className="space-y-4 rounded-xl border p-5">
      <div>
        <h2 className="text-lg font-semibold">Transfer Patient</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Move this admission to another ward or bed when the hospital workflow allows it.
        </p>
      </div>

      {state.message ? (
        <div className={`rounded-md px-3 py-2 text-sm ${
          state.success
            ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
            : "border border-red-200 bg-red-50 text-red-700"
        }`}>
          {state.message}
        </div>
      ) : null}

      <label className="grid gap-2 text-sm">
        <span className="font-medium">Destination Ward</span>
        <select name="to_ward_id" defaultValue="" className="h-11 rounded-md border bg-background px-3 text-sm">
          <option value="">Select ward</option>
          {wards
            .filter((ward) => ward.id !== currentWardId)
            .map((ward) => (
              <option key={ward.id} value={ward.id}>
                {ward.name} {ward.code ? `(${ward.code})` : ""}
              </option>
            ))}
        </select>
      </label>

      <label className="grid gap-2 text-sm">
        <span className="font-medium">Destination Bed</span>
        <select name="to_bed_id" defaultValue="" className="h-11 rounded-md border bg-background px-3 text-sm">
          <option value="">No bed / assign later</option>
          {beds.map((bed) => (
            <option key={bed.id} value={bed.id}>
              {bed.bed_number}
            </option>
          ))}
        </select>
      </label>

      <label className="grid gap-2 text-sm">
        <span className="font-medium">Transfer Reason</span>
        <textarea
          name="transfer_reason"
          rows={3}
          className="rounded-md border bg-background px-3 py-2 text-sm"
          placeholder="Why is the patient being moved?"
        />
      </label>

      <Button type="submit" disabled={pending}>
        {pending ? "Transferring..." : "Record Transfer"}
      </Button>
    </form>
  );
}
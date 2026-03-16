"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import {
  nurseDischargeClearance,
  type NurseDischargeClearanceState
} from "@/features/nurse/actions/nurse-discharge-clearance";

const initialState: NurseDischargeClearanceState = {};

export function NurseDischargeClearanceForm({
  hospitalSlug,
  admissionId
}:{
  hospitalSlug:string
  admissionId:string
}){

  const action = nurseDischargeClearance.bind(null,hospitalSlug,admissionId);

  const [state,formAction,pending] = useActionState(action,initialState);

  return (

    <form action={formAction} className="space-y-4 rounded-xl border p-4">

      <div>
        <h2 className="text-lg font-semibold">Nurse Discharge Clearance</h2>
        <p className="text-sm text-muted-foreground">
          Confirm the patient is stable and ready for discharge.
        </p>
      </div>

      {state.message && (
        <div className="text-sm rounded-md border px-3 py-2">
          {state.message}
        </div>
      )}

      <textarea
        name="clearance_notes"
        placeholder="Notes before discharge..."
        rows={4}
        className="w-full rounded-md border px-3 py-2"
      />

      <Button type="submit" disabled={pending}>
        {pending ? "Saving..." : "Clear Patient For Discharge"}
      </Button>

    </form>

  );
}
"use client";

import { useActionState, useMemo, useState } from "react";
import { createAdmissionIntake } from "@/features/ward/actions/create-admission-intake";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type RequestRow = {
  id: string;
  hospital_id: string;
  patient_id: string;
  appointment_id: string | null;
  provider_staff_id: string | null;
  encounter_datetime: string | null;
  stage: string | null;
  status: string | null;
  chief_complaint: string | null;
  diagnosis_text: string | null;
  final_notes: string | null;
  patients: {
    id: string;
    patient_number: string | null;
    first_name: string;
    last_name: string;
    middle_name: string | null;
  } | null;
  staff: {
    id: string;
    full_name: string;
  } | null;
};

type WardLite = {
  id: string;
  name: string;
  ward_type: string | null;
};

type BedLite = {
  id: string;
  ward_id: string | null;
  bed_number: string | null;
};

type ActionState = {
  success?: boolean;
  error?: string;
};

const initialState: ActionState = {};

function patientName(row: RequestRow) {
  const p = row.patients;
  if (!p) return "Unknown patient";
  return [p.first_name, p.middle_name, p.last_name].filter(Boolean).join(" ");
}

function IntakeForm({
  hospitalSlug,
  row,
  wards,
  beds,
}: {
  hospitalSlug: string;
  row: RequestRow;
  wards: WardLite[];
  beds: BedLite[];
}) {
  const action = createAdmissionIntake.bind(null, hospitalSlug);
  const [state, formAction, pending] = useActionState(action, initialState);
  const [selectedWard, setSelectedWard] = useState("");

  const wardBeds = useMemo(
    () => beds.filter((bed) => !selectedWard || bed.ward_id === selectedWard),
    [beds, selectedWard]
  );

  return (
    <form action={formAction} className="space-y-4 rounded-lg border bg-muted/20 p-4">
      {state?.message && state?.success === false ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.message}
        </div>
      ) : null}

      {state?.success ? (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
          Admission created successfully.
        </div>
      ) : null}

      <input
        type="hidden"
        name="admitting_doctor_staff_id"
        value={row.provider_staff_id ?? ""}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm">
          <span className="font-medium">Ward</span>
          <select
            name="ward_id"
            value={selectedWard}
            onChange={(e) => setSelectedWard(e.target.value)}
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">No ward selected</option>
            {wards.map((ward) => (
              <option key={ward.id} value={ward.id}>
                {ward.name}{ward.ward_type ? ` · ${ward.ward_type}` : ""}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Bed</span>
          <select
            name="bed_id"
            defaultValue=""
            className="h-10 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">No bed selected</option>
            {wardBeds.map((bed) => (
              <option key={bed.id} value={bed.id}>
                {bed.bed_number ?? "Unnamed bed"}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm md:col-span-2">
          <span className="font-medium">Admission Reason</span>
          <textarea
            name="admission_reason"
            rows={3}
            defaultValue={row.final_notes ?? row.diagnosis_text ?? row.chief_complaint ?? ""}
            className="rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="Reason for admission"
          />
        </label>
      </div>

      <Button type="submit" disabled={pending}>
        {pending ? "Creating..." : "Admit Patient"}
      </Button>
    </form>
  );
}

export function WardAdmissionIntakePage({
  hospitalSlug,
  requests,
  wards,
  beds,
}: {
  hospitalSlug: string;
  requests: RequestRow[];
  wards: WardLite[];
  beds: BedLite[];
}) {
  return (
    <main className="space-y-6">
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Ward Admission Intake</CardTitle>
          <CardDescription>
            Receive doctor admission requests, assign ward and bed, and admit patients into inpatient flow.
          </CardDescription>
        </CardHeader>

        <CardContent className="py-5">
          {requests.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              No pending admission requests right now.
            </div>
          ) : (
            <div className="space-y-6">
              {requests.map((row) => (
                <div key={row.id} className="rounded-lg border p-4">
                  <div className="mb-4 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold">{patientName(row)}</h2>
                      <span className="rounded-full border px-2 py-1 text-xs capitalize">
                        {row.stage ?? "admission requested"}
                      </span>
                    </div>

                    <div className="grid gap-1 text-sm text-muted-foreground">
                      <p>Patient No: {row.patients?.patient_number ?? "—"}</p>
                      <p>Doctor: {row.staff?.full_name ?? "Unassigned"}</p>
                      <p>Requested: {row.encounter_datetime ? new Date(row.encounter_datetime).toLocaleString() : "—"}</p>
                      <p>Chief Complaint: {row.chief_complaint ?? "—"}</p>
                      <p>Diagnosis: {row.diagnosis_text ?? "—"}</p>
                    </div>
                  </div>

                  <IntakeForm
                    hospitalSlug={hospitalSlug}
                    row={row}
                    wards={wards}
                    beds={beds}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}


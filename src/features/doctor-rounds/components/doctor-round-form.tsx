"use client";

import Link from "next/link";
import { useActionState } from "react";
import { createDoctorRound } from "@/features/doctor-rounds/actions/create-doctor-round";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type AdmissionLite = {
  id: string;
  hospital_id: string;
  patient_id: string;
  encounter_id: string | null;
  ward_id: string | null;
  bed_id: string | null;
  admitted_at: string | null;
  status: string | null;
  patients: {
    id: string;
    patient_number: string | null;
    first_name: string;
    middle_name: string | null;
    last_name: string;
  } | null;
  wards: {
    id: string;
    name: string | null;
    ward_type: string | null;
  } | null;
  beds: {
    id: string;
    bed_number: string | null;
  } | null;
};

type StaffLite = {
  id: string;
  full_name: string;
  staff_type: string | null;
};

type ActionState = {
  error?: string;
};

const initialState: ActionState = {};

function patientName(admission: AdmissionLite) {
  const p = admission.patients;
  if (!p) return "Unknown patient";
  return [p.first_name, p.middle_name, p.last_name].filter(Boolean).join(" ");
}

export function DoctorRoundForm({
  hospitalSlug,
  admission,
  doctorStaff,
}: {
  hospitalSlug: string;
  admission: AdmissionLite;
  doctorStaff: StaffLite[];
}) {
  const action = createDoctorRound.bind(null, hospitalSlug, admission.id);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <main className="space-y-6">
      <Card>
        <CardHeader className="border-b">
          <CardTitle>New Round Note</CardTitle>
          <CardDescription>
            Record inpatient review, treatment plan, and discharge recommendation if appropriate.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 py-5">
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">Patient</p>
            <h2 className="mt-1 text-lg font-semibold">{patientName(admission)}</h2>
            <p className="text-sm text-muted-foreground">
              {admission.patients?.patient_number ?? "No patient number"} · {admission.wards?.name ?? "No ward"} · {admission.beds?.bed_number ?? "No bed"}
            </p>
          </div>

          <form action={formAction} className="space-y-6">
            {state?.error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {state.error}
              </div>
            ) : null}

            <input type="hidden" name="encounter_id" value={admission.encounter_id ?? ""} />

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm">
                <span className="font-medium">Doctor</span>
                <select name="doctor_staff_id" defaultValue="" className="h-10 rounded-md border bg-background px-3 text-sm">
                  <option value="">Select doctor</option>
                  {doctorStaff.map((staff) => (
                    <option key={staff.id} value={staff.id}>{staff.full_name}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Subjective Notes</span>
              <textarea name="subjective_notes" rows={3} className="rounded-md border bg-background px-3 py-2 text-sm" placeholder="Symptoms, patient complaints, subjective update" />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Objective Notes</span>
              <textarea name="objective_notes" rows={3} className="rounded-md border bg-background px-3 py-2 text-sm" placeholder="Exam findings, observations, bedside findings" />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Assessment Notes</span>
              <textarea name="assessment_notes" rows={3} className="rounded-md border bg-background px-3 py-2 text-sm" placeholder="Clinical assessment" />
            </label>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Plan Notes</span>
              <textarea name="plan_notes" rows={4} className="rounded-md border bg-background px-3 py-2 text-sm" placeholder="Treatment plan, medication changes, monitoring plan, discharge plan" />
            </label>

            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" name="discharge_recommended" />
              <span className="font-medium">Recommend discharge</span>
            </label>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Save Round Note"}
              </Button>

              <Button asChild variant="outline" type="button">
                <Link href={`/h/${hospitalSlug}/doctor/rounds`}>Back to Rounds</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
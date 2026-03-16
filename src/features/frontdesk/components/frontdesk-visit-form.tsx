"use client";

import { useActionState } from "react";
import { createFrontdeskVisit } from "@/features/frontdesk/actions/create-frontdesk-visit";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type PatientLite = {
  id: string;
  patient_number: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  sex: string | null;
  date_of_birth: string | null;
  phone: string | null;
  status: string | null;
};

type StaffLite = {
  id: string;
  full_name: string;
  job_title: string | null;
  staff_type: string | null;
  active: boolean;
};

type FormState = {
  error?: string;
};

const initialState: FormState = {};

function getFullName(patient: PatientLite | null) {
  if (!patient) return "";
  return [patient.first_name, patient.middle_name, patient.last_name]
    .filter(Boolean)
    .join(" ");
}

function getDefaultDateTime(mode: string | null | undefined) {
  const now = new Date();

  if (mode === "walk-in") {
    const pad = (value: number) => String(value).padStart(2, "0");
    const year = now.getFullYear();
    const month = pad(now.getMonth() + 1);
    const day = pad(now.getDate());
    const hour = pad(now.getHours());
    const minute = pad(now.getMinutes());
    return `${year}-${month}-${day}T${hour}:${minute}`;
  }

  return "";
}

export function FrontdeskVisitForm({
  hospitalSlug,
  patient,
  staff,
  mode,
}: {
  hospitalSlug: string;
  patient: PatientLite | null;
  staff: StaffLite[];
  mode?: string | null;
}) {
  const action = createFrontdeskVisit.bind(null, hospitalSlug);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <main className="space-y-6">
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Create Visit</CardTitle>
          <CardDescription>
            Create a scheduled visit or walk-in and move the patient into today&apos;s flow.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 py-5">
          {!patient ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              No patient selected. Please search or register a patient first.
            </div>
          ) : (
            <div className="rounded-lg border bg-muted/30 p-4">
              <p className="text-sm text-muted-foreground">Selected Patient</p>
              <h2 className="mt-1 text-lg font-semibold">{getFullName(patient)}</h2>
              <p className="text-sm text-muted-foreground">
                {patient.patient_number ?? "No patient number"} · {patient.sex ?? "unknown"} · {patient.phone ?? "No phone"}
              </p>
            </div>
          )}

          <form action={formAction} className="space-y-6">
            {state?.error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {state.error}
              </div>
            ) : null}

            <input type="hidden" name="patient_id" value={patient?.id ?? ""} />

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm">
                <span className="font-medium">Assigned Staff / Doctor</span>
                <select
                  name="staff_id"
                  defaultValue=""
                  className="h-11 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Unassigned</option>
                  {staff.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name}
                      {member.job_title ? ` - ${member.job_title}` : ""}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-medium">Visit Type</span>
                <select
                  name="visit_type"
                  defaultValue={mode === "walk-in" ? "outpatient" : "outpatient"}
                  className="h-11 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="outpatient">Outpatient</option>
                  <option value="inpatient">Inpatient</option>
                  <option value="emergency">Emergency</option>
                  <option value="follow_up">Follow Up</option>
                </select>
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-medium">Appointment Type</span>
                <input
                  name="appointment_type"
                  type="text"
                  defaultValue={mode === "walk-in" ? "walk_in" : ""}
                  placeholder="consultation, review, dressing..."
                  className="h-11 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-medium">Visit Date & Time</span>
                <input
                  name="scheduled_at"
                  type="datetime-local"
                  required
                  defaultValue={getDefaultDateTime(mode)}
                  className="h-11 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>

              <label className="grid gap-2 text-sm md:col-span-2">
                <span className="font-medium">Reason</span>
                <input
                  name="reason"
                  type="text"
                  placeholder="Main complaint or reason for visit"
                  className="h-11 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>

              <label className="grid gap-2 text-sm md:col-span-2">
                <span className="font-medium">Notes</span>
                <textarea
                  name="notes"
                  rows={4}
                  placeholder="Optional front desk notes"
                  className="rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                />
              </label>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={pending || !patient}>
                {pending ? "Creating..." : "Create Visit"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
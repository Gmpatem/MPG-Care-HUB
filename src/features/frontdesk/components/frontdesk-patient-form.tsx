"use client";

import { useActionState } from "react";
import { createFrontdeskPatient } from "@/features/frontdesk/actions/create-frontdesk-patient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

type FormState = {
  error?: string;
};

const initialState: FormState = {};

function Field({
  label,
  name,
  type = "text",
  required = false,
  placeholder,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <label className="grid gap-2 text-sm">
      <span className="font-medium">{label}</span>
      <input
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="h-11 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
      />
    </label>
  );
}

export function FrontdeskPatientForm({
  hospitalSlug,
}: {
  hospitalSlug: string;
}) {
  const action = createFrontdeskPatient.bind(null, hospitalSlug);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <main className="space-y-6">
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Register Patient</CardTitle>
          <CardDescription>
            Keep registration short and move directly into visit creation.
          </CardDescription>
        </CardHeader>

        <CardContent className="py-5">
          <form action={formAction} className="space-y-6">
            {state?.error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {state.error}
              </div>
            ) : null}

            <section className="grid gap-4 md:grid-cols-2">
              <Field label="First Name" name="first_name" required />
              <Field label="Middle Name" name="middle_name" />
              <Field label="Last Name" name="last_name" required />

              <label className="grid gap-2 text-sm">
                <span className="font-medium">Sex</span>
                <select
                  name="sex"
                  defaultValue="unknown"
                  className="h-11 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="unknown">Unknown</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </label>

              <Field label="Date of Birth" name="date_of_birth" type="date" />
              <Field label="Phone" name="phone" />
              <Field label="Email" name="email" type="email" />

              <label className="grid gap-2 text-sm md:col-span-2">
                <span className="font-medium">Address</span>
                <textarea
                  name="address_text"
                  rows={3}
                  className="rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="Street, area, city"
                />
              </label>
            </section>

            <section className="space-y-4">
              <div>
                <h2 className="text-base font-semibold">Emergency Contact</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Add only what front desk needs right now.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Contact Name" name="emergency_contact_name" />
                <Field label="Contact Phone" name="emergency_contact_phone" />
              </div>
            </section>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={pending}>
                {pending ? "Saving..." : "Save and Continue to Visit"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
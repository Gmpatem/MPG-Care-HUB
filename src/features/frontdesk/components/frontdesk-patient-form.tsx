"use client";

import { useActionState } from "react";
import { createFrontdeskPatient } from "@/features/frontdesk/actions/create-frontdesk-patient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  FormSection,
  FormGrid,
  FormField,
  FormActionsBar,
  FormFeedback,
} from "@/components/forms/form-section";
import { SubmitButton } from "@/components/forms/submit-button";

type FormState = {
  error?: string;
};

const initialState: FormState = {};

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
            {state?.error && (
              <FormFeedback type="error" message={state.error} />
            )}

            {/* Primary Identity Section */}
            <FormSection
              title="Patient Identity"
              description="Required information to identify the patient"
            >
              <FormGrid>
                <FormField label="First Name" name="first_name" required>
                  <input
                    name="first_name"
                    type="text"
                    required
                    className="h-11 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </FormField>
                <FormField label="Middle Name" name="middle_name" optional>
                  <input
                    name="middle_name"
                    type="text"
                    className="h-11 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </FormField>
                <FormField label="Last Name" name="last_name" required>
                  <input
                    name="last_name"
                    type="text"
                    required
                    className="h-11 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </FormField>
                <FormField label="Sex" name="sex">
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
                </FormField>
              </FormGrid>
            </FormSection>

            {/* Contact Information Section */}
            <FormSection
              title="Contact Information"
              description="How to reach the patient"
            >
              <FormGrid>
                <FormField label="Date of Birth" name="date_of_birth" optional>
                  <input
                    name="date_of_birth"
                    type="date"
                    className="h-11 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </FormField>
                <FormField label="Phone" name="phone" optional>
                  <input
                    name="phone"
                    type="tel"
                    className="h-11 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </FormField>
                <FormField
                  label="Email"
                  name="email"
                  optional
                  className="md:col-span-2"
                >
                  <input
                    name="email"
                    type="email"
                    className="h-11 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </FormField>
                <FormField
                  label="Address"
                  name="address_text"
                  optional
                  className="md:col-span-2"
                >
                  <textarea
                    name="address_text"
                    rows={3}
                    className="rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    placeholder="Street, area, city"
                  />
                </FormField>
              </FormGrid>
            </FormSection>

            {/* Emergency Contact Section */}
            <FormSection
              title="Emergency Contact"
              description="Add only what front desk needs right now"
              variant="subtle"
            >
              <FormGrid>
                <FormField label="Contact Name" name="emergency_contact_name" optional>
                  <input
                    name="emergency_contact_name"
                    type="text"
                    className="h-11 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </FormField>
                <FormField label="Contact Phone" name="emergency_contact_phone" optional>
                  <input
                    name="emergency_contact_phone"
                    type="tel"
                    className="h-11 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </FormField>
              </FormGrid>
            </FormSection>

            {/* Actions */}
            <FormActionsBar bordered>
              <SubmitButton pendingText="Saving patient...">
                Save and Continue to Visit
              </SubmitButton>
              <Button type="button" variant="outline" asChild>
                <a href={`/h/${hospitalSlug}/frontdesk`}>Cancel</a>
              </Button>
            </FormActionsBar>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

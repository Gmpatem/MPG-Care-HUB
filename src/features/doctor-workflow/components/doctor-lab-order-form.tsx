"use client";

import { useActionState, useMemo, useState } from "react";
import { createLabOrder } from "@/features/doctor-workflow/actions/create-lab-order";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type PatientLite = {
  id: string;
  patient_number: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  sex: string | null;
  phone: string | null;
};

type StaffLite = {
  id: string;
  full_name: string;
  staff_type: string | null;
  active: boolean;
};

type LabTestLite = {
  id: string;
  code: string | null;
  name: string;
  description: string | null;
  price: number | null;
  active: boolean;
};

type EncounterLite = {
  id: string;
  appointment_id: string | null;
  encounter_datetime: string | null;
  status: string | null;
} | null;

type ActionState = {
  error?: string;
};

const initialState: ActionState = {};

function fullName(patient: PatientLite) {
  return [patient.first_name, patient.middle_name, patient.last_name].filter(Boolean).join(" ");
}

function formatPrice(value: number | null) {
  return Number(value ?? 0).toFixed(2);
}

function SelectedTestChip({
  test,
  onRemove,
}: {
  test: LabTestLite;
  onRemove: (id: string) => void;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-3 py-1 text-sm">
      <span className="font-medium">{test.name}</span>
      {test.code ? (
        <span className="text-xs text-muted-foreground">({test.code})</span>
      ) : null}
      <button
        type="button"
        onClick={() => onRemove(test.id)}
        className="rounded-full px-1 text-muted-foreground hover:bg-background hover:text-foreground"
        aria-label={`Remove ${test.name}`}
      >
        ×
      </button>
    </div>
  );
}

export function DoctorLabOrderForm({
  hospitalSlug,
  patient,
  doctorStaff,
  labTests,
  latestEncounter,
}: {
  hospitalSlug: string;
  patient: PatientLite;
  doctorStaff: StaffLite[];
  labTests: LabTestLite[];
  latestEncounter: EncounterLite;
}) {
  const action = createLabOrder.bind(null, hospitalSlug, patient.id);
  const [state, formAction, pending] = useActionState(action, initialState);

  const [query, setQuery] = useState("");
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);

  const selectedTests = useMemo(
    () => labTests.filter((test) => selectedTestIds.includes(test.id)),
    [labTests, selectedTestIds]
  );

  const filteredTests = useMemo(() => {
    const q = query.trim().toLowerCase();

    return labTests.filter((test) => {
      if (selectedTestIds.includes(test.id)) return false;
      if (!q) return true;

      return (
        test.name.toLowerCase().includes(q) ||
        (test.code ?? "").toLowerCase().includes(q) ||
        (test.description ?? "").toLowerCase().includes(q)
      );
    });
  }, [labTests, query, selectedTestIds]);

  function addTest(testId: string) {
    setSelectedTestIds((prev) => (prev.includes(testId) ? prev : [...prev, testId]));
    setQuery("");
  }

  function removeTest(testId: string) {
    setSelectedTestIds((prev) => prev.filter((id) => id !== testId));
  }

  return (
    <main className="space-y-6">
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Order Lab Tests</CardTitle>
          <CardDescription>
            Create a simple lab order and send it into the lab workflow.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6 py-5">
          <div className="rounded-lg border bg-muted/30 p-4">
            <p className="text-sm text-muted-foreground">Patient</p>
            <h2 className="mt-1 text-lg font-semibold">{fullName(patient)}</h2>
            <p className="text-sm text-muted-foreground">
              {patient.patient_number ?? "No patient number"} · {patient.sex ?? "unknown"} · {patient.phone ?? "No phone"}
            </p>
          </div>

          <form action={formAction} className="space-y-6">
            {state?.error ? (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {state.error}
              </div>
            ) : null}

            <input type="hidden" name="encounter_id" value={latestEncounter?.id ?? ""} />
            <input type="hidden" name="appointment_id" value={latestEncounter?.appointment_id ?? ""} />

            {selectedTestIds.map((testId) => (
              <input key={testId} type="hidden" name="lab_test_ids" value={testId} />
            ))}

            <div className="grid gap-4 md:grid-cols-2">
              <label className="grid gap-2 text-sm">
                <span className="font-medium">Ordering Doctor</span>
                <select
                  name="ordered_by_staff_id"
                  defaultValue={doctorStaff.length === 1 ? doctorStaff[0]?.id ?? "" : ""}
                  className="h-11 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select doctor</option>
                  {doctorStaff.map((member) => (
                    <option key={member.id} value={member.id}>
                      {member.full_name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="grid gap-2 text-sm">
                <span className="font-medium">Priority</span>
                <select
                  name="priority"
                  defaultValue="routine"
                  className="h-11 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="routine">Routine</option>
                  <option value="urgent">Urgent</option>
                  <option value="stat">STAT</option>
                </select>
              </label>
            </div>

            <div className="space-y-3">
              <div>
                <h2 className="text-base font-semibold">Select Tests</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Search the active lab catalog and add one or more tests.
                </p>
              </div>

              {labTests.length === 0 ? (
                <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
                  No active lab tests found in the catalog yet.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-lg border p-4">
                    <label className="grid gap-2 text-sm">
                      <span className="font-medium">Search lab test</span>
                      <input
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Type CBC, malaria, sugar, urinalysis..."
                        className="h-11 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                      />
                    </label>

                    <div className="mt-3 max-h-72 overflow-y-auto rounded-md border">
                      {filteredTests.length === 0 ? (
                        <div className="px-3 py-4 text-sm text-muted-foreground">
                          {selectedTestIds.length === labTests.length
                            ? "All available tests have already been selected."
                            : "No matching lab tests found."}
                        </div>
                      ) : (
                        <div className="divide-y">
                          {filteredTests.map((test) => (
                            <button
                              key={test.id}
                              type="button"
                              onClick={() => addTest(test.id)}
                              className="flex w-full items-start justify-between gap-4 px-3 py-3 text-left hover:bg-muted/50"
                            >
                              <div className="space-y-1">
                                <p className="font-medium">
                                  {test.name}
                                  {test.code ? ` (${test.code})` : ""}
                                </p>
                                {test.description ? (
                                  <p className="text-sm text-muted-foreground">{test.description}</p>
                                ) : null}
                              </div>

                              <div className="shrink-0 text-xs text-muted-foreground">
                                {formatPrice(test.price)}
                              </div>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg border p-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <h3 className="font-medium">Selected Tests</h3>
                        <p className="text-sm text-muted-foreground">
                          These tests will be included in the lab order.
                        </p>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {selectedTestIds.length} selected
                      </div>
                    </div>

                    {selectedTests.length === 0 ? (
                      <div className="mt-3 rounded-md border border-dashed px-3 py-4 text-sm text-muted-foreground">
                        No tests selected yet.
                      </div>
                    ) : (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {selectedTests.map((test) => (
                          <SelectedTestChip
                            key={test.id}
                            test={test}
                            onRemove={removeTest}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <label className="grid gap-2 text-sm">
              <span className="font-medium">Clinical Notes</span>
              <textarea
                name="clinical_notes"
                rows={4}
                placeholder="Relevant symptoms, working impression, or lab instructions"
                className="rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </label>

            <div className="flex flex-wrap gap-3">
              <Button type="submit" disabled={pending || selectedTestIds.length === 0}>
                {pending ? "Creating..." : "Create Lab Order"}
              </Button>

              <Button asChild type="button" variant="outline">
                <a href={`/h/${hospitalSlug}/doctor/patients/${patient.id}`}>Back to Patient</a>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { createLabTest, type CreateLabTestState } from "@/features/admin-setup/actions/create-lab-test";

const initialState: CreateLabTestState = {};

export function LabTestsAdminPage({
  hospitalSlug,
  hospitalName,
  departments,
  labTests,
}: {
  hospitalSlug: string;
  hospitalName: string;
  departments: Array<{
    id: string;
    name: string;
  }>;
  labTests: Array<{
    id: string;
    department_id: string | null;
    code: string | null;
    name: string;
    description: string | null;
    price: number;
    active: boolean;
  }>;
}) {
  const action = createLabTest.bind(null, hospitalSlug);
  const [state, formAction, pending] = useActionState(action, initialState);

  const departmentNameById = new Map(departments.map((d) => [d.id, d.name]));

  return (
    <main className="space-y-6">
      <div className="space-y-4 rounded-xl border p-5">
        <div>
          <p className="text-sm text-muted-foreground">Admin Setup</p>
          <h1 className="text-3xl font-semibold tracking-tight">Lab Tests</h1>
          <p className="text-sm text-muted-foreground">
            Build the laboratory catalog for {hospitalName}.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 rounded-xl border p-3">
          <a href={`/h/${hospitalSlug}/admin/departments`} className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted">Departments</a>
          <a href={`/h/${hospitalSlug}/admin/wards`} className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted">Wards</a>
          <a href={`/h/${hospitalSlug}/admin/beds`} className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted">Beds</a>
          <a href={`/h/${hospitalSlug}/admin/medications`} className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted">Medications</a>
          <a href={`/h/${hospitalSlug}/admin/pharmacy-stock`} className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted">Pharmacy Stock</a>
          <a href={`/h/${hospitalSlug}/admin/lab-tests`} className="inline-flex items-center rounded-md border border-foreground bg-foreground px-3 py-2 text-sm text-background">Lab Tests</a>
        </div>
      </div>

      <section className="space-y-4 rounded-xl border p-5">
        <div>
          <h2 className="text-lg font-semibold">Create Lab Test</h2>
          <p className="text-sm text-muted-foreground">
            Lab tests are required before doctors can place realistic lab orders.
          </p>
        </div>

        <form action={formAction} className="grid gap-4 xl:grid-cols-2">
          {state.error ? (
            <div className="xl:col-span-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.error}
            </div>
          ) : null}

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Name</span>
            <input name="name" className="rounded-md border px-3 py-2" placeholder="Complete Blood Count" />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Code</span>
            <input name="code" className="rounded-md border px-3 py-2" placeholder="CBC" />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Department</span>
            <select name="department_id" className="rounded-md border px-3 py-2" defaultValue="">
              <option value="">No department</option>
              {departments.map((department) => (
                <option key={department.id} value={department.id}>
                  {department.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Price</span>
            <input
              name="price"
              type="number"
              step="0.01"
              min="0"
              defaultValue="0"
              className="rounded-md border px-3 py-2"
            />
          </label>

          <label className="xl:col-span-2 grid gap-2 text-sm">
            <span className="font-medium">Description</span>
            <textarea
              name="description"
              rows={3}
              className="rounded-md border px-3 py-2"
              placeholder="Optional test description"
            />
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="active" defaultChecked />
            <span>Active</span>
          </label>

          <div className="xl:col-span-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Creating..." : "Create Lab Test"}
            </Button>
          </div>
        </form>
      </section>

      <section className="space-y-4 rounded-xl border p-5">
        <div>
          <h2 className="text-lg font-semibold">Lab Test Catalog</h2>
          <p className="text-sm text-muted-foreground">
            Current lab tests in this hospital.
          </p>
        </div>

        {labTests.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            No lab tests created yet.
          </div>
        ) : (
          <div className="space-y-3">
            {labTests.map((labTest) => (
              <div key={labTest.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium">{labTest.name}</h3>
                  {labTest.code ? (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                      {labTest.code}
                    </span>
                  ) : null}
                  <span className={`rounded-full px-2 py-0.5 text-xs ${labTest.active ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {labTest.active ? "active" : "inactive"}
                  </span>
                </div>

                <p className="mt-2 text-sm text-muted-foreground">
                  Department: {labTest.department_id ? departmentNameById.get(labTest.department_id) ?? "Unknown" : "None"} · Price: {Number(labTest.price ?? 0).toFixed(2)}
                </p>

                {labTest.description ? (
                  <p className="mt-2 text-sm text-muted-foreground">{labTest.description}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
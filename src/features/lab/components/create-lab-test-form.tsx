"use client";

import { useActionState } from "react";
import { createLabTest, type CreateLabTestState } from "@/features/lab/actions/create-lab-test";

type DepartmentOption = {
  id: string;
  name: string;
};

type CreateLabTestFormProps = {
  hospitalSlug: string;
  departments: DepartmentOption[];
};

const initialState: CreateLabTestState = {};

export function CreateLabTestForm({
  hospitalSlug,
  departments,
}: CreateLabTestFormProps) {
  const action = createLabTest.bind(null, hospitalSlug);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <form action={formAction} className="space-y-6 rounded-xl border p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Add Lab Test</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Create a lab test that doctors can later choose from a clean catalog.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">Test name</label>
          <input
            id="name"
            name="name"
            className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="Complete Blood Count"
          />
          {state.errors?.name ? (
            <p className="text-sm text-red-600">{state.errors.name}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="code" className="text-sm font-medium">Code</label>
          <input
            id="code"
            name="code"
            className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
            placeholder="CBC"
          />
          {state.errors?.code ? (
            <p className="text-sm text-red-600">{state.errors.code}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <label htmlFor="department_id" className="text-sm font-medium">Department</label>
          <select
            id="department_id"
            name="department_id"
            defaultValue=""
            className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="">No department</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label htmlFor="price" className="text-sm font-medium">Price</label>
          <input
            id="price"
            name="price"
            type="number"
            min="0"
            step="1"
            defaultValue="0"
            className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
          />
          {state.errors?.price ? (
            <p className="text-sm text-red-600">{state.errors.price}</p>
          ) : null}
        </div>
      </div>

      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">Description</label>
        <textarea
          id="description"
          name="description"
          rows={4}
          className="w-full rounded-md border bg-background px-3 py-2 text-sm"
          placeholder="Optional notes, specimen notes, or what this test is for."
        />
        {state.errors?.description ? (
          <p className="text-sm text-red-600">{state.errors.description}</p>
        ) : null}
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked />
        <span>Make this lab test available for ordering immediately</span>
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {pending ? "Saving..." : "Create Lab Test"}
        </button>

        {state.message ? (
          <p className={`text-sm ${state.success ? "text-emerald-700" : "text-red-600"}`}>
            {state.message}
          </p>
        ) : null}
      </div>
    </form>
  );
}
"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { createDepartment, type CreateDepartmentState } from "@/features/admin-setup/actions/create-department";
import { AdminSetupNav } from "@/features/admin-setup/components/admin-setup-nav";

const initialState: CreateDepartmentState = {};

export function DepartmentsAdminPage({
  hospitalSlug,
  hospitalName,
  departments,
}: {
  hospitalSlug: string;
  hospitalName: string;
  departments: Array<{
    id: string;
    code: string | null;
    name: string;
    department_type: string;
    description: string | null;
    active: boolean;
    sort_order: number;
  }>;
}) {
  const action = createDepartment.bind(null, hospitalSlug);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <main className="space-y-6">
      <div className="space-y-4 rounded-xl border p-5">
        <div>
          <p className="text-sm text-muted-foreground">Admin Setup</p>
          <h1 className="text-3xl font-semibold tracking-tight">Departments</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage departments for {hospitalName}.
          </p>
        </div>

        <AdminSetupNav hospitalSlug={hospitalSlug} current="departments" />
      </div>

      <section className="space-y-4 rounded-xl border p-5">
        <div>
          <h2 className="text-lg font-semibold">Create Department</h2>
          <p className="text-sm text-muted-foreground">
            Departments help organize staff, wards, encounters, and lab catalog items.
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
            <input name="name" className="rounded-md border px-3 py-2" placeholder="Pharmacy" />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Code</span>
            <input name="code" className="rounded-md border px-3 py-2" placeholder="PHARM" />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Department Type</span>
            <input
              name="department_type"
              className="rounded-md border px-3 py-2"
              placeholder="clinical"
            />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Sort Order</span>
            <input
              name="sort_order"
              type="number"
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
              placeholder="Department description"
            />
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="active" defaultChecked />
            <span>Active</span>
          </label>

          <div className="xl:col-span-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Creating..." : "Create Department"}
            </Button>
          </div>
        </form>
      </section>

      <section className="space-y-4 rounded-xl border p-5">
        <div>
          <h2 className="text-lg font-semibold">Current Departments</h2>
          <p className="text-sm text-muted-foreground">
            Existing departments for this hospital.
          </p>
        </div>

        {departments.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            No departments created yet.
          </div>
        ) : (
          <div className="space-y-3">
            {departments.map((department) => (
              <div key={department.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium">{department.name}</h3>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                    {department.department_type}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${department.active ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {department.active ? "active" : "inactive"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Code: {department.code ?? "—"} · Sort: {department.sort_order}
                </p>
                {department.description ? (
                  <p className="mt-2 text-sm text-muted-foreground">{department.description}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
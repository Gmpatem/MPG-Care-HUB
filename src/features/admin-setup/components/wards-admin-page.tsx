"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { createWard, type CreateWardState } from "@/features/admin-setup/actions/create-ward";
import { AdminSetupNav } from "@/features/admin-setup/components/admin-setup-nav";

const initialState: CreateWardState = {};

export function WardsAdminPage({
  hospitalSlug,
  hospitalName,
  departments,
  wards,
}: {
  hospitalSlug: string;
  hospitalName: string;
  departments: Array<{
    id: string;
    name: string;
  }>;
  wards: Array<{
    id: string;
    department_id: string | null;
    code: string | null;
    name: string;
    ward_type: string;
    active: boolean;
    admission_fee: number;
  }>;
}) {
  const action = createWard.bind(null, hospitalSlug);
  const [state, formAction, pending] = useActionState(action, initialState);

  const departmentNameById = new Map(departments.map((d) => [d.id, d.name]));

  return (
    <main className="space-y-6">
      <div className="space-y-4 rounded-xl border p-5">
        <div>
          <p className="text-sm text-muted-foreground">Admin Setup</p>
          <h1 className="text-3xl font-semibold tracking-tight">Wards</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage wards for {hospitalName}.
          </p>
        </div>

        <AdminSetupNav hospitalSlug={hospitalSlug} current="wards" />
      </div>

      <section className="space-y-4 rounded-xl border p-5">
        <div>
          <h2 className="text-lg font-semibold">Create Ward</h2>
          <p className="text-sm text-muted-foreground">
            Wards are required before creating beds or admitting patients.
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
            <input name="name" className="rounded-md border px-3 py-2" placeholder="General Ward" />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Code</span>
            <input name="code" className="rounded-md border px-3 py-2" placeholder="GEN" />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Ward Type</span>
            <input name="ward_type" className="rounded-md border px-3 py-2" placeholder="general" />
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
            <span className="font-medium">Admission Fee</span>
            <input
              name="admission_fee"
              type="number"
              step="0.01"
              min="0"
              defaultValue="0"
              className="rounded-md border px-3 py-2"
            />
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="active" defaultChecked />
            <span>Active</span>
          </label>

          <div className="xl:col-span-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Creating..." : "Create Ward"}
            </Button>
          </div>
        </form>
      </section>

      <section className="space-y-4 rounded-xl border p-5">
        <div>
          <h2 className="text-lg font-semibold">Current Wards</h2>
          <p className="text-sm text-muted-foreground">
            Existing wards for this hospital.
          </p>
        </div>

        {wards.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            No wards created yet.
          </div>
        ) : (
          <div className="space-y-3">
            {wards.map((ward) => (
              <div key={ward.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium">{ward.name}</h3>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                    {ward.ward_type}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${ward.active ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {ward.active ? "active" : "inactive"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Code: {ward.code ?? "—"} · Department: {ward.department_id ? departmentNameById.get(ward.department_id) ?? "Unknown" : "None"} · Admission Fee: {Number(ward.admission_fee ?? 0).toFixed(2)}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
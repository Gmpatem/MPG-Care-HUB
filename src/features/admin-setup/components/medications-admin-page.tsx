"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { createMedication, type CreateMedicationState } from "@/features/admin-setup/actions/create-medication";
import { AdminSetupNav } from "@/features/admin-setup/components/admin-setup-nav";

const initialState: CreateMedicationState = {};

export function MedicationsAdminPage({
  hospitalSlug,
  hospitalName,
  medications,
}: {
  hospitalSlug: string;
  hospitalName: string;
  medications: Array<{
    id: string;
    code: string | null;
    generic_name: string;
    brand_name: string | null;
    form: string;
    strength: string | null;
    unit: string | null;
    route: string | null;
    reorder_level: number | null;
    active: boolean;
  }>;
}) {
  const action = createMedication.bind(null, hospitalSlug);
  const [state, formAction, pending] = useActionState(action, initialState);

  return (
    <main className="space-y-6">
      <div className="space-y-4 rounded-xl border p-5">
        <div>
          <p className="text-sm text-muted-foreground">Admin Setup</p>
          <h1 className="text-3xl font-semibold tracking-tight">Medications</h1>
          <p className="text-sm text-muted-foreground">
            Build the medication catalog for {hospitalName}.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 rounded-xl border p-3">
          <a href={`/h/${hospitalSlug}/admin/departments`} className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted">Departments</a>
          <a href={`/h/${hospitalSlug}/admin/wards`} className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted">Wards</a>
          <a href={`/h/${hospitalSlug}/admin/beds`} className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted">Beds</a>
          <a href={`/h/${hospitalSlug}/admin/medications`} className="inline-flex items-center rounded-md border border-foreground bg-foreground px-3 py-2 text-sm text-background">Medications</a>
          <a href={`/h/${hospitalSlug}/admin/pharmacy-stock`} className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted">Pharmacy Stock</a>
        </div>
      </div>

      <section className="space-y-4 rounded-xl border p-5">
        <div>
          <h2 className="text-lg font-semibold">Create Medication</h2>
          <p className="text-sm text-muted-foreground">
            Medications are required before prescriptions and stock batches can work.
          </p>
        </div>

        <form action={formAction} className="grid gap-4 xl:grid-cols-2">
          {state.error ? (
            <div className="xl:col-span-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.error}
            </div>
          ) : null}

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Generic Name</span>
            <input name="generic_name" className="rounded-md border px-3 py-2" placeholder="Paracetamol" />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Brand Name</span>
            <input name="brand_name" className="rounded-md border px-3 py-2" placeholder="Biogesic" />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Code</span>
            <input name="code" className="rounded-md border px-3 py-2" placeholder="MED-001" />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Form</span>
            <input name="form" className="rounded-md border px-3 py-2" placeholder="tablet" />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Strength</span>
            <input name="strength" className="rounded-md border px-3 py-2" placeholder="500mg" />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Unit</span>
            <input name="unit" className="rounded-md border px-3 py-2" placeholder="tablet" />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Route</span>
            <input name="route" className="rounded-md border px-3 py-2" placeholder="oral" />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Reorder Level</span>
            <input name="reorder_level" type="number" step="0.01" min="0" className="rounded-md border px-3 py-2" />
          </label>

          <label className="xl:col-span-2 grid gap-2 text-sm">
            <span className="font-medium">Description</span>
            <textarea name="description" rows={3} className="rounded-md border px-3 py-2" placeholder="Optional description" />
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="active" defaultChecked />
            <span>Active</span>
          </label>

          <div className="xl:col-span-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Creating..." : "Create Medication"}
            </Button>
          </div>
        </form>
      </section>

      <section className="space-y-4 rounded-xl border p-5">
        <div>
          <h2 className="text-lg font-semibold">Medication Catalog</h2>
          <p className="text-sm text-muted-foreground">Current medications in this hospital.</p>
        </div>

        {medications.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            No medications created yet.
          </div>
        ) : (
          <div className="space-y-3">
            {medications.map((medication) => (
              <div key={medication.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium">{medication.generic_name}</h3>
                  {medication.brand_name ? (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                      {medication.brand_name}
                    </span>
                  ) : null}
                  <span className={`rounded-full px-2 py-0.5 text-xs ${medication.active ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {medication.active ? "active" : "inactive"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Code: {medication.code ?? "—"} · Form: {medication.form} · Strength: {medication.strength ?? "—"} · Route: {medication.route ?? "—"} · Reorder: {medication.reorder_level ?? "—"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
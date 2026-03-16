"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { createPharmacyStockBatch, type CreatePharmacyStockBatchState } from "@/features/admin-setup/actions/create-pharmacy-stock-batch";

const initialState: CreatePharmacyStockBatchState = {};

export function PharmacyStockAdminPage({
  hospitalSlug,
  hospitalName,
  medications,
  batches,
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
  }>;
  batches: Array<{
    id: string;
    medication_id: string;
    batch_number: string;
    expiry_date: string | null;
    quantity_received: number;
    quantity_available: number;
    unit_cost: number;
    selling_price: number;
    supplier_name: string | null;
    received_at: string;
  }>;
}) {
  const action = createPharmacyStockBatch.bind(null, hospitalSlug);
  const [state, formAction, pending] = useActionState(action, initialState);

  const medicationNameById = new Map(
    medications.map((m) => [
      m.id,
      `${m.generic_name}${m.brand_name ? ` (${m.brand_name})` : ""}${m.strength ? ` ${m.strength}` : ""}`,
    ])
  );

  return (
    <main className="space-y-6">
      <div className="space-y-4 rounded-xl border p-5">
        <div>
          <p className="text-sm text-muted-foreground">Admin Setup</p>
          <h1 className="text-3xl font-semibold tracking-tight">Pharmacy Stock</h1>
          <p className="text-sm text-muted-foreground">
            Manage stock batches for {hospitalName}.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 rounded-xl border p-3">
          <a href={`/h/${hospitalSlug}/admin/departments`} className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted">Departments</a>
          <a href={`/h/${hospitalSlug}/admin/wards`} className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted">Wards</a>
          <a href={`/h/${hospitalSlug}/admin/beds`} className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted">Beds</a>
          <a href={`/h/${hospitalSlug}/admin/medications`} className="inline-flex items-center rounded-md border px-3 py-2 text-sm hover:bg-muted">Medications</a>
          <a href={`/h/${hospitalSlug}/admin/pharmacy-stock`} className="inline-flex items-center rounded-md border border-foreground bg-foreground px-3 py-2 text-sm text-background">Pharmacy Stock</a>
        </div>
      </div>

      <section className="space-y-4 rounded-xl border p-5">
        <div>
          <h2 className="text-lg font-semibold">Create Stock Batch</h2>
          <p className="text-sm text-muted-foreground">
            Stock batches are required before dispensing can work properly.
          </p>
        </div>

        <form action={formAction} className="grid gap-4 xl:grid-cols-2">
          {state.error ? (
            <div className="xl:col-span-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.error}
            </div>
          ) : null}

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Medication</span>
            <select name="medication_id" className="rounded-md border px-3 py-2" defaultValue="">
              <option value="">Select medication</option>
              {medications.map((medication) => (
                <option key={medication.id} value={medication.id}>
                  {medication.generic_name}{medication.brand_name ? ` (${medication.brand_name})` : ""}{medication.strength ? ` ${medication.strength}` : ""}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Batch Number</span>
            <input name="batch_number" className="rounded-md border px-3 py-2" placeholder="BATCH-001" />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Expiry Date</span>
            <input name="expiry_date" type="date" className="rounded-md border px-3 py-2" />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Quantity Received</span>
            <input name="quantity_received" type="number" step="0.01" min="0" defaultValue="0" className="rounded-md border px-3 py-2" />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Quantity Available</span>
            <input name="quantity_available" type="number" step="0.01" min="0" className="rounded-md border px-3 py-2" placeholder="Leave blank to match quantity received" />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Unit Cost</span>
            <input name="unit_cost" type="number" step="0.01" min="0" defaultValue="0" className="rounded-md border px-3 py-2" />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Selling Price</span>
            <input name="selling_price" type="number" step="0.01" min="0" defaultValue="0" className="rounded-md border px-3 py-2" />
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Supplier Name</span>
            <input name="supplier_name" className="rounded-md border px-3 py-2" placeholder="Supplier name" />
          </label>

          <div className="xl:col-span-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Creating..." : "Create Stock Batch"}
            </Button>
          </div>
        </form>
      </section>

      <section className="space-y-4 rounded-xl border p-5">
        <div>
          <h2 className="text-lg font-semibold">Current Stock Batches</h2>
          <p className="text-sm text-muted-foreground">Available pharmacy stock for this hospital.</p>
        </div>

        {batches.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            No stock batches created yet.
          </div>
        ) : (
          <div className="space-y-3">
            {batches.map((batch) => (
              <div key={batch.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium">{batch.batch_number}</h3>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                    {medicationNameById.get(batch.medication_id) ?? "Unknown medication"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Expiry: {batch.expiry_date ?? "—"} · Received: {Number(batch.quantity_received).toFixed(2)} · Available: {Number(batch.quantity_available).toFixed(2)}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Unit Cost: {Number(batch.unit_cost).toFixed(2)} · Selling Price: {Number(batch.selling_price).toFixed(2)} · Supplier: {batch.supplier_name ?? "—"}
                </p>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
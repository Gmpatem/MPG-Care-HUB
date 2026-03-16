"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/button";
import { createBed, type CreateBedState } from "@/features/admin-setup/actions/create-bed";
import { AdminSetupNav } from "@/features/admin-setup/components/admin-setup-nav";

const initialState: CreateBedState = {};

export function BedsAdminPage({
  hospitalSlug,
  hospitalName,
  wards,
  beds,
}: {
  hospitalSlug: string;
  hospitalName: string;
  wards: Array<{
    id: string;
    name: string;
    code: string | null;
  }>;
  beds: Array<{
    id: string;
    ward_id: string;
    bed_number: string;
    status: string;
    notes: string | null;
    active: boolean;
  }>;
}) {
  const action = createBed.bind(null, hospitalSlug);
  const [state, formAction, pending] = useActionState(action, initialState);

  const wardNameById = new Map(
    wards.map((ward) => [ward.id, ward.code ? `${ward.name} (${ward.code})` : ward.name])
  );

  return (
    <main className="space-y-6">
      <div className="space-y-4 rounded-xl border p-5">
        <div>
          <p className="text-sm text-muted-foreground">Admin Setup</p>
          <h1 className="text-3xl font-semibold tracking-tight">Beds</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage beds for {hospitalName}.
          </p>
        </div>

        <AdminSetupNav hospitalSlug={hospitalSlug} current="beds" />
      </div>

      <section className="space-y-4 rounded-xl border p-5">
        <div>
          <h2 className="text-lg font-semibold">Create Bed</h2>
          <p className="text-sm text-muted-foreground">
            Beds are required for realistic admissions and bed board workflow.
          </p>
        </div>

        <form action={formAction} className="grid gap-4 xl:grid-cols-2">
          {state.error ? (
            <div className="xl:col-span-2 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {state.error}
            </div>
          ) : null}

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Ward</span>
            <select name="ward_id" className="rounded-md border px-3 py-2" defaultValue="">
              <option value="">Select ward</option>
              {wards.map((ward) => (
                <option key={ward.id} value={ward.id}>
                  {ward.code ? `${ward.name} (${ward.code})` : ward.name}
                </option>
              ))}
            </select>
          </label>

          <label className="grid gap-2 text-sm">
            <span className="font-medium">Bed Number</span>
            <input name="bed_number" className="rounded-md border px-3 py-2" placeholder="G-01" />
          </label>

          <label className="xl:col-span-2 grid gap-2 text-sm">
            <span className="font-medium">Notes</span>
            <textarea
              name="notes"
              rows={3}
              className="rounded-md border px-3 py-2"
              placeholder="Optional notes"
            />
          </label>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="active" defaultChecked />
            <span>Active</span>
          </label>

          <div className="xl:col-span-2">
            <Button type="submit" disabled={pending}>
              {pending ? "Creating..." : "Create Bed"}
            </Button>
          </div>
        </form>
      </section>

      <section className="space-y-4 rounded-xl border p-5">
        <div>
          <h2 className="text-lg font-semibold">Current Beds</h2>
          <p className="text-sm text-muted-foreground">
            Existing beds for this hospital.
          </p>
        </div>

        {beds.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            No beds created yet.
          </div>
        ) : (
          <div className="space-y-3">
            {beds.map((bed) => (
              <div key={bed.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-medium">Bed {bed.bed_number}</h3>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                    {bed.status}
                  </span>
                  <span className={`rounded-full px-2 py-0.5 text-xs ${bed.active ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                    {bed.active ? "active" : "inactive"}
                  </span>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  Ward: {wardNameById.get(bed.ward_id) ?? "Unknown"}
                </p>
                {bed.notes ? (
                  <p className="mt-2 text-sm text-muted-foreground">{bed.notes}</p>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
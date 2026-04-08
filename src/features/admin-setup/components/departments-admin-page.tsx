"use client";

import { useActionState, useState } from "react";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createDepartment, type CreateDepartmentState } from "@/features/admin-setup/actions/create-department";
import { updateDepartment, type UpdateDepartmentState } from "@/features/admin-setup/actions/update-department";
import { AdminSetupNav } from "@/features/admin-setup/components/admin-setup-nav";
import { QuickEditModal } from "@/components/overlays";
import { FormSection, FormGrid, FormField } from "@/components/forms/form-section";
import { InlineFeedback } from "@/components/feedback/inline-feedback";

const initialCreateState: CreateDepartmentState = {};
const initialUpdateState: UpdateDepartmentState = {};

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
  const createAction = createDepartment.bind(null, hospitalSlug);
  const [createState, createFormAction, createPending] = useActionState(createAction, initialCreateState);

  const [editingDept, setEditingDept] = useState<typeof departments[0] | null>(null);
  const updateAction = updateDepartment.bind(null, hospitalSlug);
  const [updateState, updateFormAction, updatePending] = useActionState(updateAction, initialUpdateState);

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

        <form action={createFormAction} className="grid gap-4 xl:grid-cols-2">
          {createState.error ? (
            <div className="xl:col-span-2">
              <InlineFeedback tone="error" message={createState.error} />
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
            <Button type="submit" disabled={createPending}>
              {createPending ? "Creating..." : "Create Department"}
            </Button>
          </div>
        </form>
      </section>

      <section className="space-y-4 rounded-xl border p-5">
        <div>
          <h2 className="text-lg font-semibold">Current Departments</h2>
          <p className="text-sm text-muted-foreground">
            Existing departments for this hospital. Click to edit.
          </p>
        </div>

        {departments.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            No departments created yet.
          </div>
        ) : (
          <div className="space-y-3">
            {departments.map((department) => (
              <div 
                key={department.id} 
                className="rounded-lg border p-4 transition-colors hover:bg-muted/30"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium">{department.name}</h3>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                      {department.department_type}
                    </span>
                    <span className={`rounded-full px-2 py-0.5 text-xs ${department.active ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                      {department.active ? "active" : "inactive"}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingDept(department)}
                  >
                    <Pencil className="mr-1 h-3.5 w-3.5" />
                    Edit
                  </Button>
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

      {/* Quick Edit Modal */}
      <QuickEditModal
        open={editingDept !== null}
        onOpenChange={(open) => !open && setEditingDept(null)}
        title="Edit Department"
        description="Update department details."
        formId="edit-department-form"
        pending={updatePending}
      >
        <form
          id="edit-department-form"
          action={async (formData: FormData) => {
            if (editingDept) {
              formData.append("department_id", editingDept.id);
              await updateFormAction(formData);
              if (!updateState.error) {
                setEditingDept(null);
              }
            }
          }}
          className="space-y-4"
        >
          {updateState.error ? (
            <InlineFeedback tone="error" message={updateState.error} />
          ) : null}

          <FormSection>
            <FormGrid>
              <FormField label="Name" name="name" required>
                <input
                  name="name"
                  defaultValue={editingDept?.name}
                  className="h-11 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                  required
                />
              </FormField>

              <FormField label="Code" name="code">
                <input
                  name="code"
                  defaultValue={editingDept?.code ?? ""}
                  className="h-11 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                />
              </FormField>

              <FormField label="Department Type" name="department_type" required>
                <input
                  name="department_type"
                  defaultValue={editingDept?.department_type}
                  className="h-11 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                  required
                />
              </FormField>

              <FormField label="Sort Order" name="sort_order">
                <input
                  name="sort_order"
                  type="number"
                  defaultValue={editingDept?.sort_order ?? 0}
                  className="h-11 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                />
              </FormField>
            </FormGrid>

            <FormField label="Description" name="description">
              <textarea
                name="description"
                defaultValue={editingDept?.description ?? ""}
                rows={3}
                className="rounded-md border bg-background px-3 py-2 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              />
            </FormField>

            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="active"
                defaultChecked={editingDept?.active}
              />
              <span>Active</span>
            </label>
          </FormSection>
        </form>
      </QuickEditModal>
    </main>
  );
}

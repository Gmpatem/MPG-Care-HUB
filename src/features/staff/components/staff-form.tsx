"use client";

import { useActionState } from "react";
import { STAFF_TYPE_OPTIONS } from "@/features/staff/constants";

type HospitalUserOption = {
  id: string;
  role: string | null;
  full_name: string | null;
  email: string | null;
};

type DepartmentOption = {
  id: string;
  name: string;
};

type StaffRecord = {
  id?: string;
  hospital_user_id?: string | null;
  staff_code?: string | null;
  full_name?: string | null;
  department_id?: string | null;
  job_title?: string | null;
  license_number?: string | null;
  active?: boolean;
  staff_type?: string | null;
  specialty?: string | null;
  phone?: string | null;
  email?: string | null;
  date_of_birth?: string | null;
  address_text?: string | null;
  emergency_contact_name?: string | null;
  emergency_contact_phone?: string | null;
  notes?: string | null;
};

type ActionState = {
  error?: string;
};

export function StaffForm({
  title,
  description,
  action,
  hospitalUsers,
  departments,
  initialValues,
  submitLabel,
}: {
  title: string;
  description: string;
  action: (state: ActionState, formData: FormData) => Promise<ActionState>;
  hospitalUsers: HospitalUserOption[];
  departments: DepartmentOption[];
  initialValues?: StaffRecord;
  submitLabel: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-6 rounded-xl border p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      {state?.error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {state.error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm">
          <span className="font-medium">Full Name</span>
          <input
            name="full_name"
            defaultValue={initialValues?.full_name ?? ""}
            className="h-11 rounded-md border bg-background px-3 text-sm"
            required
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Staff Code</span>
          <input
            name="staff_code"
            defaultValue={initialValues?.staff_code ?? ""}
            className="h-11 rounded-md border bg-background px-3 text-sm"
            placeholder="DOC-001"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Staff Type</span>
          <select
            name="staff_type"
            defaultValue={initialValues?.staff_type ?? "general"}
            className="h-11 rounded-md border bg-background px-3 text-sm"
          >
            {STAFF_TYPE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Job Title</span>
          <input
            name="job_title"
            defaultValue={initialValues?.job_title ?? ""}
            className="h-11 rounded-md border bg-background px-3 text-sm"
            placeholder="Consultant Doctor"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Department</span>
          <select
            name="department_id"
            defaultValue={initialValues?.department_id ?? ""}
            className="h-11 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">No department</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Linked Hospital User</span>
          <select
            name="hospital_user_id"
            defaultValue={initialValues?.hospital_user_id ?? ""}
            className="h-11 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">No linked user</option>
            {hospitalUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {(user.full_name || user.email || "Unnamed user")} {user.role ? `· ${user.role}` : ""}
              </option>
            ))}
          </select>
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">License Number</span>
          <input
            name="license_number"
            defaultValue={initialValues?.license_number ?? ""}
            className="h-11 rounded-md border bg-background px-3 text-sm"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Specialty</span>
          <input
            name="specialty"
            defaultValue={initialValues?.specialty ?? ""}
            className="h-11 rounded-md border bg-background px-3 text-sm"
            placeholder="Internal Medicine"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Phone</span>
          <input
            name="phone"
            defaultValue={initialValues?.phone ?? ""}
            className="h-11 rounded-md border bg-background px-3 text-sm"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Email</span>
          <input
            name="email"
            type="email"
            defaultValue={initialValues?.email ?? ""}
            className="h-11 rounded-md border bg-background px-3 text-sm"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Date of Birth</span>
          <input
            name="date_of_birth"
            type="date"
            defaultValue={initialValues?.date_of_birth ?? ""}
            className="h-11 rounded-md border bg-background px-3 text-sm"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Emergency Contact Name</span>
          <input
            name="emergency_contact_name"
            defaultValue={initialValues?.emergency_contact_name ?? ""}
            className="h-11 rounded-md border bg-background px-3 text-sm"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Emergency Contact Phone</span>
          <input
            name="emergency_contact_phone"
            defaultValue={initialValues?.emergency_contact_phone ?? ""}
            className="h-11 rounded-md border bg-background px-3 text-sm"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm">
        <span className="font-medium">Address</span>
        <textarea
          name="address_text"
          rows={3}
          defaultValue={initialValues?.address_text ?? ""}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        />
      </label>

      <label className="grid gap-2 text-sm">
        <span className="font-medium">Notes</span>
        <textarea
          name="notes"
          rows={4}
          defaultValue={initialValues?.notes ?? ""}
          className="rounded-md border bg-background px-3 py-2 text-sm"
        />
      </label>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="active" defaultChecked={initialValues?.active ?? true} />
        <span>Staff member is active</span>
      </label>

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-50"
        >
          {pending ? "Saving..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
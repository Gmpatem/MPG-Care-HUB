import Link from "next/link";
import { Button } from "@/components/ui/button";
import { toggleStaffActive } from "@/features/staff/actions/toggle-staff-active";

type StaffRow = {
  id: string;
  hospital_user_id: string | null;
  staff_code: string | null;
  full_name: string;
  department: string | null;
  job_title: string | null;
  license_number: string | null;
  active: boolean;
  department_id: string | null;
  staff_type: string | null;
  specialty: string | null;
  phone: string | null;
  email: string | null;
  created_at: string | null;
  hospital_user: {
    id: string;
    role: string | null;
    full_name: string | null;
    email: string | null;
  } | null;
};

export function StaffPage({
  hospitalSlug,
  hospitalName,
  staff,
}: {
  hospitalSlug: string;
  hospitalName: string;
  staff: StaffRow[];
}) {
  const activeCount = staff.filter((member) => member.active).length;

  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Hospital staffing</p>
          <h1 className="text-3xl font-semibold tracking-tight">Staff</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage doctors, nurses, lab staff, receptionists, and other team members for {hospitalName}.
          </p>
        </div>

        <Button asChild>
          <Link href={`/h/${hospitalSlug}/staff/new`}>Add Staff</Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Total staff</p>
          <div className="mt-2 text-2xl font-semibold">{staff.length}</div>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Active</p>
          <div className="mt-2 text-2xl font-semibold">{activeCount}</div>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Inactive</p>
          <div className="mt-2 text-2xl font-semibold">{staff.length - activeCount}</div>
        </div>
      </div>

      <div className="rounded-xl border">
        <div className="border-b px-4 py-3">
          <h2 className="font-medium">Staff directory</h2>
        </div>

        {staff.length === 0 ? (
          <div className="px-4 py-8 text-sm text-muted-foreground">
            No staff records yet. Add your first doctor, nurse, receptionist, or lab staff member.
          </div>
        ) : (
          <div className="divide-y">
            {staff.map((member) => (
              <div
                key={member.id}
                className="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-start lg:justify-between"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{member.full_name}</p>

                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        member.active
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-600"
                      }`}
                    >
                      {member.active ? "Active" : "Inactive"}
                    </span>

                    {member.staff_type ? (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                        {member.staff_type}
                      </span>
                    ) : null}
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {member.staff_code ?? "No code"} · {member.job_title ?? "No job title"} · {member.department ?? "No department"}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {member.phone ?? "No phone"} · {member.email ?? "No email"}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Linked user: {member.hospital_user?.full_name || member.hospital_user?.email || "Not linked"}
                    {member.hospital_user?.role ? ` · ${member.hospital_user.role}` : ""}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline">
                    <Link href={`/h/${hospitalSlug}/staff/${member.id}`}>Edit</Link>
                  </Button>

                  <form action={toggleStaffActive}>
                    <input type="hidden" name="hospital_slug" value={hospitalSlug} />
                    <input type="hidden" name="staff_id" value={member.id} />
                    <input type="hidden" name="next_active" value={member.active ? "false" : "true"} />
                    <Button type="submit" variant={member.active ? "destructive" : "outline"}>
                      {member.active ? "Deactivate" : "Reactivate"}
                    </Button>
                  </form>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
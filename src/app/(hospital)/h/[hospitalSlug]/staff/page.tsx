import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createStaffProfile } from "@/features/staff/actions/create-staff-profile";
import { updateHospitalUserRole } from "@/features/staff/actions/update-hospital-user-role";
import { toggleHospitalUserStatus } from "@/features/staff/actions/toggle-hospital-user-status";

type PageProps = {
  params: Promise<{
    hospitalSlug: string;
  }>;
};

type StaffRow = {
  id: string;
  hospital_id: string;
  user_id: string;
  role: string;
  status: string;
  joined_at: string | null;
  created_at: string;
  profiles:
    | {
        id: string;
        full_name: string | null;
        email: string | null;
        phone: string | null;
      }
    | {
        id: string;
        full_name: string | null;
        email: string | null;
        phone: string | null;
      }[]
    | null;
};

type StaffProfileRow = {
  id: string;
  hospital_user_id: string | null;
  full_name: string;
  department: string | null;
  job_title: string | null;
  license_number: string | null;
  active: boolean;
};

export default async function StaffPage({ params }: PageProps) {
  const { hospitalSlug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: hospital } = await supabase
    .from("hospitals")
    .select("id, name, slug")
    .eq("slug", hospitalSlug)
    .maybeSingle();

  if (!hospital) notFound();

  const { data: memberships, error: membershipsError } = await supabase
    .from("hospital_users")
    .select(`
      id,
      hospital_id,
      user_id,
      role,
      status,
      joined_at,
      created_at,
      profiles (
        id,
        full_name,
        email,
        phone
      )
    `)
    .eq("hospital_id", hospital.id)
    .order("created_at", { ascending: false });

  if (membershipsError) {
    throw new Error(membershipsError.message);
  }

  const membershipRows = (memberships ?? []) as StaffRow[];
  const hospitalUserIds = membershipRows.map((row) => row.id);

  let staffProfiles: StaffProfileRow[] = [];
  if (hospitalUserIds.length > 0) {
    const { data: staffData, error: staffError } = await supabase
      .from("staff")
      .select("id, hospital_user_id, full_name, department, job_title, license_number, active")
      .eq("hospital_id", hospital.id);

    if (staffError) {
      throw new Error(staffError.message);
    }

    staffProfiles = (staffData ?? []) as StaffProfileRow[];
  }

  const staffByHospitalUserId = new Map(
    staffProfiles
      .filter((s) => !!s.hospital_user_id)
      .map((s) => [s.hospital_user_id as string, s])
  );

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Staff</p>
          <h1 className="text-3xl font-bold">Staff Management</h1>
          <p className="text-muted-foreground">{hospital.name}</p>
        </div>

        <div className="flex gap-3">
          <Button asChild variant="outline">
            <Link href={`/h/${hospital.slug}/staff/invitations`}>Invitations</Link>
          </Button>
        </div>
      </div>

      <div className="rounded-xl border">
        <div className="grid grid-cols-7 gap-4 border-b px-4 py-3 text-sm font-medium text-muted-foreground">
          <div>User</div>
          <div>Email</div>
          <div>Role</div>
          <div>Status</div>
          <div>Staff Profile</div>
          <div>Joined</div>
          <div>Actions</div>
        </div>

        {membershipRows.length > 0 ? (
          membershipRows.map((member) => {
            const profile = Array.isArray(member.profiles)
              ? member.profiles[0]
              : member.profiles;

            const staffProfile = staffByHospitalUserId.get(member.id);

            return (
              <div
                key={member.id}
                className="grid grid-cols-7 gap-4 border-b px-4 py-4 text-sm last:border-b-0"
              >
                <div className="font-medium">
                  {staffProfile?.full_name ?? profile?.full_name ?? "Unnamed user"}
                </div>

                <div>{profile?.email ?? "-"}</div>

                <div>
                  <form action={updateHospitalUserRole} className="space-y-2">
                    <input type="hidden" name="hospital_user_id" value={member.id} />
                    <input type="hidden" name="hospital_slug" value={hospital.slug} />
                    <select
                      name="role"
                      defaultValue={member.role}
                      className="flex h-9 w-full rounded-md border bg-background px-2 py-1 text-sm"
                    >
                      <option value="hospital_admin">hospital_admin</option>
                      <option value="receptionist">receptionist</option>
                      <option value="doctor">doctor</option>
                      <option value="nurse">nurse</option>
                      <option value="cashier">cashier</option>
                    </select>
                    <Button type="submit" size="sm" variant="outline">
                      Save Role
                    </Button>
                  </form>
                </div>

                <div className="capitalize">{member.status}</div>

                <div className="space-y-2">
                  {staffProfile ? (
                    <div className="text-xs text-muted-foreground">
                      <p>{staffProfile.job_title ?? "No title"}</p>
                      <p>{staffProfile.department ?? "No department"}</p>
                    </div>
                  ) : (
                    <form action={createStaffProfile} className="space-y-2">
                      <input type="hidden" name="hospital_id" value={hospital.id} />
                      <input type="hidden" name="hospital_slug" value={hospital.slug} />
                      <input type="hidden" name="hospital_user_id" value={member.id} />
                      <Input name="full_name" placeholder="Full name" />
                      <Input name="job_title" placeholder="Job title" />
                      <Input name="department" placeholder="Department" />
                      <Input name="license_number" placeholder="License no. (optional)" />
                      <Button type="submit" size="sm" variant="outline">
                        Create Profile
                      </Button>
                    </form>
                  )}
                </div>

                <div>
                  {member.joined_at
                    ? new Date(member.joined_at).toLocaleDateString()
                    : "-"}
                </div>

                <div>
                  <form action={toggleHospitalUserStatus} className="space-y-2">
                    <input type="hidden" name="hospital_user_id" value={member.id} />
                    <input type="hidden" name="hospital_slug" value={hospital.slug} />
                    <input
                      type="hidden"
                      name="next_status"
                      value={member.status === "active" ? "inactive" : "active"}
                    />
                    <Button
                      type="submit"
                      size="sm"
                      variant={member.status === "active" ? "destructive" : "outline"}
                    >
                      {member.status === "active" ? "Deactivate" : "Reactivate"}
                    </Button>
                  </form>
                </div>
              </div>
            );
          })
        ) : (
          <div className="px-4 py-10 text-sm text-muted-foreground">
            No staff memberships yet.
          </div>
        )}
      </div>
    </main>
  );
}

import { createClient } from "@/lib/supabase/server";

type HospitalUserRow = {
  id: string;
  user_id: string;
  role: string;
  status: string;
  joined_at: string | null;
  created_at: string;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
};

type StaffRow = {
  id: string;
  hospital_user_id: string | null;
  full_name: string;
  staff_type: string;
  active: boolean;
};

type InvitationRow = {
  id: string;
  email: string;
  role: string;
  status: string;
  token: string;
  expires_at: string;
  created_at: string;
};

type WorkspaceAccessRow = {
  id: string;
  hospital_user_id: string;
  workspace_key: string;
  active: boolean;
};

export async function getAccessSetupData(hospitalSlug: string) {
  const supabase = await createClient();

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug, name")
    .eq("slug", hospitalSlug)
    .maybeSingle<{ id: string; slug: string; name: string }>();

  if (hospitalError) throw new Error(hospitalError.message);
  if (!hospital) throw new Error("Hospital not found.");

  const [membershipsRes, invitationsRes, staffRes, workspaceAccessRes] = await Promise.all([
    supabase
      .from("hospital_users")
      .select("id, user_id, role, status, joined_at, created_at")
      .eq("hospital_id", hospital.id)
      .order("created_at", { ascending: false })
      .returns<HospitalUserRow[]>(),

    supabase
      .from("invitations")
      .select("id, email, role, status, token, expires_at, created_at")
      .eq("hospital_id", hospital.id)
      .order("created_at", { ascending: false })
      .returns<InvitationRow[]>(),

    supabase
      .from("staff")
      .select("id, hospital_user_id, full_name, staff_type, active")
      .eq("hospital_id", hospital.id)
      .order("created_at", { ascending: false })
      .returns<StaffRow[]>(),

    supabase
      .from("hospital_user_workspace_access")
      .select("id, hospital_user_id, workspace_key, active")
      .eq("hospital_id", hospital.id)
      .eq("active", true)
      .returns<WorkspaceAccessRow[]>(),
  ]);

  if (membershipsRes.error) throw new Error(membershipsRes.error.message);
  if (invitationsRes.error) throw new Error(invitationsRes.error.message);
  if (staffRes.error) throw new Error(staffRes.error.message);
  if (workspaceAccessRes.error) throw new Error(workspaceAccessRes.error.message);

  const memberships = membershipsRes.data ?? [];
  const invitations = invitationsRes.data ?? [];
  const staff = staffRes.data ?? [];
  const workspaceAccess = workspaceAccessRes.data ?? [];

  const userIds = Array.from(new Set(memberships.map((m) => m.user_id).filter(Boolean)));

  let profiles: ProfileRow[] = [];
  if (userIds.length > 0) {
    const { data: profilesData, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds)
      .returns<ProfileRow[]>();

    if (profilesError) throw new Error(profilesError.message);
    profiles = profilesData ?? [];
  }

  const profileMap = new Map(profiles.map((profile) => [profile.id, profile]));
  const staffByHospitalUserId = new Map(
    staff
      .filter((row) => row.hospital_user_id)
      .map((row) => [row.hospital_user_id as string, row])
  );

  const workspaceAccessByHospitalUserId = new Map<string, string[]>();
  for (const row of workspaceAccess) {
    const current = workspaceAccessByHospitalUserId.get(row.hospital_user_id) ?? [];
    current.push(row.workspace_key);
    workspaceAccessByHospitalUserId.set(row.hospital_user_id, current);
  }

  return {
    hospital,
    memberships: memberships.map((membership) => {
      const profile = profileMap.get(membership.user_id);
      const linkedStaff = staffByHospitalUserId.get(membership.id) ?? null;
      const workspaceKeys = (workspaceAccessByHospitalUserId.get(membership.id) ?? []).sort();

      return {
        ...membership,
        profile: {
          full_name: profile?.full_name ?? null,
          email: profile?.email ?? null,
        },
        linked_staff: linkedStaff
          ? {
              id: linkedStaff.id,
              full_name: linkedStaff.full_name,
              staff_type: linkedStaff.staff_type,
              active: linkedStaff.active,
            }
          : null,
        extra_workspaces: workspaceKeys,
      };
    }),
    invitations,
  };
}

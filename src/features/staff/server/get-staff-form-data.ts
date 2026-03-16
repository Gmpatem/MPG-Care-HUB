import { createClient } from "@/lib/supabase/server";

type HospitalUserRow = {
  id: string;
  user_id: string;
  role: string | null;
  status: string | null;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
};

export async function getStaffFormData(hospitalSlug: string) {
  const supabase = await createClient();

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug, name")
    .eq("slug", hospitalSlug)
    .maybeSingle<{ id: string; slug: string; name: string }>();

  if (hospitalError) throw new Error(hospitalError.message);
  if (!hospital) throw new Error("Hospital not found.");

  const { data: departments } = await supabase
    .from("departments")
    .select("id, name")
    .eq("hospital_id", hospital.id)
    .order("name", { ascending: true });

  const { data: hospitalUsers } = await supabase
    .from("hospital_users")
    .select("id, user_id, role, status")
    .eq("hospital_id", hospital.id)
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .returns<HospitalUserRow[]>();

  const userIds = Array.from(
    new Set((hospitalUsers ?? []).map((u) => u.user_id).filter(Boolean))
  );

  let profiles: ProfileRow[] = [];
  if (userIds.length > 0) {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds)
      .returns<ProfileRow[]>();

    profiles = data ?? [];
  }

  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  return {
    hospital,
    departments: departments ?? [],
    hospitalUsers: (hospitalUsers ?? []).map((user) => {
      const profile = profileMap.get(user.user_id);
      return {
        id: user.id,
        role: user.role,
        full_name: profile?.full_name ?? null,
        email: profile?.email ?? null,
      };
    }),
  };
}
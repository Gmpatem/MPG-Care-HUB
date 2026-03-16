import { createClient } from "@/lib/supabase/server";

export async function getStaffPageData(hospitalSlug: string) {
  const supabase = await createClient();

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug, name")
    .eq("slug", hospitalSlug)
    .maybeSingle<{ id: string; slug: string; name: string }>();

  if (hospitalError) throw new Error(hospitalError.message);
  if (!hospital) throw new Error("Hospital not found.");

  const { data: staff, error: staffError } = await supabase
    .from("staff")
    .select(`
      id,
      hospital_user_id,
      staff_code,
      full_name,
      department,
      job_title,
      license_number,
      active,
      department_id,
      staff_type,
      specialty,
      phone,
      email,
      created_at
    `)
    .eq("hospital_id", hospital.id)
    .order("full_name", { ascending: true });

  if (staffError) throw new Error(staffError.message);

  const { data: departments } = await supabase
    .from("departments")
    .select("id, name")
    .eq("hospital_id", hospital.id)
    .order("name", { ascending: true });

  const { data: hospitalUsers } = await supabase
    .from("hospital_users")
    .select("id, user_id, role, status")
    .eq("hospital_id", hospital.id)
    .order("created_at", { ascending: true });

  const userIds = Array.from(new Set((hospitalUsers ?? []).map((u: any) => u.user_id).filter(Boolean)));

  let profiles: Array<{ id: string; full_name: string | null; email: string | null }> = [];
  if (userIds.length > 0) {
    const { data } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds);

    profiles = data ?? [];
  }

  const profileMap = new Map(profiles.map((p) => [p.id, p]));

  const userOptions = (hospitalUsers ?? []).map((user: any) => {
    const profile = profileMap.get(user.user_id);
    return {
      id: user.id,
      role: user.role,
      status: user.status,
      user_id: user.user_id,
      full_name: profile?.full_name ?? null,
      email: profile?.email ?? null,
    };
  });

  const userMap = new Map(userOptions.map((u) => [u.id, u]));

  return {
    hospital,
    staff: (staff ?? []).map((row: any) => ({
      ...row,
      hospital_user: row.hospital_user_id ? userMap.get(row.hospital_user_id) ?? null : null,
    })),
    departments: departments ?? [],
    hospitalUsers: userOptions,
  };
}
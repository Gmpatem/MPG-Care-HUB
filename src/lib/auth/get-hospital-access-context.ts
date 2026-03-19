import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { mergeAllowedWorkspaces } from "@/lib/auth/workspaces";

type HospitalRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
};

type MembershipRow = {
  id: string;
  role: string;
  status: string;
};

type WorkspaceAccessRow = {
  workspace_key: string;
};

export async function getHospitalAccessContext(hospitalSlug: string) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect(`/login?next=${encodeURIComponent(`/h/${hospitalSlug}`)}`);
  }

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, name, slug, status")
    .eq("slug", hospitalSlug)
    .maybeSingle<HospitalRow>();

  if (hospitalError) {
    throw new Error(hospitalError.message);
  }

  if (!hospital) {
    notFound();
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, is_platform_owner")
    .eq("id", user.id)
    .maybeSingle<{ id: string; is_platform_owner: boolean }>();

  if (profileError) {
    throw new Error(profileError.message);
  }

  const isPlatformOwner = !!profile?.is_platform_owner;

  const { data: membership, error: membershipError } = await supabase
    .from("hospital_users")
    .select("id, role, status")
    .eq("hospital_id", hospital.id)
    .eq("user_id", user.id)
    .maybeSingle<MembershipRow>();

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  const hasHospitalAccess =
    isPlatformOwner || (!!membership && membership.status === "active");

  if (!hasHospitalAccess) {
    return {
      supabase,
      user,
      hospital,
      profile,
      membership,
      isPlatformOwner,
      allowedWorkspaces: [],
      hasHospitalAccess: false,
    };
  }

  let extraWorkspaces: string[] = [];

  if (!isPlatformOwner && membership?.id) {
    const { data: workspaceRows, error: workspaceError } = await supabase
      .from("hospital_user_workspace_access")
      .select("workspace_key")
      .eq("hospital_id", hospital.id)
      .eq("hospital_user_id", membership.id)
      .eq("active", true)
      .returns<WorkspaceAccessRow[]>();

    if (workspaceError) {
      throw new Error(workspaceError.message);
    }

    extraWorkspaces = (workspaceRows ?? []).map((row) => row.workspace_key);
  }

  const effectiveRole = isPlatformOwner ? "platform_owner" : membership?.role ?? null;
  const allowedWorkspaces = mergeAllowedWorkspaces(
    effectiveRole as any,
    extraWorkspaces
  );

  return {
    supabase,
    user,
    hospital,
    profile,
    membership,
    isPlatformOwner,
    allowedWorkspaces,
    hasHospitalAccess: true,
  };
}

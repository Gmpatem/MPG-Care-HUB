"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { WORKSPACE_KEYS, type WorkspaceKey } from "@/lib/auth/workspaces";

type HospitalRow = {
  id: string;
  slug: string;
};

type MembershipRow = {
  id: string;
  role: string;
  status: string;
};

type WorkspaceAccessRow = {
  id: string;
  workspace_key: string;
};

export async function updateHospitalUserWorkspaces(formData: FormData) {
  const supabase = await createClient();

  const hospitalUserId = String(formData.get("hospital_user_id") ?? "").trim();
  const hospitalSlug = String(formData.get("hospital_slug") ?? "").trim();

  if (!hospitalUserId) throw new Error("Missing hospital user id");
  if (!hospitalSlug) throw new Error("Missing hospital slug");

  const requestedWorkspaces = formData
    .getAll("workspace_keys")
    .map((value) => String(value).trim())
    .filter((value): value is WorkspaceKey => WORKSPACE_KEYS.includes(value as WorkspaceKey));

  const uniqueRequestedWorkspaces = Array.from(new Set(requestedWorkspaces));

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    throw new Error("You must be signed in.");
  }

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug")
    .eq("slug", hospitalSlug)
    .maybeSingle<HospitalRow>();

  if (hospitalError) throw new Error(hospitalError.message);
  if (!hospital) throw new Error("Hospital not found.");

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, is_platform_owner")
    .eq("id", user.id)
    .maybeSingle<{ id: string; is_platform_owner: boolean }>();

  if (profileError) throw new Error(profileError.message);

  const { data: actingMembership, error: actingMembershipError } = await supabase
    .from("hospital_users")
    .select("id, role, status")
    .eq("hospital_id", hospital.id)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle<MembershipRow>();

  if (actingMembershipError) throw new Error(actingMembershipError.message);

  const isAllowed =
    Boolean(profile?.is_platform_owner) ||
    Boolean(actingMembership && actingMembership.role === "hospital_admin");

  if (!isAllowed) {
    throw new Error("Only hospital admins or platform owners can update workspace access.");
  }

  const { data: targetMembership, error: targetMembershipError } = await supabase
    .from("hospital_users")
    .select("id")
    .eq("id", hospitalUserId)
    .eq("hospital_id", hospital.id)
    .maybeSingle<{ id: string }>();

  if (targetMembershipError) throw new Error(targetMembershipError.message);
  if (!targetMembership) throw new Error("Target hospital user was not found in this hospital.");

  const { data: existingRows, error: existingRowsError } = await supabase
    .from("hospital_user_workspace_access")
    .select("id, workspace_key")
    .eq("hospital_id", hospital.id)
    .eq("hospital_user_id", hospitalUserId)
    .eq("active", true)
    .returns<WorkspaceAccessRow[]>();

  if (existingRowsError) throw new Error(existingRowsError.message);

  const existing = existingRows ?? [];
  const existingKeys = new Set(existing.map((row) => row.workspace_key));
  const requestedKeys = new Set(uniqueRequestedWorkspaces);

  const keysToDeactivate = existing
    .filter((row) => !requestedKeys.has(row.workspace_key as WorkspaceKey))
    .map((row) => row.workspace_key);

  const keysToInsert = uniqueRequestedWorkspaces.filter((key) => !existingKeys.has(key));

  if (keysToDeactivate.length > 0) {
    const { error: deactivateError } = await supabase
      .from("hospital_user_workspace_access")
      .update({
        active: false,
        updated_at: new Date().toISOString(),
      })
      .eq("hospital_id", hospital.id)
      .eq("hospital_user_id", hospitalUserId)
      .in("workspace_key", keysToDeactivate);

    if (deactivateError) throw new Error(deactivateError.message);
  }

  for (const workspaceKey of keysToInsert) {
    const { data: inactiveExisting, error: inactiveLookupError } = await supabase
      .from("hospital_user_workspace_access")
      .select("id")
      .eq("hospital_id", hospital.id)
      .eq("hospital_user_id", hospitalUserId)
      .eq("workspace_key", workspaceKey)
      .eq("active", false)
      .maybeSingle<{ id: string }>();

    if (inactiveLookupError) throw new Error(inactiveLookupError.message);

    if (inactiveExisting) {
      const { error: reactivateError } = await supabase
        .from("hospital_user_workspace_access")
        .update({
          active: true,
          granted_by_user_id: user.id,
          updated_at: new Date().toISOString(),
        })
        .eq("id", inactiveExisting.id);

      if (reactivateError) throw new Error(reactivateError.message);
      continue;
    }

    const { error: insertError } = await supabase
      .from("hospital_user_workspace_access")
      .insert({
        hospital_id: hospital.id,
        hospital_user_id: hospitalUserId,
        workspace_key: workspaceKey,
        active: true,
        granted_by_user_id: user.id,
      });

    if (insertError) throw new Error(insertError.message);
  }

  revalidatePath(`/h/${hospitalSlug}/admin/access`);
}

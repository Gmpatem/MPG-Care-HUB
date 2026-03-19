import { redirect } from "next/navigation";

import { getHospitalAccessContext } from "@/lib/auth/get-hospital-access-context";
import { hasWorkspaceAccess, type WorkspaceKey } from "@/lib/auth/workspaces";

export async function requireHospitalWorkspaceAccess(
  hospitalSlug: string,
  requiredWorkspaces: WorkspaceKey[]
) {
  const context = await getHospitalAccessContext(hospitalSlug);

  if (!context.hasHospitalAccess) {
    redirect(`/h/${hospitalSlug}`);
  }

  const isAllowed =
    context.isPlatformOwner ||
    requiredWorkspaces.some((workspace) =>
      hasWorkspaceAccess(context.allowedWorkspaces, workspace)
    );

  if (!isAllowed) {
    const requestedWorkspace = requiredWorkspaces[0] ?? "";
    redirect(`/h/${hospitalSlug}/access-denied?workspace=${requestedWorkspace}`);
  }

  return context;
}

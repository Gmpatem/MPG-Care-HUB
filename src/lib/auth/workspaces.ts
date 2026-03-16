import type { AppRole } from "./roles";

export const WORKSPACE_KEYS = [
  "admin",
  "frontdesk",
  "doctor",
  "nurse",
  "ward",
  "lab",
  "pharmacy",
  "billing",
] as const;

export type WorkspaceKey = (typeof WORKSPACE_KEYS)[number];

const PRIMARY_ROLE_WORKSPACES: Record<AppRole, WorkspaceKey[]> = {
  platform_owner: ["admin", "frontdesk", "doctor", "nurse", "ward", "lab", "pharmacy", "billing"],
  hospital_admin: ["admin", "frontdesk", "doctor", "nurse", "ward", "lab", "pharmacy", "billing"],
  receptionist: ["frontdesk"],
  doctor: ["doctor"],
  nurse: ["nurse", "ward"],
  cashier: ["billing"],
};

export function getDefaultWorkspacesForRole(role: AppRole | null | undefined): WorkspaceKey[] {
  if (!role) return [];
  return PRIMARY_ROLE_WORKSPACES[role] ?? [];
}

export function mergeAllowedWorkspaces(
  role: AppRole | null | undefined,
  extraWorkspaces: string[] | null | undefined
): WorkspaceKey[] {
  const merged = new Set<WorkspaceKey>(getDefaultWorkspacesForRole(role));

  for (const value of extraWorkspaces ?? []) {
    if (WORKSPACE_KEYS.includes(value as WorkspaceKey)) {
      merged.add(value as WorkspaceKey);
    }
  }

  return Array.from(merged);
}

export function hasWorkspaceAccess(
  allowedWorkspaces: string[] | null | undefined,
  workspace: WorkspaceKey
) {
  return (allowedWorkspaces ?? []).includes(workspace);
}

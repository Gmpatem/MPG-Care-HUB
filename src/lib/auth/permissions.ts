import type { AppRole } from "./roles";

export function hasRole(userRole: AppRole | null | undefined, allowed: AppRole[]) {
  if (!userRole) return false;
  return allowed.includes(userRole);
}

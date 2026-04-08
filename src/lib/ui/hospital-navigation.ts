/**
 * Hospital Navigation Configuration
 * 
 * UX Simplification Pack A - Navigation abstraction
 * Groups navigation items into user-facing operational categories:
 * - Today: Overview and quick actions
 * - Reception: Front desk, appointments, patients
 * - Clinical: Doctor, encounters, lab, pharmacy
 * - Inpatient: Nurse, ward
 * - Finance: Billing
 * - Administration: Admin functions
 */

import type { WorkspaceKey } from "@/lib/auth/workspaces";

export type NavItem = {
  label: string;
  href: string;
  icon: string; // Icon name from lucide-react
  description?: string;
  workspace: WorkspaceKey | "shared" | "admin-only";
};

export type NavGroup = {
  id: string;
  label: string;
  items: NavItem[];
  // Visual priority: lower numbers appear higher in sidebar
  priority: number;
  // Styling variant
  variant: "primary" | "secondary" | "admin";
};

/**
 * Navigation groups with operational user-facing labels
 */
export const NAV_GROUPS: NavGroup[] = [
  {
    id: "today",
    label: "Today",
    priority: 1,
    variant: "primary",
    items: [
      {
        label: "Overview",
        href: "", // Root path - /h/{slug}
        icon: "LayoutDashboard",
        description: "Dashboard and today's summary",
        workspace: "shared",
      },
    ],
  },
  {
    id: "reception",
    label: "Reception",
    priority: 2,
    variant: "primary",
    items: [
      {
        label: "Front Desk",
        href: "/frontdesk",
        icon: "ClipboardList",
        description: "Register patients and manage arrivals",
        workspace: "frontdesk",
      },
      {
        label: "Appointments",
        href: "/appointments",
        icon: "BriefcaseMedical",
        description: "Schedule and manage visits",
        workspace: "frontdesk",
      },
      {
        label: "Patients",
        href: "/patients",
        icon: "Users",
        description: "Search and manage patient records",
        workspace: "shared", // Accessible by multiple roles
      },
    ],
  },
  {
    id: "clinical",
    label: "Clinical",
    priority: 3,
    variant: "primary",
    items: [
      {
        label: "Doctor",
        href: "/doctor",
        icon: "Stethoscope",
        description: "Clinical workspace and visits",
        workspace: "doctor",
      },
      {
        label: "Encounters",
        href: "/encounters",
        icon: "ClipboardCheck",
        description: "Active consultations and visits",
        workspace: "frontdesk", // Shared clinical access
      },
      {
        label: "Laboratory",
        href: "/lab",
        icon: "FlaskConical",
        description: "Lab orders and results",
        workspace: "lab",
      },
      {
        label: "Pharmacy",
        href: "/pharmacy",
        icon: "Pill",
        description: "Dispense medications",
        workspace: "pharmacy",
      },
    ],
  },
  {
    id: "inpatient",
    label: "Inpatient",
    priority: 4,
    variant: "primary",
    items: [
      {
        label: "Nurse",
        href: "/nurse",
        icon: "UserRound",
        description: "Vitals and nursing notes",
        workspace: "nurse",
      },
      {
        label: "Ward",
        href: "/ward",
        icon: "BedDouble",
        description: "Admissions and bed management",
        workspace: "ward",
      },
      {
        label: "Census",
        href: "/ward/census",
        icon: "Building2",
        description: "Bed occupancy overview",
        workspace: "ward",
      },
    ],
  },
  {
    id: "finance",
    label: "Finance",
    priority: 5,
    variant: "secondary",
    items: [
      {
        label: "Billing",
        href: "/billing",
        icon: "CreditCard",
        description: "Invoices and payments",
        workspace: "billing",
      },
    ],
  },
  {
    id: "admin",
    label: "Administration",
    priority: 6,
    variant: "admin",
    items: [
      {
        label: "Access Control",
        href: "/admin/access",
        icon: "Shield",
        description: "Manage user permissions",
        workspace: "admin-only",
      },
      {
        label: "Staff",
        href: "/staff",
        icon: "Users",
        description: "Manage hospital staff",
        workspace: "admin-only",
      },
      {
        label: "Ward Setup",
        href: "/ward/config",
        icon: "Settings2",
        description: "Configure wards and beds",
        workspace: "admin-only",
      },
      {
        label: "Settings",
        href: "/settings",
        icon: "Settings",
        description: "Hospital configuration",
        workspace: "admin-only",
      },
      {
        label: "Activity",
        href: "/activity",
        icon: "Activity",
        description: "Audit and history",
        workspace: "admin-only",
      },
    ],
  },
];

/**
 * Quick action shortcuts for the Quick Actions dialog
 * Filtered by workspace access
 */
export type QuickAction = {
  id: string;
  label: string;
  href: string;
  icon: string;
  workspace: WorkspaceKey | "shared" | "admin-only";
  keywords: string[]; // For future search functionality
};

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "register-patient",
    label: "Register Patient",
    href: "/frontdesk/intake",
    icon: "UserPlus",
    workspace: "frontdesk",
    keywords: ["new", "intake", "front desk", "reception"],
  },
  {
    id: "front-desk",
    label: "Front Desk",
    href: "/frontdesk",
    icon: "ClipboardList",
    workspace: "frontdesk",
    keywords: ["reception", "intake", "queue"],
  },
  {
    id: "appointments",
    label: "Appointments",
    href: "/appointments",
    icon: "BriefcaseMedical",
    workspace: "frontdesk",
    keywords: ["schedule", "booking", "calendar"],
  },
  {
    id: "patient-directory",
    label: "Patient Directory",
    href: "/patients",
    icon: "Users",
    workspace: "shared",
    keywords: ["search", "records", "find"],
  },
  {
    id: "doctor-workspace",
    label: "Doctor Workspace",
    href: "/doctor",
    icon: "Stethoscope",
    workspace: "doctor",
    keywords: ["clinical", "consultation", "visit"],
  },
  {
    id: "encounters",
    label: "Encounters",
    href: "/encounters",
    icon: "ClipboardCheck",
    workspace: "frontdesk",
    keywords: ["visits", "consultations", "today"],
  },
  {
    id: "lab",
    label: "Laboratory",
    href: "/lab",
    icon: "FlaskConical",
    workspace: "lab",
    keywords: ["tests", "results", "orders"],
  },
  {
    id: "pharmacy",
    label: "Pharmacy",
    href: "/pharmacy",
    icon: "Pill",
    workspace: "pharmacy",
    keywords: ["medication", "dispense", "drugs"],
  },
  {
    id: "billing",
    label: "Billing",
    href: "/billing",
    icon: "CreditCard",
    workspace: "billing",
    keywords: ["payment", "invoice", "receipt", "cashier"],
  },
  {
    id: "nurse",
    label: "Nursing Station",
    href: "/nurse",
    icon: "UserRound",
    workspace: "nurse",
    keywords: ["vitals", "notes", "inpatient"],
  },
  {
    id: "ward",
    label: "Ward Admissions",
    href: "/ward",
    icon: "BedDouble",
    workspace: "ward",
    keywords: ["admission", "beds", "inpatient"],
  },
  {
    id: "census",
    label: "Ward Census",
    href: "/ward/census",
    icon: "Building2",
    workspace: "ward",
    keywords: ["occupancy", "beds", "capacity"],
  },
  {
    id: "staff",
    label: "Staff Management",
    href: "/staff",
    icon: "Users",
    workspace: "admin-only",
    keywords: ["employees", "team", "users"],
  },
  {
    id: "access-control",
    label: "Access Control",
    href: "/admin/access",
    icon: "Shield",
    workspace: "admin-only",
    keywords: ["permissions", "roles", "security"],
  },
];

/**
 * Check if a user can access a navigation item
 */
export function canAccessNavItem(
  item: NavItem | QuickAction,
  allowedWorkspaces: WorkspaceKey[],
  isPlatformOwner: boolean
): boolean {
  if (isPlatformOwner) return true;
  
  if (item.workspace === "admin-only") {
    return allowedWorkspaces.includes("admin");
  }
  
  if (item.workspace === "shared") {
    // Shared items are accessible if user has any clinical/finance workspace
    return allowedWorkspaces.length > 0;
  }
  
  return allowedWorkspaces.includes(item.workspace);
}

/**
 * Get filtered navigation groups based on user permissions
 */
export function getFilteredNavGroups(
  allowedWorkspaces: WorkspaceKey[],
  isPlatformOwner: boolean,
  hospitalSlug: string
): NavGroup[] {
  return NAV_GROUPS
    .map((group) => ({
      ...group,
      items: group.items
        .filter((item) => canAccessNavItem(item, allowedWorkspaces, isPlatformOwner))
        .map((item) => ({
          ...item,
          href: item.href ? `/h/${hospitalSlug}${item.href}` : `/h/${hospitalSlug}`,
        })),
    }))
    .filter((group) => group.items.length > 0)
    .sort((a, b) => a.priority - b.priority);
}

/**
 * Get filtered quick actions based on user permissions
 */
export function getFilteredQuickActions(
  allowedWorkspaces: WorkspaceKey[],
  isPlatformOwner: boolean,
  hospitalSlug: string
): QuickAction[] {
  return QUICK_ACTIONS
    .filter((action) => canAccessNavItem(action, allowedWorkspaces, isPlatformOwner))
    .map((action) => ({
      ...action,
      href: `/h/${hospitalSlug}${action.href}`,
    }));
}

/**
 * Find active navigation item based on current pathname
 */
export function findActiveNavItem(
  pathname: string,
  hospitalSlug: string
): { group?: NavGroup; item?: NavItem } | null {
  const basePath = `/h/${hospitalSlug}`;
  
  for (const group of NAV_GROUPS) {
    for (const item of group.items) {
      const fullHref = item.href ? `${basePath}${item.href}` : basePath;
      
      if (pathname === fullHref || pathname.startsWith(`${fullHref}/`)) {
        return { group, item };
      }
    }
  }
  
  return null;
}

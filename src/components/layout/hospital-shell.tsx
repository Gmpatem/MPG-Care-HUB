"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BedDouble,
  BriefcaseMedical,
  Building2,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  FlaskConical,
  LayoutDashboard,
  LogOut,
  Menu,
  Pill,
  Settings,
  Settings2,
  Shield,
  Stethoscope,
  UserRound,
  Users,
} from "lucide-react";
import { useState } from "react";

import { createClient } from "@/lib/supabase/browser";
import { hasWorkspaceAccess, type WorkspaceKey } from "@/lib/auth/workspaces";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { HospitalQuickActions, QuickActionsTrigger } from "./hospital-quick-actions";
import type { NavGroup, NavItem } from "@/lib/ui/hospital-navigation";

type HospitalShellProps = {
  hospitalName: string;
  hospitalSlug: string;
  allowedWorkspaces: string[];
  isPlatformOwner?: boolean;
  primaryRole?: string | null;
  children: ReactNode;
};

// Icon mapping for navigation
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  ClipboardList,
  BriefcaseMedical,
  Users,
  Stethoscope,
  ClipboardCheck,
  FlaskConical,
  Pill,
  UserRound,
  BedDouble,
  Building2,
  CreditCard,
  Shield,
  Settings,
  Settings2,
  Activity,
};

function NavIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name];
  if (!Icon) return null;
  return <Icon className={className} />;
}

export function HospitalShell({
  hospitalName,
  hospitalSlug,
  allowedWorkspaces,
  isPlatformOwner = false,
  primaryRole = null,
  children,
}: HospitalShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [quickActionsOpen, setQuickActionsOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  // Permission checks
  const canAdmin = isPlatformOwner || hasWorkspaceAccess(allowedWorkspaces, "admin");
  const canFrontdesk = canAdmin || hasWorkspaceAccess(allowedWorkspaces, "frontdesk");
  const canDoctor = canAdmin || hasWorkspaceAccess(allowedWorkspaces, "doctor");
  const canNurse = canAdmin || hasWorkspaceAccess(allowedWorkspaces, "nurse");
  const canWard = canAdmin || hasWorkspaceAccess(allowedWorkspaces, "ward");
  const canLab = canAdmin || hasWorkspaceAccess(allowedWorkspaces, "lab");
  const canPharmacy = canAdmin || hasWorkspaceAccess(allowedWorkspaces, "pharmacy");
  const canBilling = canAdmin || hasWorkspaceAccess(allowedWorkspaces, "billing");

  const roleLabel = isPlatformOwner ? "platform_owner" : primaryRole ?? "member";

  // Build navigation groups with simplified UX architecture
  const navGroups = [
    {
      id: "today",
      label: "Today",
      priority: 1,
      variant: "primary" as const,
      items: [
        {
          label: "Overview",
          href: `/h/${hospitalSlug}`,
          icon: "LayoutDashboard",
          description: "Dashboard and daily summary",
          workspace: "shared" as const,
        },
      ],
    },
    {
      id: "reception",
      label: "Reception",
      priority: 2,
      variant: "primary" as const,
      items: [
        ...(canFrontdesk
          ? [
              {
                label: "Front Desk",
                href: `/h/${hospitalSlug}/frontdesk`,
                icon: "ClipboardList",
                description: "Patient registration and queue",
                workspace: "frontdesk" as WorkspaceKey,
              },
              {
                label: "Appointments",
                href: `/h/${hospitalSlug}/appointments`,
                icon: "BriefcaseMedical",
                description: "Schedule and manage visits",
                workspace: "frontdesk" as WorkspaceKey,
              },
            ]
          : []),
        {
          label: "Patients",
          href: `/h/${hospitalSlug}/patients`,
          icon: "Users",
          description: "Patient records and search",
          workspace: "frontdesk" as WorkspaceKey,
        },
      ].filter(Boolean) as NavItem[],
    },
    {
      id: "clinical",
      label: "Clinical",
      priority: 3,
      variant: "primary" as const,
      items: [
        ...(canDoctor
          ? [
              {
                label: "Doctor",
                href: `/h/${hospitalSlug}/doctor`,
                icon: "Stethoscope",
                description: "Clinical workspace",
                workspace: "doctor" as WorkspaceKey,
              },
            ]
          : []),
        ...(canFrontdesk || canDoctor
          ? [
              {
                label: "Encounters",
                href: `/h/${hospitalSlug}/encounters`,
                icon: "ClipboardCheck",
                description: "Active consultations",
                workspace: "frontdesk" as WorkspaceKey,
              },
            ]
          : []),
        ...(canLab
          ? [
              {
                label: "Laboratory",
                href: `/h/${hospitalSlug}/lab`,
                icon: "FlaskConical",
                description: "Lab orders and results",
                workspace: "lab" as WorkspaceKey,
              },
            ]
          : []),
        ...(canPharmacy
          ? [
              {
                label: "Pharmacy",
                href: `/h/${hospitalSlug}/pharmacy`,
                icon: "Pill",
                description: "Dispense medications",
                workspace: "pharmacy" as WorkspaceKey,
              },
            ]
          : []),
      ].filter(Boolean) as NavItem[],
    },
    {
      id: "inpatient",
      label: "Inpatient",
      priority: 4,
      variant: "primary" as const,
      items: [
        ...(canNurse
          ? [
              {
                label: "Nurse",
                href: `/h/${hospitalSlug}/nurse`,
                icon: "UserRound",
                description: "Vitals and nursing notes",
                workspace: "nurse" as WorkspaceKey,
              },
            ]
          : []),
        ...(canWard
          ? [
              {
                label: "Ward",
                href: `/h/${hospitalSlug}/ward`,
                icon: "BedDouble",
                description: "Admissions and beds",
                workspace: "ward" as WorkspaceKey,
              },
              {
                label: "Census",
                href: `/h/${hospitalSlug}/ward/census`,
                icon: "Building2",
                description: "Bed occupancy overview",
                workspace: "ward" as WorkspaceKey,
              },
            ]
          : []),
      ].filter(Boolean) as NavItem[],
    },
    {
      id: "finance",
      label: "Finance",
      priority: 5,
      variant: "secondary" as const,
      items: [
        ...(canBilling
          ? [
              {
                label: "Billing",
                href: `/h/${hospitalSlug}/billing`,
                icon: "CreditCard",
                description: "Invoices and payments",
                workspace: "billing" as WorkspaceKey,
              },
            ]
          : []),
      ].filter(Boolean) as NavItem[],
    },
    {
      id: "admin",
      label: "Administration",
      priority: 6,
      variant: "admin" as const,
      items: [
        ...(canAdmin
          ? [
              {
                label: "Access Control",
                href: `/h/${hospitalSlug}/admin/access`,
                icon: "Shield",
                description: "User permissions",
                workspace: "admin" as WorkspaceKey,
              },
              {
                label: "Staff",
                href: `/h/${hospitalSlug}/staff`,
                icon: "Users",
                description: "Manage staff",
                workspace: "admin" as WorkspaceKey,
              },
              {
                label: "Ward Setup",
                href: `/h/${hospitalSlug}/ward/config`,
                icon: "Settings2",
                description: "Configure wards",
                workspace: "admin" as WorkspaceKey,
              },
              {
                label: "Settings",
                href: `/h/${hospitalSlug}/settings`,
                icon: "Settings",
                description: "Hospital settings",
                workspace: "admin" as WorkspaceKey,
              },
              {
                label: "Activity",
                href: `/h/${hospitalSlug}/activity`,
                icon: "Activity",
                description: "Audit log",
                workspace: "admin" as WorkspaceKey,
              },
            ]
          : []),
      ].filter(Boolean) as NavItem[],
    },
  ].filter((group) => group.items.length > 0);

  // Find active navigation item
  const activeNav = (() => {
    for (const group of navGroups) {
      for (const item of group.items) {
        if (pathname === item.href || pathname.startsWith(`${item.href}/`)) {
          return { group, item };
        }
      }
    }
    return null;
  })();

  const activeGroupLabel = activeNav?.group?.label ?? "Today";
  const activeItemLabel = activeNav?.item?.label ?? "Overview";

  function renderNav(onNavigate?: () => void) {
    return (
      <nav className="space-y-6">
        {navGroups.map((group) => (
          <div key={group.id} className="space-y-1">
            {/* Group Label */}
            <p
              className={cn(
                "px-3 text-[11px] font-semibold uppercase tracking-[0.18em]",
                group.variant === "admin"
                  ? "text-white/25"
                  : "text-white/40"
              )}
            >
              {group.label}
            </p>

            {/* Group Items */}
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive =
                  pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onNavigate}
                    className={cn(
                      "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all",
                      isActive
                        ? "bg-[rgba(42,179,204,0.18)] text-white shadow-[inset_0_0_0_1px_rgba(42,179,204,0.15)]"
                        : "text-white/65 hover:bg-white/8 hover:text-white"
                    )}
                  >
                    {/* Active indicator */}
                    {isActive && (
                      <span className="absolute inset-y-2.5 left-0 w-1 rounded-r-full bg-[#2ab3cc]" />
                    )}

                    {/* Icon */}
                    <span
                      className={cn(
                        "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors",
                        isActive
                          ? "bg-white/12 text-white"
                          : "bg-white/5 text-white/70 group-hover:bg-white/10"
                      )}
                    >
                      <NavIcon name={item.icon} className="h-4 w-4" />
                    </span>

                    {/* Label */}
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium leading-5">
                        {item.label}
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-background text-foreground">
        <div className="flex min-h-screen">
          {/* Desktop Sidebar */}
          <aside className="hidden w-64 shrink-0 border-r border-white/8 bg-[var(--sidebar)] lg:flex lg:flex-col">
            {/* Header - Simplified */}
            <div className="border-b border-white/8 px-4 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#0e7a91] to-[#2ab3cc] text-white shadow-lg shadow-[#0e7a91]/20">
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <h1 className="truncate text-base font-semibold text-white">
                    {hospitalName}
                  </h1>
                  <p className="text-xs text-white/40">{roleLabel}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex-1 overflow-y-auto px-3 py-4">
              {renderNav()}
            </div>

            {/* Footer */}
            <div className="border-t border-white/8 p-3">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-white/60 hover:bg-white/8 hover:text-white"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </Button>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Header - Task-oriented */}
            <header className="sticky top-0 z-30 border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
              <div className="flex h-14 items-center gap-3 px-4 sm:px-6">
                {/* Mobile Menu */}
                <div className="lg:hidden">
                  <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                    <SheetTrigger asChild>
                      <Button variant="outline" size="icon" aria-label="Open menu">
                        <Menu className="h-4 w-4" />
                      </Button>
                    </SheetTrigger>

                    <SheetContent
                      side="left"
                      className="w-[min(85vw,300px)] border-0 bg-[var(--sidebar)] p-0 text-white"
                    >
                      <SheetHeader className="border-b border-white/8 px-4 py-4 text-left">
                        <SheetTitle className="text-base text-white">
                          {hospitalName}
                        </SheetTitle>
                        <SheetDescription className="text-white/50">
                          Signed in as {roleLabel}
                        </SheetDescription>
                      </SheetHeader>

                      <div className="flex h-full flex-col">
                        <div className="flex-1 overflow-y-auto px-3 py-4">
                          {renderNav(() => setMobileMenuOpen(false))}
                        </div>
                        <div className="border-t border-white/8 p-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="w-full justify-start text-white/60 hover:bg-white/8"
                            onClick={() => {
                              setMobileMenuOpen(false);
                              handleLogout();
                            }}
                          >
                            <LogOut className="mr-2 h-4 w-4" />
                            Sign out
                          </Button>
                        </div>
                      </div>
                    </SheetContent>
                  </Sheet>
                </div>

                {/* Page Context */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                      {activeGroupLabel}
                    </span>
                  </div>
                  <h2 className="truncate text-sm font-semibold sm:text-base">
                    {activeItemLabel}
                  </h2>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center gap-2">
                  <QuickActionsTrigger onClick={() => setQuickActionsOpen(true)} />

                  {/* Sign out - desktop only */}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="hidden text-muted-foreground hover:text-foreground md:flex"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign out
                  </Button>
                </div>
              </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 px-4 pb-8 pt-5 sm:px-6 lg:px-8">
              {children}
            </main>
          </div>
        </div>
      </div>

      {/* Quick Actions Dialog */}
      <HospitalQuickActions
        hospitalSlug={hospitalSlug}
        allowedWorkspaces={allowedWorkspaces as WorkspaceKey[]}
        isPlatformOwner={isPlatformOwner}
        open={quickActionsOpen}
        onOpenChange={setQuickActionsOpen}
      />
    </>
  );
}

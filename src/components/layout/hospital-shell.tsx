"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Activity,
  BedDouble,
  BriefcaseMedical,
  Building2,
  ClipboardList,
  CreditCard,
  FlaskConical,
  LogOut,
  Menu,
  Settings,
  Stethoscope,
  UserRound,
  Users,
} from "lucide-react";

import { createClient } from "@/lib/supabase/browser";
import { hasWorkspaceAccess } from "@/lib/auth/workspaces";
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

type HospitalShellProps = {
  hospitalName: string;
  hospitalSlug: string;
  allowedWorkspaces: string[];
  isPlatformOwner?: boolean;
  primaryRole?: string | null;
  children: ReactNode;
};

type NavItem = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  description?: string;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

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

  async function handleLogout() {
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  }

  const canAdmin = isPlatformOwner || hasWorkspaceAccess(allowedWorkspaces, "admin");
  const canFrontdesk = canAdmin || hasWorkspaceAccess(allowedWorkspaces, "frontdesk");
  const canDoctor = canAdmin || hasWorkspaceAccess(allowedWorkspaces, "doctor");
  const canNurse = canAdmin || hasWorkspaceAccess(allowedWorkspaces, "nurse");
  const canWard = canAdmin || hasWorkspaceAccess(allowedWorkspaces, "ward");
  const canLab = canAdmin || hasWorkspaceAccess(allowedWorkspaces, "lab");
  const canPharmacy = canAdmin || hasWorkspaceAccess(allowedWorkspaces, "pharmacy");
  const canBilling = canAdmin || hasWorkspaceAccess(allowedWorkspaces, "billing");

  const canClinicalShared = canAdmin || canFrontdesk || canDoctor || canNurse || canWard;
  const canPatientRegistry = canClinicalShared || canBilling;
  const roleLabel = isPlatformOwner ? "platform_owner" : primaryRole ?? "member";

  const sections: NavSection[] = [
    {
      title: "Overview",
      items: [
        {
          label: "Hospital Overview",
          href: `/h/${hospitalSlug}`,
          icon: Activity,
          description: "Dashboard and operational summary",
        },
      ],
    },
    {
      title: "Patient Flow",
      items: [
        ...(canFrontdesk
          ? [
              {
                label: "Front Desk",
                href: `/h/${hospitalSlug}/frontdesk`,
                icon: ClipboardList,
                description: "Register patients and manage arrivals",
              },
            ]
          : []),
        ...(canClinicalShared
          ? [
              {
                label: "Appointments",
                href: `/h/${hospitalSlug}/appointments`,
                icon: BriefcaseMedical,
                description: "Schedule and check patient visits",
              },
              {
                label: "Encounters",
                href: `/h/${hospitalSlug}/encounters`,
                icon: Stethoscope,
                description: "Track active clinical visits",
              },
            ]
          : []),
        ...(canPatientRegistry
          ? [
              {
                label: "Patient Directory",
                href: `/h/${hospitalSlug}/patients`,
                icon: Users,
                description: "Search and open patient records",
              },
            ]
          : []),
      ],
    },
    {
      title: "Clinical Workspaces",
      items: [
        ...(canDoctor
          ? [
              {
                label: "Doctor Workspace",
                href: `/h/${hospitalSlug}/doctor`,
                icon: Stethoscope,
                description: "Review visits, labs, and treatment plans",
              },
            ]
          : []),
        ...(canNurse
          ? [
              {
                label: "Nursing Station",
                href: `/h/${hospitalSlug}/nurse`,
                icon: UserRound,
                description: "Record vitals and nursing notes",
              },
            ]
          : []),
        ...(canWard
          ? [
              {
                label: "Ward Admissions",
                href: `/h/${hospitalSlug}/ward/admissions`,
                icon: BedDouble,
                description: "Manage inpatients and bed assignment",
              },
              {
                label: "Ward Census",
                href: `/h/${hospitalSlug}/ward/census`,
                icon: Building2,
                description: "View current ward occupancy",
              },
            ]
          : []),
        ...(canLab
          ? [
              {
                label: "Laboratory",
                href: `/h/${hospitalSlug}/lab`,
                icon: FlaskConical,
                description: "Review lab orders and enter results",
              },
            ]
          : []),
        ...(canPharmacy
          ? [
              {
                label: "Pharmacy",
                href: `/h/${hospitalSlug}/pharmacy`,
                icon: BriefcaseMedical,
                description: "Dispense medication and review stock",
              },
            ]
          : []),
        ...(canBilling
          ? [
              {
                label: "Billing",
                href: `/h/${hospitalSlug}/billing`,
                icon: CreditCard,
                description: "Manage invoices, balances, and payments",
              },
            ]
          : []),
      ],
    },
    {
      title: "Administration",
      items: [
        ...(canAdmin
          ? [
              {
                label: "Access Control",
                href: `/h/${hospitalSlug}/admin/access`,
                icon: Settings,
                description: "Manage roles and workspace access",
              },
              {
                label: "Staff Management",
                href: `/h/${hospitalSlug}/staff`,
                icon: Users,
                description: "Manage hospital staff records",
              },
              {
                label: "Ward Setup",
                href: `/h/${hospitalSlug}/ward/config`,
                icon: BedDouble,
                description: "Configure wards, beds, and workflow",
              },
              {
                label: "Hospital Settings",
                href: `/h/${hospitalSlug}/settings`,
                icon: Settings,
                description: "Update hospital configuration",
              },
              {
                label: "Audit Activity",
                href: `/h/${hospitalSlug}/activity`,
                icon: Activity,
                description: "Review operational history",
              },
            ]
          : []),
      ],
    },
  ].filter((section) => section.items.length > 0);

  const quickLinks = [
    canFrontdesk ? { label: "Register Patient", href: `/h/${hospitalSlug}/frontdesk/intake` } : null,
    canDoctor ? { label: "Start Visit", href: `/h/${hospitalSlug}/encounters` } : null,
    canLab ? { label: "Review Lab Queue", href: `/h/${hospitalSlug}/lab/orders` } : null,
    canPharmacy ? { label: "Dispense Medication", href: `/h/${hospitalSlug}/pharmacy` } : null,
    canBilling ? { label: "Receive Payment", href: `/h/${hospitalSlug}/billing/payments` } : null,
  ].filter(Boolean) as Array<{ label: string; href: string }>;

  const activeSection =
    sections.find((section) =>
      section.items.some((item) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    ) ?? null;

  const activeItem =
    activeSection?.items.find((item) => pathname === item.href || pathname.startsWith(`${item.href}/`)) ?? null;

  const workspaceEyebrow = activeSection?.title ?? "Hospital Workspace";
  const workspaceTitle = activeItem?.label ?? "Hospital Overview";

  function renderNav() {
    return (
      <nav className="space-y-7">
        {sections.map((section) => (
          <div key={section.title} className="space-y-2.5">
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/35">
              {section.title}
            </p>

            <div className="space-y-1.5">
              {section.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "group relative flex items-start gap-3 rounded-2xl px-3 py-3 transition-all",
                      isActive
                        ? "bg-[rgba(42,179,204,0.16)] text-white shadow-[inset_0_0_0_1px_rgba(42,179,204,0.12)]"
                        : "text-white/68 hover:bg-white/8 hover:text-white"
                    )}
                  >
                    {isActive ? (
                      <span className="absolute inset-y-3 left-0 w-1 rounded-r-full bg-[#2ab3cc]" />
                    ) : null}

                    <span
                      className={cn(
                        "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors",
                        isActive
                          ? "bg-white/10 text-white"
                          : "bg-white/6 text-white/80 group-hover:bg-white/10"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium leading-5">{item.label}</span>
                      {item.description ? (
                        <span
                          className={cn(
                            "mt-0.5 block overflow-hidden text-xs leading-5 transition-all duration-200",
                            isActive
                              ? "max-h-10 opacity-100 text-white/72"
                              : "max-h-0 opacity-0 text-white/42 group-hover:max-h-10 group-hover:opacity-100 group-focus-visible:max-h-10 group-focus-visible:opacity-100"
                          )}
                        >
                          {item.description}
                        </span>
                      ) : null}
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
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 shrink-0 border-r border-white/8 bg-[var(--sidebar)] lg:flex lg:flex-col">
          <div className="border-b border-white/8 px-5 py-5">
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0e7a91] to-[#2ab3cc] text-white shadow-[0_10px_30px_rgba(14,122,145,0.28)]">
                <Building2 className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/45">
                  MPG Care Hub
                </p>
                <h1 className="truncate text-lg font-semibold text-white">{hospitalName}</h1>
                <p className="mt-1 text-xs text-white/38">Signed in as {roleLabel}</p>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-3 py-4">{renderNav()}</div>

          <div className="border-t border-white/8 p-4">
            <Button
              variant="destructive"
              className="w-full justify-start border-0 bg-[#e03620] text-white hover:bg-[#c03020]"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 border-b bg-card/92 backdrop-blur">
            <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
              <div className="lg:hidden">
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" aria-label="Open menu">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>

                  <SheetContent side="left" className="w-[88vw] max-w-xs border-0 bg-[var(--sidebar)] p-0 text-white">
                    <SheetHeader className="border-b border-white/8 px-5 py-5 text-left">
                      <SheetTitle className="text-base text-white">{hospitalName}</SheetTitle>
                      <SheetDescription className="text-white/48">
                        MPG Care Hub · Signed in as {roleLabel}
                      </SheetDescription>
                    </SheetHeader>

                    <div className="flex h-full flex-col">
                      <div className="flex-1 overflow-y-auto px-3 py-4">{renderNav()}</div>
                      <div className="border-t border-white/8 p-4">
                        <Button
                          variant="destructive"
                          className="w-full justify-start border-0 bg-[#e03620] text-white hover:bg-[#c03020]"
                          onClick={handleLogout}
                        >
                          <LogOut className="h-4 w-4" />
                          Logout
                        </Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>

              <div className="min-w-0 flex-1">
                <p className="eyebrow">{workspaceEyebrow}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                  <h2 className="truncate text-base font-semibold sm:text-lg">{workspaceTitle}</h2>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                    {roleLabel}
                  </span>
                </div>
              </div>

              <div className="hidden items-center gap-2 md:flex">
                {quickLinks.slice(0, 2).map((link) => (
                  <Button key={link.href} asChild variant="outline" size="sm">
                    <Link href={link.href}>{link.label}</Link>
                  </Button>
                ))}
              </div>
            </div>
          </header>

          <main className="flex-1 px-4 pb-8 pt-5 sm:px-6 lg:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}

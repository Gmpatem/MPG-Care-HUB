"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";
import { Button } from "@/components/ui/button";
import { hasWorkspaceAccess } from "@/lib/auth/workspaces";

type HospitalShellProps = {
  hospitalName: string;
  hospitalSlug: string;
  allowedWorkspaces: string[];
  isPlatformOwner?: boolean;
  primaryRole?: string | null;
  children: React.ReactNode;
};

export function HospitalShell({
  hospitalName,
  hospitalSlug,
  allowedWorkspaces,
  isPlatformOwner = false,
  primaryRole = null,
  children,
}: HospitalShellProps) {
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              MPG Care Hub
            </p>
            <h1 className="text-lg font-semibold">{hospitalName}</h1>
            <p className="text-xs text-muted-foreground">
              Signed in as {roleLabel}
            </p>
          </div>

          <nav className="flex flex-wrap items-center gap-3">
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}`}>Dashboard</Link>
            </Button>

            {canFrontdesk ? (
              <Button asChild variant="outline">
                <Link href={`/h/${hospitalSlug}/frontdesk`}>Patient Registration</Link>
              </Button>
            ) : null}

            {canNurse ? (
              <Button asChild variant="outline">
                <Link href={`/h/${hospitalSlug}/nurse`}>Nursing Station</Link>
              </Button>
            ) : null}

            {canDoctor ? (
              <Button asChild variant="outline">
                <Link href={`/h/${hospitalSlug}/doctor`}>Doctor Workspace</Link>
              </Button>
            ) : null}

            {canLab ? (
              <Button asChild variant="outline">
                <Link href={`/h/${hospitalSlug}/lab`}>Laboratory Orders</Link>
              </Button>
            ) : null}

            {canPharmacy ? (
              <Button asChild variant="outline">
                <Link href={`/h/${hospitalSlug}/pharmacy`}>Medication Dispensing</Link>
              </Button>
            ) : null}

            {canWard ? (
              <>
                <Button asChild variant="outline">
                  <Link href={`/h/${hospitalSlug}/ward/admissions`}>Inpatient Ward</Link>
                </Button>

                <Button asChild variant="outline">
                  <Link href={`/h/${hospitalSlug}/ward/census`}>Bed & Patient Census</Link>
                </Button>
              </>
            ) : null}

            {canAdmin ? (
              <Button asChild variant="outline">
                <Link href={`/h/${hospitalSlug}/ward/config`}>Ward Config</Link>
              </Button>
            ) : null}

            {canPatientRegistry ? (
              <Button asChild variant="outline">
                <Link href={`/h/${hospitalSlug}/patients`}>Patient Directory</Link>
              </Button>
            ) : null}

            {canClinicalShared ? (
              <Button asChild variant="outline">
                <Link href={`/h/${hospitalSlug}/appointments`}>Appointments Queue</Link>
              </Button>
            ) : null}

            {canClinicalShared ? (
              <Button asChild variant="outline">
                <Link href={`/h/${hospitalSlug}/encounters`}>Clinical Encounters</Link>
              </Button>
            ) : null}

            {canBilling ? (
              <Button asChild variant="outline">
                <Link href={`/h/${hospitalSlug}/billing`}>Payments & Billing</Link>
              </Button>
            ) : null}

            {canAdmin ? (
              <>
                <Button asChild variant="outline">
                  <Link href={`/h/${hospitalSlug}/admin/access`}>Access Control</Link>
                </Button>

                <Button asChild variant="outline">
                  <Link href={`/h/${hospitalSlug}/staff`}>Staff Management</Link>
                </Button>

                <Button asChild variant="outline">
                  <Link href={`/h/${hospitalSlug}/settings`}>Hospital Settings</Link>
                </Button>

                <Button asChild variant="outline">
                  <Link href={`/h/${hospitalSlug}/activity`}>Audit Activity</Link>
                </Button>
              </>
            ) : null}

            <Button variant="destructive" onClick={handleLogout}>
              Logout
            </Button>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}


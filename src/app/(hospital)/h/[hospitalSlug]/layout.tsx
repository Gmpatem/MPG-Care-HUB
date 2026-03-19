import Link from "next/link";
import { HospitalShell } from "@/components/layout/hospital-shell";
import { Button } from "@/components/ui/button";
import { getHospitalAccessContext } from "@/lib/auth/get-hospital-access-context";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    hospitalSlug: string;
  }>;
};

export default async function HospitalLayout({
  children,
  params,
}: LayoutProps) {
  const { hospitalSlug } = await params;

  const {
    hospital,
    membership,
    isPlatformOwner,
    allowedWorkspaces,
    hasHospitalAccess,
  } = await getHospitalAccessContext(hospitalSlug);

  if (!hasHospitalAccess) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <div className="space-y-4 rounded-xl border p-6">
          <h1 className="text-2xl font-semibold">Access denied</h1>
          <p className="text-muted-foreground">
            You do not have access to this hospital workspace.
          </p>
          <div className="flex gap-3">
            <Button asChild variant="outline">
              <Link href="/logout">Switch Account</Link>
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <HospitalShell
      hospitalName={hospital.name}
      hospitalSlug={hospital.slug}
      allowedWorkspaces={allowedWorkspaces}
      isPlatformOwner={isPlatformOwner}
      primaryRole={membership?.role ?? null}
    >
      {children}
    </HospitalShell>
  );
}

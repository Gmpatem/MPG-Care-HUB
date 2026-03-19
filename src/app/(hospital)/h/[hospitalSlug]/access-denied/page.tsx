import Link from "next/link";
import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

const workspaceLabels: Record<string, string> = {
  admin: "Administration",
  frontdesk: "Front Desk",
  doctor: "Doctor Workspace",
  nurse: "Nursing Station",
  ward: "Ward Workspace",
  lab: "Laboratory",
  pharmacy: "Pharmacy",
  billing: "Billing",
};

type AccessDeniedPageProps = {
  params: Promise<{
    hospitalSlug: string;
  }>;
  searchParams: Promise<{
    workspace?: string;
  }>;
};

export default async function AccessDeniedPage({
  params,
  searchParams,
}: AccessDeniedPageProps) {
  const { hospitalSlug } = await params;
  const { workspace } = await searchParams;

  const workspaceLabel = workspace
    ? (workspaceLabels[workspace] ?? workspace)
    : "this workspace";

  return (
    <main className="flex min-h-[70vh] items-center justify-center px-4 py-10 sm:px-6">
      <div className="hero-mesh w-full max-w-2xl rounded-[1.6rem] p-[1px] shadow-[0_18px_55px_rgba(11,42,74,0.08)]">
        <div className="rounded-[1.52rem] bg-white/92 p-6 text-center dark:bg-[#101c2c]/88 sm:p-8">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 ring-1 ring-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:ring-amber-900">
            <ShieldAlert className="h-6 w-6" />
          </div>

          <div className="mt-5 space-y-2">
            <p className="eyebrow text-amber-700 dark:text-amber-300">Access restricted</p>
            <h1 className="text-2xl font-semibold tracking-[-0.03em] text-foreground">
              You don&apos;t have access to {workspaceLabel}
            </h1>
            <p className="mx-auto max-w-xl text-sm leading-7 text-muted-foreground">
              Your current hospital role does not include this workspace. If you believe this is a mistake,
              contact your hospital administrator to update your workspace permissions.
            </p>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild>
              <Link href={`/h/${hospitalSlug}`}>Go to Hospital Overview</Link>
            </Button>

            <Button asChild variant="outline">
              <Link href="/logout">Switch Account</Link>
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
}

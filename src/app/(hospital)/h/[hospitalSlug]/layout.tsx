import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HospitalShell } from "@/components/layout/hospital-shell";
import { Button } from "@/components/ui/button";
import { mergeAllowedWorkspaces } from "@/lib/auth/workspaces";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{
    hospitalSlug: string;
  }>;
};

type HospitalRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
};

type MembershipRow = {
  id: string;
  role: string;
  status: string;
};

type WorkspaceAccessRow = {
  workspace_key: string;
};

export default async function HospitalLayout({
  children,
  params,
}: LayoutProps) {
  const { hospitalSlug } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/h/${hospitalSlug}`)}`);
  }

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, name, slug, status")
    .eq("slug", hospitalSlug)
    .maybeSingle<HospitalRow>();

  if (hospitalError) {
    throw new Error(hospitalError.message);
  }

  if (!hospital) {
    notFound();
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, is_platform_owner")
    .eq("id", user.id)
    .maybeSingle<{ id: string; is_platform_owner: boolean }>();

  if (profileError) {
    throw new Error(profileError.message);
  }

  const isPlatformOwner = !!profile?.is_platform_owner;

  const { data: membership, error: membershipError } = await supabase
    .from("hospital_users")
    .select("id, role, status")
    .eq("hospital_id", hospital.id)
    .eq("user_id", user.id)
    .maybeSingle<MembershipRow>();

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  const hasAccess =
    isPlatformOwner || (!!membership && membership.status === "active");

  if (!hasAccess) {
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

  let extraWorkspaces: string[] = [];

  if (!isPlatformOwner && membership?.id) {
    const { data: workspaceRows, error: workspaceError } = await supabase
      .from("hospital_user_workspace_access")
      .select("workspace_key")
      .eq("hospital_id", hospital.id)
      .eq("hospital_user_id", membership.id)
      .eq("active", true)
      .returns<WorkspaceAccessRow[]>();

    if (workspaceError) {
      throw new Error(workspaceError.message);
    }

    extraWorkspaces = (workspaceRows ?? []).map((row) => row.workspace_key);
  }

  const effectiveRole = isPlatformOwner ? "platform_owner" : membership?.role ?? null;
  const allowedWorkspaces = mergeAllowedWorkspaces(
    effectiveRole as any,
    extraWorkspaces
  );

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

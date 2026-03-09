import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { HospitalShell } from "@/components/layout/hospital-shell";
import { Button } from "@/components/ui/button";

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
    .maybeSingle();

  if (hospitalError) {
    throw new Error(hospitalError.message);
  }

  if (!hospital) {
    notFound();
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_platform_owner")
    .eq("id", user.id)
    .maybeSingle();

  const isPlatformOwner = !!profile?.is_platform_owner;

  const { data: membership } = await supabase
    .from("hospital_users")
    .select("id, role, status")
    .eq("hospital_id", hospital.id)
    .eq("user_id", user.id)
    .maybeSingle();

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

  return (
    <HospitalShell hospitalName={hospital.name} hospitalSlug={hospital.slug}>
      {children}
    </HospitalShell>
  );
}

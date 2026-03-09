import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getCurrentProfile } from "@/lib/auth/session";

export default async function PlatformPage() {
  const { supabase, user, profile } = await getCurrentProfile();

  if (profile?.is_platform_owner) {
    const { count } = await supabase
      .from("hospitals")
      .select("*", { count: "exact", head: true });

    return (
      <main className="space-y-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Platform Owner Area</p>
          <h1 className="text-3xl font-bold">MPG Care Hub Platform</h1>
          <p className="text-muted-foreground">
            Welcome back{profile.full_name ? `, ${profile.full_name}` : ""}.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border p-6">
            <p className="text-sm text-muted-foreground">Total hospitals</p>
            <h2 className="mt-2 text-3xl font-bold">{count ?? 0}</h2>
          </div>

          <div className="rounded-xl border p-6 space-y-4">
            <div>
              <p className="text-sm text-muted-foreground">Next action</p>
              <h2 className="mt-2 text-xl font-semibold">
                Manage hospital tenants
              </h2>
            </div>

            <div className="flex gap-3">
              <Button asChild>
                <Link href="/platform/hospitals">View Hospitals</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/platform/hospitals/new">Create Hospital</Link>
              </Button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const { data: firstMembership, error: membershipError } = await supabase
    .from("hospital_users")
    .select(`
      id,
      hospital_id,
      role,
      status,
      hospitals (
        id,
        slug,
        name
      )
    `)
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  const hospital = Array.isArray(firstMembership?.hospitals)
    ? firstMembership?.hospitals[0]
    : firstMembership?.hospitals;

  if (hospital?.slug) {
    redirect(`/h/${hospital.slug}`);
  }

  return (
    <main className="space-y-4">
      <h1 className="text-2xl font-semibold">No workspace access yet</h1>
      <p className="text-muted-foreground">
        Your account is signed in, but it is not a platform owner and does not
        yet belong to any active hospital workspace.
      </p>
      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link href="/logout">Switch Account</Link>
        </Button>
      </div>
    </main>
  );
}

import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

export default async function PlatformHospitalsPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_platform_owner")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_platform_owner) {
    return (
      <main>
        <h1 className="text-2xl font-semibold">Access restricted</h1>
      </main>
    );
  }

  const { data: hospitals, error } = await supabase
    .from("hospitals")
    .select("id, name, slug, type, country_code, currency_code, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="space-y-2">
        <h1 className="text-2xl font-semibold">Failed to load hospitals</h1>
        <p className="text-muted-foreground">{error.message}</p>
      </main>
    );
  }

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Tenants</p>
          <h1 className="text-3xl font-bold">Hospitals</h1>
        </div>

        <Button asChild>
          <Link href="/platform/hospitals/new">Create Hospital</Link>
        </Button>
      </div>

      <div className="rounded-xl border">
        <div className="grid grid-cols-7 gap-4 border-b px-4 py-3 text-sm font-medium text-muted-foreground">
          <div>Name</div>
          <div>Slug</div>
          <div>Type</div>
          <div>Country</div>
          <div>Currency</div>
          <div>Status</div>
          <div>Created</div>
        </div>

        {hospitals && hospitals.length > 0 ? (
          hospitals.map((hospital) => (
            <Link
              key={hospital.id}
              href={`/platform/hospitals/${hospital.id}`}
              className="grid grid-cols-7 gap-4 border-b px-4 py-3 text-sm hover:bg-muted/40 last:border-b-0"
            >
              <div className="font-medium">{hospital.name}</div>
              <div>{hospital.slug}</div>
              <div className="capitalize">{hospital.type}</div>
              <div>{hospital.country_code}</div>
              <div>{hospital.currency_code}</div>
              <div className="capitalize">{hospital.status}</div>
              <div>{new Date(hospital.created_at).toLocaleDateString()}</div>
            </Link>
          ))
        ) : (
          <div className="px-4 py-10 text-sm text-muted-foreground">
            No hospitals yet. Create your first one.
          </div>
        )}
      </div>
    </main>
  );
}

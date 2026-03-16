import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createSelfServeFacility } from "@/features/hospitals/actions/create-self-serve-facility";
import { SubmitButton } from "@/components/forms/submit-button";
import { FormMessage } from "@/components/forms/form-message";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export default async function CreateFacilityPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/onboarding/create-facility");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_platform_owner, full_name")
    .eq("id", user.id)
    .maybeSingle();

  if (profile?.is_platform_owner) {
    redirect("/platform");
  }

  const { data: existingMembership } = await supabase
    .from("hospital_users")
    .select(`
      hospital_id,
      status,
      hospitals (
        slug
      )
    `)
    .eq("user_id", user.id)
    .eq("status", "active")
    .limit(1)
    .maybeSingle();

  const existingHospital = Array.isArray(existingMembership?.hospitals)
    ? existingMembership?.hospitals[0]
    : existingMembership?.hospitals;

  if (existingHospital?.slug) {
    redirect(`/h/${existingHospital.slug}`);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl items-center px-6 py-12">
      <div className="w-full space-y-6 rounded-2xl border p-8">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Onboarding</p>
          <h1 className="text-3xl font-bold">Create Your Facility</h1>
          <p className="text-muted-foreground">
            Set up your clinic, hospital, maternity center, or healthcare practice.
          </p>
          {profile?.full_name ? (
            <p className="text-sm text-muted-foreground">
              Welcome, {profile.full_name}.
            </p>
          ) : null}
        </div>

        <FormMessage
          type="info"
          message="You will become the hospital admin for this new workspace."
        />

        <form action={createSelfServeFacility} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Facility Name</label>
              <Input
                name="name"
                placeholder="Mercy Clinic"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Facility Type</label>
              <select
                name="type"
                required
                defaultValue="clinic"
                className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="clinic">clinic</option>
                <option value="hospital">hospital</option>
                <option value="maternity">maternity</option>
                <option value="practice">practice</option>
                <option value="clinic">clinic</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input
                name="phone"
                placeholder="+237..."
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Facility Email</label>
              <Input
                name="email"
                type="email"
                placeholder="contact@facility.com"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Timezone</label>
              <Input
                name="timezone"
                defaultValue="Africa/Douala"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Currency Code</label>
              <Input
                name="currency_code"
                defaultValue="XAF"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Address</label>
            <Textarea
              name="address_text"
              placeholder="Facility address"
            />
          </div>

          <div className="flex gap-3">
            <SubmitButton pendingText="Creating facility...">
              Create Facility
            </SubmitButton>
          </div>
        </form>
      </div>
    </main>
  );
}


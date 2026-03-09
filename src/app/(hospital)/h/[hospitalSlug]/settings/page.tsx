import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateHospitalSettings } from "@/features/hospitals/actions/update-hospital-settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from "@/components/forms/submit-button";
import { FormMessage } from "@/components/forms/form-message";

type PageProps = {
  params: Promise<{
    hospitalSlug: string;
  }>;
  searchParams: Promise<{
    success?: string;
  }>;
};

export default async function HospitalSettingsPage({ params, searchParams }: PageProps) {
  const { hospitalSlug } = await params;
  const { success } = await searchParams;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/h/${hospitalSlug}/settings`)}`);
  }

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select(`
      id,
      name,
      slug,
      status,
      phone,
      email,
      address_text,
      timezone,
      currency_code,
      created_at
    `)
    .eq("slug", hospitalSlug)
    .maybeSingle();

  if (hospitalError) {
    throw new Error(hospitalError.message);
  }

  if (!hospital) notFound();

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

  const canManage =
    isPlatformOwner ||
    (!!membership && membership.status === "active" && membership.role === "hospital_admin");

  return (
    <main className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Settings</p>
        <h1 className="text-3xl font-bold">Hospital Settings</h1>
        <p className="text-muted-foreground">{hospital.name}</p>
      </div>

      {success === "1" ? (
        <FormMessage
          type="success"
          message="Hospital settings saved successfully."
        />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border p-6">
          <h2 className="text-xl font-semibold">Workspace Info</h2>
          <div className="mt-4 space-y-2 text-sm">
            <p><span className="font-medium">Slug:</span> {hospital.slug}</p>
            <p><span className="font-medium">Status:</span> {hospital.status}</p>
            <p><span className="font-medium">Created:</span> {new Date(hospital.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="rounded-xl border p-6">
          <h2 className="text-xl font-semibold">Permissions</h2>
          <div className="mt-4 space-y-2 text-sm">
            <p>
              <span className="font-medium">Your access:</span>{" "}
              {isPlatformOwner ? "platform_owner" : membership?.role ?? "unknown"}
            </p>
            <p>
              <span className="font-medium">Can edit settings:</span>{" "}
              {canManage ? "yes" : "no"}
            </p>
          </div>
        </div>
      </div>

      <form action={updateHospitalSettings} className="max-w-3xl space-y-6 rounded-xl border p-6">
        <input type="hidden" name="hospital_id" value={hospital.id} />
        <input type="hidden" name="hospital_slug" value={hospital.slug} />

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Hospital Name</label>
            <Input
              name="name"
              defaultValue={hospital.name}
              required
              disabled={!canManage}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Slug</label>
            <Input value={hospital.slug} disabled readOnly />
            <p className="text-xs text-muted-foreground">
              Slug is read-only for now to avoid breaking links.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Phone</label>
            <Input
              name="phone"
              defaultValue={hospital.phone ?? ""}
              placeholder="+237..."
              disabled={!canManage}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email</label>
            <Input
              name="email"
              type="email"
              defaultValue={hospital.email ?? ""}
              placeholder="contact@hospital.com"
              disabled={!canManage}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Timezone</label>
            <Input
              name="timezone"
              defaultValue={hospital.timezone ?? "Africa/Douala"}
              disabled={!canManage}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Currency Code</label>
            <Input
              name="currency_code"
              defaultValue={hospital.currency_code ?? "XAF"}
              disabled={!canManage}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Address</label>
          <Textarea
            name="address_text"
            defaultValue={hospital.address_text ?? ""}
            placeholder="Hospital address"
            disabled={!canManage}
          />
        </div>

        {canManage ? (
          <div className="flex gap-3">
            <SubmitButton pendingText="Saving settings...">
              Save Settings
            </SubmitButton>
            <Button type="reset" variant="outline">Reset</Button>
          </div>
        ) : (
          <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
            You can view these settings, but only a hospital admin or platform owner can edit them.
          </div>
        )}
      </form>
    </main>
  );
}

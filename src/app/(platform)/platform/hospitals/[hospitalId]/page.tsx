import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createInvitation } from "@/features/invitations/actions/create-invitation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type PageProps = {
  params: Promise<{
    hospitalId: string;
  }>;
};

export default async function HospitalDetailPage({ params }: PageProps) {
  const { hospitalId } = await params;

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
      <main className="space-y-2">
        <h1 className="text-2xl font-semibold">Access restricted</h1>
        <p className="text-muted-foreground">
          Only platform owners can access this page right now.
        </p>
      </main>
    );
  }

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, name, slug, type, status, country_code, currency_code, timezone, created_at")
    .eq("id", hospitalId)
    .maybeSingle();

  if (hospitalError) {
    throw new Error(hospitalError.message);
  }

  if (!hospital) {
    notFound();
  }

  const { data: invitations, error: invitationsError } = await supabase
    .from("invitations")
    .select("id, email, role, token, status, expires_at, created_at")
    .eq("hospital_id", hospital.id)
    .order("created_at", { ascending: false });

  if (invitationsError) {
    throw new Error(invitationsError.message);
  }

  return (
    <main className="space-y-8">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Hospital detail</p>
          <h1 className="text-3xl font-bold">{hospital.name}</h1>
          <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
            <span>Slug: {hospital.slug}</span>
            <span>Type: {hospital.type}</span>
            <span>Status: {hospital.status}</span>
            <span>Currency: {hospital.currency_code}</span>
            <span>Timezone: {hospital.timezone}</span>
          </div>
        </div>

        <Button asChild variant="outline">
          <Link href="/platform/hospitals">Back to Hospitals</Link>
        </Button>
      </div>

      <section className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border p-6">
          <div>
            <p className="text-sm text-muted-foreground">Invite first admin</p>
            <h2 className="text-xl font-semibold">Create Hospital Admin Invite</h2>
          </div>

          <form action={createInvitation} className="space-y-4">
            <input type="hidden" name="hospital_id" value={hospital.id} />

            <div className="space-y-2">
              <label className="text-sm font-medium">Admin Email</label>
              <Input
                name="email"
                type="email"
                placeholder="admin@hospital.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <select
                name="role"
                defaultValue="hospital_admin"
                className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="hospital_admin">hospital_admin</option>
                <option value="receptionist">receptionist</option>
                <option value="doctor">doctor</option>
                <option value="nurse">nurse</option>
                <option value="cashier">cashier</option>
              </select>
            </div>

            <Button type="submit">Create Invitation</Button>
          </form>
        </div>

        <div className="space-y-4 rounded-xl border p-6">
          <div>
            <p className="text-sm text-muted-foreground">Tenant launch status</p>
            <h2 className="text-xl font-semibold">What happens next</h2>
          </div>

          <ol className="list-decimal space-y-2 pl-5 text-sm text-muted-foreground">
            <li>Create the invitation here</li>
            <li>Copy the generated invite link from the list below</li>
            <li>Open it in another browser or send it manually</li>
            <li>The invited user signs in with the invited email</li>
            <li>They accept and become a hospital member</li>
          </ol>
        </div>
      </section>

      <section className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground">Invitations</p>
          <h2 className="text-2xl font-semibold">Invite Links</h2>
        </div>

        <div className="rounded-xl border">
          <div className="grid grid-cols-6 gap-4 border-b px-4 py-3 text-sm font-medium text-muted-foreground">
            <div>Email</div>
            <div>Role</div>
            <div>Status</div>
            <div>Expires</div>
            <div>Created</div>
            <div>Accept Link</div>
          </div>

          {invitations && invitations.length > 0 ? (
            invitations.map((invite) => {
              const inviteUrl = `/accept-invite?token=${invite.token}`;

              return (
                <div
                  key={invite.id}
                  className="grid grid-cols-6 gap-4 border-b px-4 py-3 text-sm last:border-b-0"
                >
                  <div>{invite.email}</div>
                  <div>{invite.role}</div>
                  <div className="capitalize">{invite.status}</div>
                  <div>{new Date(invite.expires_at).toLocaleDateString()}</div>
                  <div>{new Date(invite.created_at).toLocaleDateString()}</div>
                  <div>
                    <Link
                      href={inviteUrl}
                      className="text-primary underline underline-offset-4"
                    >
                      Open invite
                    </Link>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="px-4 py-10 text-sm text-muted-foreground">
              No invitations yet.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

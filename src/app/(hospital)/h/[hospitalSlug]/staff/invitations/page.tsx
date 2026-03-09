import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

type PageProps = {
  params: Promise<{
    hospitalSlug: string;
  }>;
};

export default async function StaffInvitationsPage({ params }: PageProps) {
  const { hospitalSlug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: hospital } = await supabase
    .from("hospitals")
    .select("id, name, slug")
    .eq("slug", hospitalSlug)
    .maybeSingle();

  if (!hospital) notFound();

  const { data: invitations, error } = await supabase
    .from("invitations")
    .select("id, email, role, status, token, expires_at, created_at")
    .eq("hospital_id", hospital.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Staff</p>
          <h1 className="text-3xl font-bold">Invitations</h1>
          <p className="text-muted-foreground">{hospital.name}</p>
        </div>

        <Button asChild variant="outline">
          <Link href={`/h/${hospital.slug}/staff`}>Back to Staff</Link>
        </Button>
      </div>

      <div className="rounded-xl border">
        <div className="grid grid-cols-6 gap-4 border-b px-4 py-3 text-sm font-medium text-muted-foreground">
          <div>Email</div>
          <div>Role</div>
          <div>Status</div>
          <div>Expires</div>
          <div>Created</div>
          <div>Invite Link</div>
        </div>

        {invitations && invitations.length > 0 ? (
          invitations.map((invite) => {
            const inviteUrl = `${baseUrl}/accept-invite?token=${invite.token}`;

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
                <div className="space-y-1">
                  <a
                    href={inviteUrl}
                    className="text-primary underline underline-offset-4"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open invite
                  </a>
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
    </main>
  );
}

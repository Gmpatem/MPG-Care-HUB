import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { acceptInvitation } from "@/features/invitations/actions/accept-invitation";
import { Button } from "@/components/ui/button";

type PageProps = {
  searchParams: Promise<{
    token?: string;
  }>;
};

export default async function AcceptInvitePage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  if (!token) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <h1 className="text-2xl font-semibold">Invalid invite link</h1>
        <p className="mt-2 text-muted-foreground">
          This invitation link is missing its token.
        </p>
      </main>
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const loginNext = `/accept-invite?token=${encodeURIComponent(token)}`;

  if (!user) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <div className="space-y-6 rounded-xl border p-6">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Invitation</p>
            <h1 className="text-3xl font-bold">Sign in to continue</h1>
            <p className="text-muted-foreground">
              Log in with the invited email address before this invitation can be verified.
            </p>
          </div>

          <Button asChild>
            <Link href={`/login?next=${encodeURIComponent(loginNext)}`}>
              Go to Login
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  const { data: invitation, error } = await supabase
    .from("invitations")
    .select("id, email, role, status, expires_at, hospital_id")
    .eq("token", token)
    .maybeSingle();

  if (error) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <h1 className="text-2xl font-semibold">Failed to load invite</h1>
        <p className="mt-2 text-muted-foreground">{error.message}</p>
      </main>
    );
  }

  if (!invitation) {
    return (
      <main className="mx-auto max-w-xl p-6">
        <div className="space-y-4 rounded-xl border p-6">
          <h1 className="text-2xl font-semibold">Invitation not available</h1>
          <p className="text-muted-foreground">
            No visible invitation was found for this token and signed-in account.
          </p>
          <p className="text-sm text-muted-foreground">
            Signed in as: {user.email ?? "Unknown"}
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

  const { data: hospital } = await supabase
    .from("hospitals")
    .select("id, name, slug")
    .eq("id", invitation.hospital_id)
    .maybeSingle();

  const isExpired = new Date(invitation.expires_at).getTime() < Date.now();
  const signedInEmail = user.email?.toLowerCase() ?? "";
  const invitedEmail = invitation.email.toLowerCase();
  const emailMatches = signedInEmail === invitedEmail;

  return (
    <main className="mx-auto max-w-xl p-6">
      <div className="space-y-6 rounded-xl border p-6">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Invitation</p>
          <h1 className="text-3xl font-bold">Join Hospital Workspace</h1>
          <p className="text-muted-foreground">
            You were invited to join {hospital?.name ?? "this hospital"} as{" "}
            <span className="font-medium">{invitation.role}</span>.
          </p>
        </div>

        <div className="space-y-2 text-sm">
          <p>
            <span className="font-medium">Invite email:</span> {invitation.email}
          </p>
          <p>
            <span className="font-medium">Signed in as:</span> {user.email ?? "Unknown"}
          </p>
          <p>
            <span className="font-medium">Status:</span> {invitation.status}
          </p>
          <p>
            <span className="font-medium">Expires:</span>{" "}
            {new Date(invitation.expires_at).toLocaleString()}
          </p>
        </div>

        {invitation.status !== "pending" ? (
          <p className="text-sm text-muted-foreground">
            This invitation is no longer pending.
          </p>
        ) : isExpired ? (
          <p className="text-sm text-muted-foreground">
            This invitation has expired.
          </p>
        ) : !emailMatches ? (
          <div className="space-y-3">
            <p className="text-sm text-destructive">
              This invite is for {invitation.email}, but you are signed in as {user.email}.
            </p>
            <div className="flex gap-3">
              <Button asChild variant="outline">
                <Link href="/logout">Sign Out</Link>
              </Button>
              <Button asChild>
                <Link href={`/login?next=${encodeURIComponent(loginNext)}`}>
                  Login with Correct Email
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <form action={acceptInvitation} className="space-y-3">
            <input type="hidden" name="token" value={token} />
            <Button type="submit">Accept Invitation</Button>
          </form>
        )}
      </div>
    </main>
  );
}

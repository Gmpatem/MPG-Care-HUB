"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function acceptInvitation(formData: FormData) {
  const supabase = await createClient();

  const token = String(formData.get("token") ?? "");

  if (!token) {
    throw new Error("Missing invitation token");
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: invitation, error: inviteError } = await supabase
    .from("invitations")
    .select("id, hospital_id, email, role, status, expires_at")
    .eq("token", token)
    .maybeSingle();

  if (inviteError) {
    throw new Error(inviteError.message);
  }

  if (!invitation) {
    throw new Error("Invitation not found");
  }

  if (invitation.status !== "pending") {
    throw new Error("Invitation is no longer pending");
  }

  if (new Date(invitation.expires_at).getTime() < Date.now()) {
    throw new Error("Invitation has expired");
  }

  const authEmail = user.email?.toLowerCase() ?? "";

  if (!authEmail) {
    throw new Error("Signed-in account does not have an email");
  }

  if (authEmail !== invitation.email.toLowerCase()) {
    throw new Error("This invite belongs to a different email address");
  }

  // Ensure profile exists before hospital_users insert
  const { error: profileError } = await supabase
    .from("profiles")
    .upsert(
      {
        id: user.id,
        email: user.email ?? null,
        full_name:
          user.user_metadata?.full_name ??
          user.user_metadata?.name ??
          user.email?.split("@")[0] ??
          "New User",
      },
      {
        onConflict: "id",
      }
    );

  if (profileError) {
    throw new Error(profileError.message);
  }

  const { error: membershipError } = await supabase
    .from("hospital_users")
    .insert({
      hospital_id: invitation.hospital_id,
      user_id: user.id,
      role: invitation.role,
      status: "active",
      joined_at: new Date().toISOString(),
    });

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  const { error: invitationUpdateError } = await supabase
    .from("invitations")
    .update({
      status: "accepted",
      accepted_by: user.id,
      accepted_at: new Date().toISOString(),
    })
    .eq("id", invitation.id);

  if (invitationUpdateError) {
    throw new Error(invitationUpdateError.message);
  }

  const { data: hospital } = await supabase
    .from("hospitals")
    .select("slug")
    .eq("id", invitation.hospital_id)
    .maybeSingle();

  revalidatePath("/platform/hospitals");
  revalidatePath(`/platform/hospitals/${invitation.hospital_id}`);

  if (hospital?.slug) {
    redirect(`/h/${hospital.slug}`);
  }

  redirect("/platform");
}

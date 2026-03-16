"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { sendHospitalInvitationEmail } from "@/lib/email/send-hospital-invitation-email";

const ALLOWED_ROLES = [
  "hospital_admin",
  "receptionist",
  "doctor",
  "nurse",
  "cashier",
] as const;

const ALLOWED_DELIVERY_MODES = ["automatic", "manual"] as const;

export type CreateHospitalAccessInvitationState = {
  success?: boolean;
  error?: string;
  inviteUrl?: string;
  emailSent?: boolean;
  deliveryMode?: "automatic" | "manual";
  info?: string;
};

export async function createHospitalAccessInvitation(
  hospitalSlug: string,
  _prevState: CreateHospitalAccessInvitationState,
  formData: FormData
): Promise<CreateHospitalAccessInvitationState> {
  const supabase = await createClient();

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "").trim();
  const deliveryMode = String(formData.get("delivery_mode") ?? "manual").trim();

  if (!email) return { error: "Email is required." };
  if (!ALLOWED_ROLES.includes(role as (typeof ALLOWED_ROLES)[number])) {
    return { error: "Invalid role selected." };
  }
  if (!ALLOWED_DELIVERY_MODES.includes(deliveryMode as (typeof ALLOWED_DELIVERY_MODES)[number])) {
    return { error: "Invalid delivery mode selected." };
  }

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "You must be signed in." };
  }

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug")
    .eq("slug", hospitalSlug)
    .maybeSingle<{ id: string; slug: string }>();

  if (hospitalError) return { error: hospitalError.message };
  if (!hospital) return { error: "Hospital not found." };

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_platform_owner")
    .eq("id", user.id)
    .maybeSingle<{ id: string; is_platform_owner: boolean }>();

  const { data: membership } = await supabase
    .from("hospital_users")
    .select("id, role, status")
    .eq("hospital_id", hospital.id)
    .eq("user_id", user.id)
    .eq("status", "active")
    .maybeSingle<{ id: string; role: string; status: string }>();

  const isAllowed =
    Boolean(profile?.is_platform_owner) ||
    Boolean(membership && membership.role === "hospital_admin");

  if (!isAllowed) {
    return { error: "Only hospital admins or platform owners can invite users." };
  }

  const { data: existingInvite } = await supabase
    .from("invitations")
    .select("id")
    .eq("hospital_id", hospital.id)
    .eq("email", email)
    .eq("status", "pending")
    .maybeSingle();

  if (existingInvite) {
    return { error: "There is already a pending invitation for this email." };
  }

  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();

  const { error: insertError } = await supabase
    .from("invitations")
    .insert({
      hospital_id: hospital.id,
      email,
      role,
      token,
      status: "pending",
      expires_at: expiresAt,
      invited_by: user.id,
    });

  if (insertError) return { error: insertError.message };

  const appUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    "http://localhost:3000";

  const inviteUrl = `${appUrl.replace(/\/$/, "")}/accept-invite?token=${token}`;

  let emailSent = false;
  let info: string | undefined;

  if (deliveryMode === "automatic") {
    const emailResult = await sendHospitalInvitationEmail({
      to: email,
      hospitalSlug: hospital.slug,
      role,
      inviteUrl,
    });

    emailSent = emailResult.sent;

    if (!emailResult.sent) {
      info = emailResult.error || "Invitation created, but automatic email could not be sent.";
    } else {
      info = "Invitation created and email sent successfully.";
    }
  } else {
    info = "Invitation created. Copy and share the invite link below.";
  }

  revalidatePath(`/h/${hospital.slug}/admin/access`);
  revalidatePath(`/h/${hospital.slug}/staff/invitations`);

  return {
    success: true,
    inviteUrl,
    emailSent,
    deliveryMode: deliveryMode as "automatic" | "manual",
    info,
  };
}

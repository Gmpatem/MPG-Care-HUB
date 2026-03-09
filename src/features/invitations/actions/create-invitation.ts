"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createInvitationSchema } from "@/features/invitations/schemas/invitation.schema";

export async function createInvitation(formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const values = {
    hospital_id: String(formData.get("hospital_id") ?? ""),
    email: String(formData.get("email") ?? "").trim().toLowerCase(),
    role: String(formData.get("role") ?? ""),
  };

  const parsed = createInvitationSchema.safeParse(values);

  if (!parsed.success) {
    throw new Error(parsed.error.issues[0]?.message ?? "Invalid invitation data");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("id, is_platform_owner")
    .eq("id", user.id)
    .maybeSingle();

  if (!profile?.is_platform_owner) {
    throw new Error("Only platform owners can create hospital admin invites at this stage");
  }

  const token = crypto.randomBytes(24).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7).toISOString();

  const { error } = await supabase
    .from("invitations")
    .insert({
      hospital_id: parsed.data.hospital_id,
      email: parsed.data.email,
      role: parsed.data.role,
      token,
      status: "pending",
      expires_at: expiresAt,
      invited_by: user.id,
    });

  if (error) {
    throw new Error(error.message);
  }

  revalidatePath(`/platform/hospitals/${parsed.data.hospital_id}`);
  redirect(`/platform/hospitals/${parsed.data.hospital_id}`);
}

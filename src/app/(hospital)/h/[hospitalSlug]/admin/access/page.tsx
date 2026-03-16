import { notFound, redirect } from "next/navigation";
import { getAccessSetupData } from "@/features/admin-setup/server/get-access-setup-data";
import { AccessAdminPage } from "@/features/admin-setup/components/access-admin-page";
import { createClient } from "@/lib/supabase/server";

type HospitalRow = {
  id: string;
  slug: string;
  name: string;
};

type MembershipRow = {
  id: string;
  role: string;
  status: string;
};

export default async function AdminAccessRoute({
  params,
}: {
  params: Promise<{ hospitalSlug: string }>;
}) {
  const { hospitalSlug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    redirect("/login");
  }

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, slug, name")
    .eq("slug", hospitalSlug)
    .maybeSingle<HospitalRow>();

  if (hospitalError) {
    throw new Error(hospitalError.message);
  }

  if (!hospital) {
    notFound();
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("id, is_platform_owner")
    .eq("id", user.id)
    .maybeSingle<{ id: string; is_platform_owner: boolean }>();

  if (profileError) {
    throw new Error(profileError.message);
  }

  const { data: membership, error: membershipError } = await supabase
    .from("hospital_users")
    .select("id, role, status")
    .eq("hospital_id", hospital.id)
    .eq("user_id", user.id)
    .maybeSingle<MembershipRow>();

  if (membershipError) {
    throw new Error(membershipError.message);
  }

  const isAllowed =
    Boolean(profile?.is_platform_owner) ||
    Boolean(
      membership &&
        membership.status === "active" &&
        membership.role === "hospital_admin"
    );

  if (!isAllowed) {
    redirect(`/h/${hospitalSlug}`);
  }

  const data = await getAccessSetupData(hospitalSlug);

  return (
    <AccessAdminPage
      hospitalSlug={data.hospital.slug}
      hospitalName={data.hospital.name}
      memberships={data.memberships}
      invitations={data.invitations}
    />
  );
}

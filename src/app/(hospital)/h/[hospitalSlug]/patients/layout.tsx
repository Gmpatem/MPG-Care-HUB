import { requireHospitalWorkspaceAccess } from "@/lib/auth/require-hospital-workspace-access";

export default async function ProtectedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ hospitalSlug: string }>;
}) {
  const { hospitalSlug } = await params;

  await requireHospitalWorkspaceAccess(hospitalSlug, ["admin", "frontdesk", "doctor", "nurse", "ward", "billing"]);

  return <>{children}</>;
}

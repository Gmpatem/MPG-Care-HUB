import { DepartmentsAdminPage } from "@/features/admin-setup/components/departments-admin-page";
import { getAdminSetupData } from "@/features/admin-setup/server/get-admin-setup-data";

type Props = {
  params: Promise<{
    hospitalSlug: string;
  }>;
};

export default async function AdminDepartmentsRoute({ params }: Props) {
  const { hospitalSlug } = await params;
  const data = await getAdminSetupData(hospitalSlug);

  return (
    <DepartmentsAdminPage
      hospitalSlug={hospitalSlug}
      hospitalName={data.hospital.name}
      departments={data.departments}
    />
  );
}
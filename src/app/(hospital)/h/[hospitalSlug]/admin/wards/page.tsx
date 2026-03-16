import { WardsAdminPage } from "@/features/admin-setup/components/wards-admin-page";
import { getAdminSetupData } from "@/features/admin-setup/server/get-admin-setup-data";

type Props = {
  params: Promise<{
    hospitalSlug: string;
  }>;
};

export default async function AdminWardsRoute({ params }: Props) {
  const { hospitalSlug } = await params;
  const data = await getAdminSetupData(hospitalSlug);

  return (
    <WardsAdminPage
      hospitalSlug={hospitalSlug}
      hospitalName={data.hospital.name}
      departments={data.departments.map((department) => ({
        id: department.id,
        name: department.name,
      }))}
      wards={data.wards}
    />
  );
}
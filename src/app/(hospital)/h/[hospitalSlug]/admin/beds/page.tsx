import { BedsAdminPage } from "@/features/admin-setup/components/beds-admin-page";
import { getAdminSetupData } from "@/features/admin-setup/server/get-admin-setup-data";

type Props = {
  params: Promise<{
    hospitalSlug: string;
  }>;
};

export default async function AdminBedsRoute({ params }: Props) {
  const { hospitalSlug } = await params;
  const data = await getAdminSetupData(hospitalSlug);

  return (
    <BedsAdminPage
      hospitalSlug={hospitalSlug}
      hospitalName={data.hospital.name}
      wards={data.wards.map((ward) => ({
        id: ward.id,
        name: ward.name,
        code: ward.code,
      }))}
      beds={data.beds}
    />
  );
}
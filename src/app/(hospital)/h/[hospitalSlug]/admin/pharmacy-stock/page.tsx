import { PharmacyStockAdminPage } from "@/features/admin-setup/components/pharmacy-stock-admin-page";
import { getPharmacySetupData } from "@/features/admin-setup/server/get-pharmacy-setup-data";

type Props = {
  params: Promise<{
    hospitalSlug: string;
  }>;
};

export default async function AdminPharmacyStockRoute({ params }: Props) {
  const { hospitalSlug } = await params;
  const data = await getPharmacySetupData(hospitalSlug);

  return (
    <PharmacyStockAdminPage
      hospitalSlug={hospitalSlug}
      hospitalName={data.hospital.name}
      medications={data.medications}
      batches={data.batches}
    />
  );
}
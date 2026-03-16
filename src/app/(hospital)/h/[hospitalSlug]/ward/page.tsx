import { WardDashboardPage } from "@/features/ward/components/ward-dashboard-page";
import { getWardDashboardData } from "@/features/ward/server/get-ward-dashboard-data";

type Props = {
  params: Promise<{
    hospitalSlug: string;
  }>;
};

export default async function WardDashboardRoute({ params }: Props) {
  const { hospitalSlug } = await params;
  const data = await getWardDashboardData(hospitalSlug);

  return (
    <WardDashboardPage
      hospitalSlug={hospitalSlug}
      hospitalName={data.hospital.name}
      wards={data.wards}
      admissions={data.admissions}
      stats={data.stats}
    />
  );
}
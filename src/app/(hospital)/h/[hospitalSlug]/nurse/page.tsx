import { NurseDashboardPage } from "@/features/nurse/components/nurse-dashboard-page";
import { getNurseDashboardData } from "@/features/nurse/server/get-nurse-dashboard-data";

type Props = {
  params: Promise<{
    hospitalSlug: string;
  }>;
};

export default async function NurseDashboardRoute({ params }: Props) {
  const { hospitalSlug } = await params;
  const data = await getNurseDashboardData(hospitalSlug);

  return (
    <NurseDashboardPage
      hospitalSlug={hospitalSlug}
      hospitalName={data.hospital.name}
      admissions={data.admissions}
      stats={data.stats}
    />
  );
}
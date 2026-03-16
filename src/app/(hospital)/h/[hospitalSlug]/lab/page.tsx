import { getLabPageData } from "@/features/lab/server/get-lab-page-data";
import { LabDashboard } from "@/features/lab/components/lab-dashboard";

type PageProps = {
  params: Promise<{ hospitalSlug: string }>;
};

export default async function LabPage({ params }: PageProps) {
  const { hospitalSlug } = await params;
  const data = await getLabPageData(hospitalSlug);

  return (
    <LabDashboard
      hospitalSlug={data.hospital.slug}
      hospitalName={data.hospital.name}
      totalTests={data.stats.totalTests}
      activeTests={data.stats.activeTests}
      pendingOrders={data.stats.pendingOrders}
      completedToday={data.stats.completedToday}
    />
  );
}

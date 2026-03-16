import { getLabOrdersPageData } from "@/features/lab/server/get-lab-orders-page-data";
import { LabOrdersPage } from "@/features/lab/components/lab-orders-page";

type PageProps = {
  params: Promise<{ hospitalSlug: string }>;
};

export default async function LabOrdersRoute({ params }: PageProps) {
  const { hospitalSlug } = await params;
  const data = await getLabOrdersPageData(hospitalSlug);

  return (
    <LabOrdersPage
      hospitalSlug={data.hospital.slug}
      hospitalName={data.hospital.name}
      orders={data.orders}
    />
  );
}
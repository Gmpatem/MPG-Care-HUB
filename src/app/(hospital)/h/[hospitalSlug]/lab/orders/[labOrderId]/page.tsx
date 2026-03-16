import { getLabOrderDetail } from "@/features/lab/server/get-lab-order-detail";
import { LabOrderDetailPage } from "@/features/lab/components/lab-order-detail-page";

type PageProps = {
  params: Promise<{ hospitalSlug: string; labOrderId: string }>;
};

export default async function LabOrderDetailRoute({ params }: PageProps) {
  const { hospitalSlug, labOrderId } = await params;
  const data = await getLabOrderDetail(hospitalSlug, labOrderId);

  return (
    <LabOrderDetailPage
      hospitalSlug={data.hospital.slug}
      order={data.order}
      items={data.items}
    />
  );
}
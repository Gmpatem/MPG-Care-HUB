import { getPrescriptionDetailData } from "@/features/pharmacy/server/get-prescription-detail-data";
import { PrescriptionDetailPage } from "@/features/pharmacy/components/prescription-detail-page";

type PageProps = {
  params: Promise<{ hospitalSlug: string; prescriptionId: string }>;
};

export default async function PrescriptionDetailRoute({ params }: PageProps) {
  const { hospitalSlug, prescriptionId } = await params;
  const data = await getPrescriptionDetailData(hospitalSlug, prescriptionId);

  return (
    <PrescriptionDetailPage
      hospitalSlug={data.hospital.slug}
      prescription={data.prescription}
      items={data.items}
      dispensations={data.dispensations}
    />
  );
}
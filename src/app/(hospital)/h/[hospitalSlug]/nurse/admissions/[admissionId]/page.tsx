import { NurseAdmissionChartPage } from "@/features/nurse/components/nurse-admission-chart-page";
import { getNurseAdmissionChartData } from "@/features/nurse/server/get-nurse-admission-chart-data";

type Props = {
  params: Promise<{
    hospitalSlug: string;
    admissionId: string;
  }>;
};

export default async function NurseAdmissionChartRoute({ params }: Props) {
  const { hospitalSlug, admissionId } = await params;
  const data = await getNurseAdmissionChartData(hospitalSlug, admissionId);

  return (
    <NurseAdmissionChartPage
      hospitalSlug={hospitalSlug}
      admission={data.admission}
      vitals={data.vitals}
      notes={data.notes}
      checklist={data.checklist}
    />
  );
}

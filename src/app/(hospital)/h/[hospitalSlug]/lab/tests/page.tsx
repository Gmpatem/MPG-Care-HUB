import { getLabPageData } from "@/features/lab/server/get-lab-page-data";
import { LabTestsPage } from "@/features/lab/components/lab-tests-page";

type PageProps = {
  params: Promise<{ hospitalSlug: string }>;
};

export default async function LabTestsRoute({ params }: PageProps) {
  const { hospitalSlug } = await params;
  const data = await getLabPageData(hospitalSlug);

  return (
    <LabTestsPage
      hospitalSlug={data.hospital.slug}
      hospitalName={data.hospital.name}
      tests={data.tests}
    />
  );
}
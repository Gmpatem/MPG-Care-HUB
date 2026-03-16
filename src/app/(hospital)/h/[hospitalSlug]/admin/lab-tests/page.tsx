import { LabTestsAdminPage } from "@/features/admin-setup/components/lab-tests-admin-page";
import { getLabSetupData } from "@/features/admin-setup/server/get-lab-setup-data";

type Props = {
  params: Promise<{
    hospitalSlug: string;
  }>;
};

export default async function AdminLabTestsRoute({ params }: Props) {
  const { hospitalSlug } = await params;
  const data = await getLabSetupData(hospitalSlug);

  return (
    <LabTestsAdminPage
      hospitalSlug={hospitalSlug}
      hospitalName={data.hospital.name}
      departments={data.departments}
      labTests={data.labTests}
    />
  );
}
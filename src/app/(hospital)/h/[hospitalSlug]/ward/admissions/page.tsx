import { notFound } from "next/navigation";
import { WardAdmissionIntakePage } from "@/features/ward/components/ward-admission-intake-page";
import { getWardAdmissionIntake } from "@/features/ward/server/get-ward-admission-intake";

type PageProps = {
  params: Promise<{
    hospitalSlug: string;
  }>;
};

export default async function WardAdmissionsPage({ params }: PageProps) {
  const { hospitalSlug } = await params;
  const data = await getWardAdmissionIntake(hospitalSlug);

  if (!data.hospital) notFound();

  return (
    <WardAdmissionIntakePage
      hospitalSlug={data.hospital.slug}
      requests={data.requests}
      wards={data.wards}
      beds={data.beds}
    />
  );
}
import { notFound } from "next/navigation";
import { WardDischargeQueuePage } from "@/features/ward/components/ward-discharge-queue-page";
import { getWardDischargeQueue } from "@/features/ward/server/get-ward-discharge-queue";

type PageProps = {
  params: Promise<{
    hospitalSlug: string;
  }>;
};

export default async function WardDischargesPage({ params }: PageProps) {
  const { hospitalSlug } = await params;
  const data = await getWardDischargeQueue(hospitalSlug);

  if (!data.hospital) notFound();

  return (
    <WardDischargeQueuePage
      hospitalSlug={data.hospital.slug}
      hospitalName={data.hospital.name}
      admissions={data.admissions}
    />
  );
}

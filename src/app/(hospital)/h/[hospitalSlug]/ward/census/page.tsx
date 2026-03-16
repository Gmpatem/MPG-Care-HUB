import { getWardCensus } from "@/features/ward/server/get-ward-census";
import { WardCensusPage } from "@/features/ward/components/ward-census-page";

type PageProps = {
  params: Promise<{ hospitalSlug: string }>;
};

export default async function WardCensusRoute({ params }: PageProps) {
  const { hospitalSlug } = await params;
  const data = await getWardCensus(hospitalSlug);

  return (
    <WardCensusPage
      hospitalSlug={data.hospital.slug}
      hospitalName={data.hospital.name}
      wards={data.wards}
      admissions={data.admissions}
    />
  );
}
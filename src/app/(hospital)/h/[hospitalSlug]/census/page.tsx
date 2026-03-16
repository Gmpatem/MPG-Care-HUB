import { CensusPage } from "@/features/ward/components/census-page";
import { getCensusPageData } from "@/features/ward/server/get-census-page-data";

type Props = {
  params: Promise<{
    hospitalSlug: string;
  }>;
};

export default async function CensusRoute({ params }: Props) {
  const { hospitalSlug } = await params;
  const data = await getCensusPageData(hospitalSlug);

  return (
    <CensusPage
      hospitalSlug={hospitalSlug}
      hospitalName={data.hospital.name}
      wards={data.wards}
      stats={data.stats}
    />
  );
}
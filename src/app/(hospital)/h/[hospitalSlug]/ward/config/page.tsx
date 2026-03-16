import { WardConfigPage } from "@/features/ward/components/ward-config-page";
import { getWardConfigPageData } from "@/features/ward/server/get-ward-config-page-data";

type Props = {
  params: Promise<{
    hospitalSlug: string;
  }>;
};

export default async function WardConfigRoute({ params }: Props) {
  const { hospitalSlug } = await params;
  const data = await getWardConfigPageData(hospitalSlug);

  return (
    <WardConfigPage
      hospitalSlug={hospitalSlug}
      hospitalName={data.hospital.name}
      configs={data.configs}
      wards={data.wards}
      stats={data.stats}
    />
  );
}
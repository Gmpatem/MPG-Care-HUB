import { notFound } from "next/navigation";

import { WardCensusPage } from "@/features/ward/components/ward-census-page";
import { getCensusPageData } from "@/features/ward/server/get-census-page-data";

type PageProps = {
  params: Promise<{ hospitalSlug: string }>;
};

export default async function WardCensusRoute({ params }: PageProps) {
  const { hospitalSlug } = await params;
  const data = await getCensusPageData(hospitalSlug);

  if (!data) {
    notFound();
  }

  return (
    <WardCensusPage
      hospitalSlug={data.hospital.slug}
      wards={data.wards}
      stats={{
        total_wards: data.stats.total_wards,
        total_beds: data.stats.total_beds,
        occupied_beds: data.stats.occupied_beds,
        available_beds: data.stats.available_beds,
        active_admissions: data.stats.total_admissions,
        discharge_requested: data.stats.discharge_requested,
      }}
    />
  );
}

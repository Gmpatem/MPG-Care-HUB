import { notFound } from "next/navigation";
import { FrontdeskPatientSearch } from "@/features/frontdesk/components/frontdesk-patient-search";
import { searchFrontdeskPatients } from "@/features/frontdesk/server/search-frontdesk-patients";

type PageProps = {
  params: Promise<{
    hospitalSlug: string;
  }>;
  searchParams: Promise<{
    q?: string;
  }>;
};

export default async function FrontdeskPatientsPage({
  params,
  searchParams,
}: PageProps) {
  const { hospitalSlug } = await params;
  const { q } = await searchParams;

  const data = await searchFrontdeskPatients({
    hospitalSlug,
    query: q,
  });

  if (!data.hospital) {
    notFound();
  }

  return (
    <FrontdeskPatientSearch
      hospital={data.hospital}
      query={data.query}
      patients={data.patients}
    />
  );
}
import { notFound } from "next/navigation";
import { FrontdeskDashboard } from "@/features/frontdesk/components/frontdesk-dashboard";
import { getFrontdeskDashboard } from "@/features/frontdesk/server/get-frontdesk-dashboard";

type PageProps = {
  params: Promise<{
    hospitalSlug: string;
  }>;
};

export default async function FrontdeskPage({ params }: PageProps) {
  const { hospitalSlug } = await params;
  const data = await getFrontdeskDashboard(hospitalSlug);

  if (!data.hospital) {
    notFound();
  }

  return (
    <FrontdeskDashboard
      hospital={data.hospital}
      summary={data.summary}
      queueRows={data.queueRows}
      staff={data.staff}
    />
  );
}
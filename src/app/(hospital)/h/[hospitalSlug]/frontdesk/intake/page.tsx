import { notFound } from "next/navigation";
import { getFrontdeskIntakePageData } from "@/features/frontdesk/server/get-frontdesk-intake-page-data";
import { FrontdeskSmartIntake } from "@/features/frontdesk/components/frontdesk-smart-intake";

type PageProps = {
  params: Promise<{
    hospitalSlug: string;
  }>;
};

export default async function FrontdeskIntakePage({ params }: PageProps) {
  const { hospitalSlug } = await params;
  const data = await getFrontdeskIntakePageData(hospitalSlug);

  if (!data.hospital) {
    notFound();
  }

  return (
    <FrontdeskSmartIntake
      hospitalSlug={hospitalSlug}
      staff={data.staff}
    />
  );
}

import { notFound } from "next/navigation";
import { FrontdeskQueuePage } from "@/features/frontdesk/components/frontdesk-queue-page";
import { getFrontdeskQueue } from "@/features/frontdesk/server/get-frontdesk-queue";

type PageProps = {
  params: Promise<{
    hospitalSlug: string;
  }>;
};

export default async function FrontdeskQueueRoute({ params }: PageProps) {
  const { hospitalSlug } = await params;
  const data = await getFrontdeskQueue(hospitalSlug);

  if (!data.hospital) {
    notFound();
  }

  return <FrontdeskQueuePage hospital={data.hospital} queueRows={data.queueRows} />;
}
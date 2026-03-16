import { AdmissionActivityTimeline } from "@/features/ward/components/admission-activity-timeline";
import { getAdmissionActivityTimeline } from "@/features/ward/server/get-admission-activity-timeline";

type Props = {
  params: Promise<{
    hospitalSlug: string;
    admissionId: string;
  }>;
};

export default async function AdmissionActivityTimelineRoute({ params }: Props) {
  const { hospitalSlug, admissionId } = await params;
  const data = await getAdmissionActivityTimeline(hospitalSlug, admissionId);

  return (
    <AdmissionActivityTimeline
      hospitalSlug={hospitalSlug}
      admission={data.admission}
      events={data.events}
    />
  );
}
import { notFound } from "next/navigation";
import { DoctorDashboard } from "@/features/doctor-workflow/components/doctor-dashboard";
import { getDoctorDashboard } from "@/features/doctor-workflow/server/get-doctor-dashboard";

type PageProps = {
  params: Promise<{
    hospitalSlug: string;
  }>;
};

export default async function DoctorPage({ params }: PageProps) {
  const { hospitalSlug } = await params;
  const data = await getDoctorDashboard(hospitalSlug);

  if (!data.hospital) {
    notFound();
  }

  return (
    <DoctorDashboard
      hospital={data.hospital}
      summary={data.summary}
      queueRows={data.queueRows}
      stageCounts={data.stageCounts}
    />
  );
}
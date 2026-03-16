import { notFound } from "next/navigation";
import { DoctorPatientWorkspace } from "@/features/doctor-workflow/components/doctor-patient-workspace";
import { getDoctorPatientWorkspace } from "@/features/doctor-workflow/server/get-doctor-patient-workspace";

type PageProps = {
  params: Promise<{
    hospitalSlug: string;
    patientId: string;
  }>;
};

export default async function DoctorPatientWorkspacePage({ params }: PageProps) {
  const { hospitalSlug, patientId } = await params;

  const data = await getDoctorPatientWorkspace({
    hospitalSlug,
    patientId,
  });

  if (!data.hospital || !data.patient) {
    notFound();
  }

  return (
    <DoctorPatientWorkspace
      hospital={data.hospital}
      patient={data.patient}
      latestVitals={data.latestVitals}
      vitalsTimeline={data.vitalsTimeline}
      recentEncounters={data.recentEncounters}
    />
  );
}
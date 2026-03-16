import { DoctorRoundsWorkspacePage } from "@/features/doctor/components/doctor-rounds-workspace-page";
import { getDoctorRoundsWorkspaceData } from "@/features/doctor/server/get-doctor-rounds-workspace-data";

type Props = {
  params: Promise<{
    hospitalSlug: string;
  }>;
};

export default async function DoctorRoundsWorkspaceRoute({ params }: Props) {
  const { hospitalSlug } = await params;
  const data = await getDoctorRoundsWorkspaceData(hospitalSlug);

  return (
    <DoctorRoundsWorkspacePage
      hospitalSlug={hospitalSlug}
      hospitalName={data.hospital.name}
      doctor={data.doctor}
      patients={data.patients}
      stats={data.stats}
    />
  );
}
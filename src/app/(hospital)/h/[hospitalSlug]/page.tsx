import { HospitalCommandDashboard } from "@/features/dashboard/components/hospital-command-dashboard";
import { getHospitalCommandDashboardData } from "@/features/dashboard/server/get-hospital-command-dashboard-data";

type Props = {
  params: Promise<{
    hospitalSlug: string;
  }>;
};

export default async function HospitalDashboardRoute({ params }: Props) {
  const { hospitalSlug } = await params;
  const data = await getHospitalCommandDashboardData(hospitalSlug);

  return (
    <HospitalCommandDashboard
      hospitalSlug={hospitalSlug}
      hospitalName={data.hospital.name}
      stats={data.stats}
      wardLoad={data.ward_load}
      doctorWorkload={data.doctor_workload}
      nurseWorkload={data.nurse_workload}
      frontdeskQueue={data.frontdesk_queue}
    />
  );
}
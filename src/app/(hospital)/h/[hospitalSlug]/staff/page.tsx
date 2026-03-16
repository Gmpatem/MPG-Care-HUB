import { getStaffPageData } from "@/features/staff/server/get-staff-page-data";
import { StaffPage } from "@/features/staff/components/staff-page";

type PageProps = {
  params: Promise<{ hospitalSlug: string }>;
};

export default async function StaffRoute({ params }: PageProps) {
  const { hospitalSlug } = await params;
  const data = await getStaffPageData(hospitalSlug);

  return (
    <StaffPage
      hospitalSlug={data.hospital.slug}
      hospitalName={data.hospital.name}
      staff={data.staff}
    />
  );
}
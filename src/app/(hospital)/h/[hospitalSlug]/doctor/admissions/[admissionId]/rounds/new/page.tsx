import { notFound } from "next/navigation";
import { DoctorRoundForm } from "@/features/doctor-rounds/components/doctor-round-form";
import { getDoctorRoundFormData } from "@/features/doctor-rounds/server/get-doctor-round-form-data";

type PageProps = {
  params: Promise<{
    hospitalSlug: string;
    admissionId: string;
  }>;
};

export default async function DoctorNewRoundPage({ params }: PageProps) {
  const { hospitalSlug, admissionId } = await params;
  const data = await getDoctorRoundFormData({
    hospitalSlug,
    admissionId,
  });

  if (!data.hospital || !data.admission) notFound();

  return (
    <DoctorRoundForm
      hospitalSlug={data.hospital.slug}
      admission={data.admission}
      doctorStaff={data.doctorStaff}
    />
  );
}
import { notFound } from "next/navigation";
import { DoctorLabOrderForm } from "@/features/doctor-workflow/components/doctor-lab-order-form";
import { getLabOrderFormData } from "@/features/doctor-workflow/server/get-lab-order-form-data";

type PageProps = {
  params: Promise<{
    hospitalSlug: string;
    patientId: string;
  }>;
};

export default async function DoctorNewLabOrderPage({ params }: PageProps) {
  const { hospitalSlug, patientId } = await params;

  const data = await getLabOrderFormData({
    hospitalSlug,
    patientId,
  });

  if (!data.hospital || !data.patient) {
    notFound();
  }

  return (
    <DoctorLabOrderForm
      hospitalSlug={data.hospital.slug}
      patient={data.patient}
      doctorStaff={data.doctorStaff}
      labTests={data.labTests}
      latestEncounter={data.latestEncounter}
    />
  );
}
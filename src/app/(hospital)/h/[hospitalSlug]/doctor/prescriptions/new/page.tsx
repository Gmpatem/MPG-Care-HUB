import { DoctorPrescriptionPatientPickerPage } from "@/features/doctor-workflow/components/doctor-prescription-patient-picker-page";
import { getDoctorPrescriptionPatientPicker } from "@/features/doctor-workflow/server/get-doctor-prescription-patient-picker";

type Props = {
  params: Promise<{
    hospitalSlug: string;
  }>;
  searchParams?: Promise<{
    q?: string;
  }>;
};

export default async function DoctorPrescriptionPatientPickerRoute({
  params,
  searchParams,
}: Props) {
  const { hospitalSlug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const q = resolvedSearchParams?.q ?? "";

  const data = await getDoctorPrescriptionPatientPicker(hospitalSlug, q);

  return (
    <DoctorPrescriptionPatientPickerPage
      hospitalSlug={hospitalSlug}
      hospitalName={data.hospital.name}
      patients={data.patients}
      search={data.search}
    />
  );
}
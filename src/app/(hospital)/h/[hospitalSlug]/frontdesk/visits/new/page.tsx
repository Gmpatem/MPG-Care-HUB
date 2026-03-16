import { notFound } from "next/navigation";
import { FrontdeskVisitForm } from "@/features/frontdesk/components/frontdesk-visit-form";
import { getFrontdeskVisitFormData } from "@/features/frontdesk/server/get-frontdesk-visit-form-data";

type PageProps = {
  params: Promise<{
    hospitalSlug: string;
  }>;
  searchParams: Promise<{
    patientId?: string;
    mode?: string;
  }>;
};

export default async function FrontdeskNewVisitPage({
  params,
  searchParams,
}: PageProps) {
  const { hospitalSlug } = await params;
  const { patientId, mode } = await searchParams;

  const data = await getFrontdeskVisitFormData({
    hospitalSlug,
    patientId,
  });

  if (!data.hospital) {
    notFound();
  }

  return (
    <FrontdeskVisitForm
      hospitalSlug={data.hospital.slug}
      patient={data.patient}
      staff={data.staff}
      mode={mode}
    />
  );
}
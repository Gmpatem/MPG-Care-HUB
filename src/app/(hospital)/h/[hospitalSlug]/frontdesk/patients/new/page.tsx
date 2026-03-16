import { FrontdeskPatientForm } from "@/features/frontdesk/components/frontdesk-patient-form";

type PageProps = {
  params: Promise<{
    hospitalSlug: string;
  }>;
};

export default async function FrontdeskNewPatientPage({ params }: PageProps) {
  const { hospitalSlug } = await params;

  return <FrontdeskPatientForm hospitalSlug={hospitalSlug} />;
}
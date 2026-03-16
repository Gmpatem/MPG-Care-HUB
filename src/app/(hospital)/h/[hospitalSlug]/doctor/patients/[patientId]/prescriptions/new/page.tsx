import Link from "next/link";
import { getCreatePrescriptionPageData } from "@/features/pharmacy/server/get-create-prescription-page-data";
import { CreatePrescriptionForm } from "@/features/pharmacy/components/create-prescription-form";
import { Button } from "@/components/ui/button";

type Props = {
  params: Promise<{
    hospitalSlug: string;
    patientId: string;
  }>;
};

export default async function NewPrescriptionPage({ params }: Props) {
  const { hospitalSlug, patientId } = await params;
  const data = await getCreatePrescriptionPageData(hospitalSlug, patientId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">New Prescription</h1>
          <p className="text-sm text-muted-foreground">
            {data.patient.first_name} {data.patient.middle_name ?? ""} {data.patient.last_name}
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            When saved, this prescription is sent into the Pharmacy queue for dispensing.
          </p>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/doctor/patients/${patientId}`}>Back to Patient</Link>
          </Button>

          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/pharmacy`}>Pharmacy Queue</Link>
          </Button>
        </div>
      </div>

      <CreatePrescriptionForm
        hospitalSlug={hospitalSlug}
        patientId={patientId}
        staff={data.staff}
        medications={data.medications}
        encounters={data.encounters}
      />
    </div>
  );
}
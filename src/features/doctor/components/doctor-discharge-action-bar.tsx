import Link from "next/link";
import { Button } from "@/components/ui/button";
import { RequestDischargeButton } from "@/features/doctor/components/request-discharge-button";

export function DoctorDischargeActionBar({
  hospitalSlug,
  admissionId,
  dischargeRequested,
}: {
  hospitalSlug: string;
  admissionId: string;
  dischargeRequested: boolean;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <RequestDischargeButton
        hospitalSlug={hospitalSlug}
        admissionId={admissionId}
        alreadyRequested={dischargeRequested}
      />

      <Button asChild variant="outline" size="sm">
        <Link href={`/h/${hospitalSlug}/ward/discharges`}>
          Open Discharge Queue
        </Link>
      </Button>
    </div>
  );
}
import Link from "next/link";
import { getPharmacyQueueData } from "@/features/pharmacy/server/get-pharmacy-queue-data";
import { Button } from "@/components/ui/button";

type PatientLite = {
  id: string;
  patient_number: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  sex: string | null;
  phone: string | null;
} | null;

type StaffLite = {
  id: string;
  full_name: string;
} | null;

type PrescriptionQueueRow = {
  id: string;
  patient_id: string;
  encounter_id: string | null;
  prescribed_by_staff_id: string | null;
  status: string | null;
  notes: string | null;
  prescribed_at: string | null;
  patient: PatientLite;
  prescribed_by_staff: StaffLite;
  item_count: number;
  dispensed_count: number;
  partial_count: number;
};

function fullName(patient: PatientLite) {
  if (!patient) return "Unknown patient";

  return [patient.first_name, patient.middle_name, patient.last_name]
    .filter(Boolean)
    .join(" ");
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

type PageProps = {
  params: Promise<{ hospitalSlug: string }>;
};

export default async function PharmacyPage({ params }: PageProps) {
  const { hospitalSlug } = await params;
  const data = await getPharmacyQueueData(hospitalSlug);

  const prescriptions = data.prescriptions as PrescriptionQueueRow[];

  const pending = prescriptions.filter(
    (prescription) => prescription.dispensed_count < prescription.item_count
  );

  const completed = prescriptions.filter(
    (prescription) => prescription.dispensed_count === prescription.item_count
  );

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Pharmacy workspace</p>
          <h1 className="text-3xl font-semibold">Pharmacy Queue</h1>
          <p className="text-sm text-muted-foreground">
            Review prescriptions and dispense medications.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Total prescriptions</p>
          <div className="mt-2 text-2xl font-semibold">
            {prescriptions.length}
          </div>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Pending dispensing</p>
          <div className="mt-2 text-2xl font-semibold">{pending.length}</div>
        </div>

        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Completed</p>
          <div className="mt-2 text-2xl font-semibold">{completed.length}</div>
        </div>
      </div>

      <div className="rounded-xl border">
        <div className="border-b px-4 py-3">
          <h2 className="font-medium">Prescription Queue</h2>
        </div>

        {prescriptions.length === 0 ? (
          <div className="px-4 py-8 text-sm text-muted-foreground">
            No prescriptions yet.
          </div>
        ) : (
          <div className="divide-y">
            {prescriptions.map((prescription) => (
              <div
                key={prescription.id}
                className="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-start lg:justify-between"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">
                      {fullName(prescription.patient)}
                    </p>

                    <span
                      className={`rounded-full px-2 py-0.5 text-xs ${
                        prescription.dispensed_count === prescription.item_count
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {prescription.dispensed_count === prescription.item_count
                        ? "Completed"
                        : prescription.partial_count > 0
                          ? "Partially Dispensed"
                          : "Pending"}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {prescription.patient?.patient_number ?? "No patient number"}{" "}
                    · Prescribed {formatDateTime(prescription.prescribed_at)}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Doctor:{" "}
                    {prescription.prescribed_by_staff?.full_name ?? "Unknown"}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Items dispensed: {prescription.dispensed_count} /{" "}
                    {prescription.item_count}
                  </p>

                  {prescription.notes ? (
                    <p className="text-sm text-muted-foreground">
                      {prescription.notes}
                    </p>
                  ) : null}
                </div>

                <div className="flex gap-2">
                  <Button asChild>
                    <Link
                      href={`/h/${hospitalSlug}/pharmacy/prescriptions/${prescription.id}`}
                    >
                      Open Prescription
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}

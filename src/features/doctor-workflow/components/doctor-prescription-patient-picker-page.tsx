import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type PatientRow = {
  id: string;
  patient_number: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  sex: string | null;
  phone: string | null;
  created_at: string | null;
};

function fullName(patient: PatientRow) {
  return [patient.first_name, patient.middle_name, patient.last_name].filter(Boolean).join(" ");
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString();
}

export function DoctorPrescriptionPatientPickerPage({
  hospitalSlug,
  hospitalName,
  patients,
  search,
}: {
  hospitalSlug: string;
  hospitalName: string;
  patients: PatientRow[];
  search: string;
}) {
  return (
    <main className="space-y-6">
      <Card>
        <CardContent className="space-y-4 py-5">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Doctor Workflow</p>
            <h1 className="text-3xl font-bold">Write Prescription</h1>
            <p className="text-sm text-muted-foreground">
              Select a patient, open the prescription form, and send the completed prescription into the pharmacy queue for {hospitalName}.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={`/h/${hospitalSlug}/doctor`}>Back to Doctor Dashboard</Link>
            </Button>

            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/pharmacy`}>Open Pharmacy Queue</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-4 py-5">
          <form method="get" className="grid gap-3 md:grid-cols-[1fr_auto]">
            <input
              type="text"
              name="q"
              defaultValue={search}
              placeholder="Search by patient number, name, or phone"
              className="h-11 rounded-md border bg-background px-3 text-sm"
            />
            <Button type="submit">Search Patient</Button>
          </form>

          <div className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
            After the doctor creates the prescription, it is saved to the hospital prescription tables and becomes available to Pharmacy for dispensing.
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-5">
          {patients.length === 0 ? (
            <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
              No patients found for this search.
            </div>
          ) : (
            <div className="space-y-3">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex flex-col gap-4 rounded-lg border p-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="space-y-1">
                    <p className="font-medium">{fullName(patient)}</p>
                    <p className="text-sm text-muted-foreground">
                      {patient.patient_number ?? "No patient number"} · {patient.sex ?? "unknown"} · {patient.phone ?? "No phone"}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Registered: {formatDate(patient.created_at)}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline">
                      <Link href={`/h/${hospitalSlug}/doctor/patients/${patient.id}`}>
                        Open Patient
                      </Link>
                    </Button>

                    <Button asChild>
                      <Link href={`/h/${hospitalSlug}/doctor/patients/${patient.id}/prescriptions/new`}>
                        Write Prescription
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
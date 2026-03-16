import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import type { FrontdeskPatientRow } from "@/features/frontdesk/server/search-frontdesk-patients";

type HospitalLite = {
  id: string;
  name: string;
  slug: string;
};

function buildFullName(patient: FrontdeskPatientRow) {
  return [patient.first_name, patient.middle_name, patient.last_name]
    .filter(Boolean)
    .join(" ");
}

function calculateAge(dateOfBirth: string | null) {
  if (!dateOfBirth) return "—";

  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return "—";

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age -= 1;
  }

  return age >= 0 ? String(age) : "—";
}

function statusVariant(status: string | null): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "active":
      return "default";
    case "inactive":
      return "secondary";
    case "deceased":
      return "destructive";
    default:
      return "outline";
  }
}

export function FrontdeskPatientSearch({
  hospital,
  query,
  patients,
}: {
  hospital: HospitalLite;
  query: string;
  patients: FrontdeskPatientRow[];
}) {
  return (
    <main className="space-y-6">
      <Card>
        <CardContent className="space-y-4 py-5">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Front Desk</p>
            <h1 className="text-3xl font-bold">Find Patient</h1>
            <p className="text-sm text-muted-foreground">
              Search before registration to avoid duplicate patient records.
            </p>
          </div>

          <form
            action={`/h/${hospital.slug}/frontdesk/patients`}
            method="get"
            className="flex flex-col gap-3 md:flex-row"
          >
            <input
              type="text"
              name="q"
              defaultValue={query}
              placeholder="Search by patient number, phone, or name"
              className="h-11 flex-1 rounded-md border bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
            />

            <div className="flex gap-3">
              <Button type="submit">Search</Button>

              <Button asChild type="button" variant="outline">
                <Link href={`/h/${hospital.slug}/frontdesk/patients/new`}>
                  Register New Patient
                </Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle>Search Results</CardTitle>
          <CardDescription>
            {query
              ? `Showing matches for "${query}"`
              : "Showing recent patients for quick front desk access"}
          </CardDescription>
        </CardHeader>

        <CardContent className="py-5">
          {patients.length === 0 ? (
            <div className="space-y-4 rounded-lg border border-dashed p-6">
              <div>
                <h2 className="text-base font-semibold">No patient found</h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Try a different name, phone number, or patient number. If the patient is new, register them first.
                </p>
              </div>

              <Button asChild>
                <Link href={`/h/${hospital.slug}/frontdesk/patients/new`}>
                  Register New Patient
                </Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {patients.map((patient) => (
                <div
                  key={patient.id}
                  className="flex flex-col gap-4 rounded-lg border p-4 lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{buildFullName(patient)}</p>
                      <Badge variant={statusVariant(patient.status)} className="capitalize">
                        {patient.status ?? "active"}
                      </Badge>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      {patient.patient_number ?? "No patient number"} · {patient.sex ?? "unknown"} · Age {calculateAge(patient.date_of_birth)}
                    </div>

                    <div className="text-sm text-muted-foreground">
                      Phone: {patient.phone ?? "—"}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button asChild variant="outline" size="sm">
                      <Link href={`/h/${hospital.slug}/patients/${patient.id}`}>
                        View
                      </Link>
                    </Button>

                    <Button asChild size="sm">
                      <Link href={`/h/${hospital.slug}/frontdesk/visits/new?patientId=${patient.id}`}>
                        New Visit
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
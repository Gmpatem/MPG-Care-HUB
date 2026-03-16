import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type Row = {
  admission_id: string;
  hospital_id: string;
  patient_id: string;
  patient_number: string | null;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  encounter_id: string | null;
  appointment_id: string | null;
  admitting_doctor_staff_id: string | null;
  admitting_doctor_name: string | null;
  ward_id: string | null;
  ward_name: string | null;
  ward_type: string | null;
  bed_id: string | null;
  bed_number: string | null;
  admission_status: string | null;
  admitted_at: string | null;
  discharge_requested: boolean | null;
  discharge_requested_at: string | null;
  discharge_notes: string | null;
  latest_round_id: string | null;
  latest_round_datetime: string | null;
  latest_round_discharge_recommended: boolean | null;
  latest_round_assessment_notes: string | null;
  latest_round_plan_notes: string | null;
};

function fullName(row: Row) {
  return [row.first_name, row.middle_name, row.last_name].filter(Boolean).join(" ");
}

export function DoctorRoundsDashboard({
  hospitalSlug,
  rows,
}: {
  hospitalSlug: string;
  rows: Row[];
}) {
  return (
    <main className="space-y-6">
      <Card>
        <CardHeader className="border-b">
          <CardTitle>Doctor Rounds</CardTitle>
          <CardDescription>
            Follow admitted patients, write round notes, and recommend discharge when ready.
          </CardDescription>
        </CardHeader>

        <CardContent className="py-5">
          {rows.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              No admitted patients in rounds right now.
            </div>
          ) : (
            <div className="space-y-4">
              {rows.map((row) => (
                <div key={row.admission_id} className="rounded-lg border p-4">
                  <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-lg font-semibold">{fullName(row) || "Unknown patient"}</h2>
                        <Badge variant="outline">{row.ward_name ?? "No ward"}</Badge>
                        <Badge variant="outline">{row.bed_number ?? "No bed"}</Badge>
                        {row.discharge_requested ? <Badge variant="secondary">Discharge Requested</Badge> : null}
                      </div>

                      <div className="grid gap-1 text-sm text-muted-foreground">
                        <p>Patient No: {row.patient_number ?? "—"}</p>
                        <p>Admitted: {row.admitted_at ? new Date(row.admitted_at).toLocaleString() : "—"}</p>
                        <p>Doctor: {row.admitting_doctor_name ?? "Unassigned"}</p>
                        <p>Latest Round: {row.latest_round_datetime ? new Date(row.latest_round_datetime).toLocaleString() : "No rounds yet"}</p>
                        <p>Latest Assessment: {row.latest_round_assessment_notes ?? "—"}</p>
                        <p>Latest Plan: {row.latest_round_plan_notes ?? "—"}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button asChild size="sm">
                        <Link href={`/h/${hospitalSlug}/doctor/admissions/${row.admission_id}/rounds/new`}>
                          Add Round Note
                        </Link>
                      </Button>

                      {row.encounter_id ? (
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/h/${hospitalSlug}/encounters/${row.encounter_id}`}>
                            Open Encounter
                          </Link>
                        </Button>
                      ) : null}

                      <Button asChild variant="outline" size="sm">
                        <Link href={`/h/${hospitalSlug}/doctor/patients/${row.patient_id}`}>
                          View Patient
                        </Link>
                      </Button>

                      {row.discharge_requested ? (
                        <Button asChild variant="outline" size="sm">
                          <Link href={`/h/${hospitalSlug}/ward/discharges`}>
                            Ward Discharges
                          </Link>
                        </Button>
                      ) : null}
                    </div>
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
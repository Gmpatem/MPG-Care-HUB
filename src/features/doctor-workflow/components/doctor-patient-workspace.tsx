import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type HospitalLite = {
  id: string;
  name: string;
  slug: string;
};

type Patient = {
  id: string;
  hospital_id: string;
  patient_number: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  sex: string | null;
  date_of_birth: string | null;
  phone: string | null;
  email: string | null;
  address_text: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  status: string | null;
};

type LatestVitals = {
  recorded_at: string;
  source_type: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  temperature_c: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  pulse_bpm: number | null;
  respiratory_rate: number | null;
  spo2: number | null;
  pain_score: number | null;
  notes: string | null;
} | null;

type VitalsTimelineRow = {
  id: string;
  source_type: string | null;
  recorded_at: string;
  height_cm: number | null;
  weight_kg: number | null;
  temperature_c: number | null;
  blood_pressure_systolic: number | null;
  blood_pressure_diastolic: number | null;
  pulse_bpm: number | null;
  respiratory_rate: number | null;
  spo2: number | null;
  pain_score: number | null;
  notes: string | null;
};

type EncounterRow = {
  id: string;
  encounter_datetime: string | null;
  status: string | null;
  chief_complaint: string | null;
  diagnosis_text: string | null;
  admission_requested: boolean | null;
};

function fullName(patient: Patient) {
  return [patient.first_name, patient.middle_name, patient.last_name].filter(Boolean).join(" ");
}

function ageFromDob(dateOfBirth: string | null) {
  if (!dateOfBirth) return "—";
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return "—";
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age >= 0 ? String(age) : "—";
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function EncounterBadge({ status }: { status: string | null }) {
  const variant =
    status === "finalized"
      ? "secondary"
      : status === "cancelled"
      ? "destructive"
      : "outline";

  return (
    <Badge variant={variant} className="capitalize">
      {status ?? "draft"}
    </Badge>
  );
}

function LatestVitalsCard({ latestVitals }: { latestVitals: LatestVitals }) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Latest Vitals</CardTitle>
        <CardDescription>
          Quick clinical snapshot before consultation or rounds.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 py-5">
        {!latestVitals ? (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            No vitals recorded yet.
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="capitalize">
                {latestVitals.source_type ?? "other"}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Recorded {formatDateTime(latestVitals.recorded_at)}
              </span>
            </div>

            <div className="grid gap-3 text-sm md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg bg-muted p-3">Temp: {latestVitals.temperature_c ?? "—"} °C</div>
              <div className="rounded-lg bg-muted p-3">
                BP: {latestVitals.blood_pressure_systolic ?? "—"} / {latestVitals.blood_pressure_diastolic ?? "—"}
              </div>
              <div className="rounded-lg bg-muted p-3">Pulse: {latestVitals.pulse_bpm ?? "—"} bpm</div>
              <div className="rounded-lg bg-muted p-3">Resp: {latestVitals.respiratory_rate ?? "—"} / min</div>
              <div className="rounded-lg bg-muted p-3">SpO2: {latestVitals.spo2 ?? "—"} %</div>
              <div className="rounded-lg bg-muted p-3">Weight: {latestVitals.weight_kg ?? "—"} kg</div>
              <div className="rounded-lg bg-muted p-3">Height: {latestVitals.height_cm ?? "—"} cm</div>
              <div className="rounded-lg bg-muted p-3">Pain: {latestVitals.pain_score ?? "—"} / 10</div>
            </div>

            {latestVitals.notes ? (
              <div className="rounded-lg border p-3 text-sm text-muted-foreground">
                {latestVitals.notes}
              </div>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function VitalsTimeline({ rows }: { rows: VitalsTimelineRow[] }) {
  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Vitals Timeline</CardTitle>
        <CardDescription>
          Recent vitals recorded during triage, doctor review, and nursing rounds.
        </CardDescription>
      </CardHeader>

      <CardContent className="py-5">
        {rows.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            No vitals timeline available yet.
          </div>
        ) : (
          <div className="space-y-3">
            {rows.map((row) => (
              <div key={row.id} className="rounded-lg border p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {row.source_type ?? "other"}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {formatDateTime(row.recorded_at)}
                  </span>
                </div>

                <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
                  <p>Temp: {row.temperature_c ?? "—"} °C</p>
                  <p>
                    BP: {row.blood_pressure_systolic ?? "—"} / {row.blood_pressure_diastolic ?? "—"}
                  </p>
                  <p>Pulse: {row.pulse_bpm ?? "—"} bpm</p>
                  <p>Resp: {row.respiratory_rate ?? "—"} / min</p>
                  <p>SpO2: {row.spo2 ?? "—"} %</p>
                  <p>Weight: {row.weight_kg ?? "—"} kg</p>
                  <p>Height: {row.height_cm ?? "—"} cm</p>
                  <p>Pain: {row.pain_score ?? "—"} / 10</p>
                </div>

                {row.notes ? (
                  <div className="mt-3 rounded-md bg-muted p-3 text-sm text-muted-foreground">
                    {row.notes}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RecentEncounters({ hospitalSlug, patientId, encounters }: { hospitalSlug: string; patientId: string; encounters: EncounterRow[] }) {
  const latestEncounter = encounters[0] ?? null;

  return (
    <Card>
      <CardHeader className="border-b">
        <CardTitle>Recent Encounters</CardTitle>
        <CardDescription>
          Fast clinical history and direct workflow links.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-5 py-5">
        <div className="flex flex-wrap gap-2">
          {latestEncounter ? (
            <Button asChild size="sm">
              <Link href={`/h/${hospitalSlug}/encounters/${latestEncounter.id}`}>
                Open Latest Encounter
              </Link>
            </Button>
          ) : (
            <Button asChild size="sm">
              <Link href={`/h/${hospitalSlug}/encounters`}>
                Open Encounters
              </Link>
            </Button>
          )}

          <Button asChild variant="outline" size="sm">
            <Link href={`/h/${hospitalSlug}/doctor/patients/${patientId}/labs/new`}>
              Order Lab
            </Link>
          </Button>

          <Button asChild variant="outline" size="sm">
            <Link href={`/h/${hospitalSlug}/doctor/patients/${patientId}/prescriptions/new`}>
              Write Prescription
            </Link>
          </Button>

          <Button asChild variant="outline" size="sm">
            <Link href={`/h/${hospitalSlug}/pharmacy`}>
              Pharmacy Queue
            </Link>
          </Button>

          <Button asChild variant="outline" size="sm">
            <Link href={`/h/${hospitalSlug}/doctor/rounds`}>
              Doctor Rounds
            </Link>
          </Button>

          <Button asChild variant="outline" size="sm">
            <Link href={`/h/${hospitalSlug}/ward/discharges`}>
              Ward Discharges
            </Link>
          </Button>
        </div>

        {encounters.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-sm text-muted-foreground">
            No encounters recorded yet.
          </div>
        ) : (
          <div className="space-y-3">
            {encounters.map((encounter) => (
              <div key={encounter.id} className="rounded-lg border p-4">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <EncounterBadge status={encounter.status} />
                  <span className="text-sm text-muted-foreground">
                    {formatDateTime(encounter.encounter_datetime)}
                  </span>
                  {encounter.admission_requested ? (
                    <Badge variant="outline">Admission Requested</Badge>
                  ) : null}
                </div>

                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Chief Complaint: {encounter.chief_complaint ?? "—"}</p>
                  <p>Diagnosis: {encounter.diagnosis_text ?? "—"}</p>
                </div>

                <div className="mt-3">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/h/${hospitalSlug}/encounters/${encounter.id}`}>
                      Open Encounter
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export function DoctorPatientWorkspace({
  hospital,
  patient,
  latestVitals,
  vitalsTimeline,
  recentEncounters,
}: {
  hospital: HospitalLite;
  patient: Patient;
  latestVitals: LatestVitals;
  vitalsTimeline: VitalsTimelineRow[];
  recentEncounters: EncounterRow[];
}) {
  return (
    <main className="space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-4 py-5">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Doctor Workspace</p>
            <h1 className="text-3xl font-bold">{fullName(patient)}</h1>
            <p className="text-sm text-muted-foreground">
              {patient.patient_number ?? "No patient number"} · {patient.sex ?? "unknown"} · Age {ageFromDob(patient.date_of_birth)}
            </p>
          </div>

          <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2">
            <p>Phone: {patient.phone ?? "—"}</p>
            <p>Email: {patient.email ?? "—"}</p>
            <p>Emergency Contact: {patient.emergency_contact_name ?? "—"}</p>
            <p>Emergency Phone: {patient.emergency_contact_phone ?? "—"}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={`/h/${hospital.slug}/encounters`}>Open Encounters</Link>
            </Button>

            <Button asChild variant="outline">
              <Link href={`/h/${hospital.slug}/doctor/patients/${patient.id}/labs/new`}>Order Lab</Link>
            </Button>

            <Button asChild variant="outline">
              <Link href={`/h/${hospital.slug}/doctor/patients/${patient.id}/prescriptions/new`}>Write Prescription</Link>
            </Button>

            <Button asChild variant="outline">
              <Link href={`/h/${hospital.slug}/pharmacy`}>Pharmacy Queue</Link>
            </Button>

            <Button asChild variant="outline">
              <Link href={`/h/${hospital.slug}/doctor/rounds`}>Rounds</Link>
            </Button>

            <Button asChild variant="outline">
              <Link href={`/h/${hospital.slug}/patients/${patient.id}`}>Patient Profile</Link>
            </Button>

            <Button asChild variant="outline">
              <Link href={`/h/${hospital.slug}/doctor`}>Back to Doctor Queue</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_.9fr]">
        <LatestVitalsCard latestVitals={latestVitals} />
        <Card>
          <CardHeader className="border-b">
            <CardTitle>Current Clinical Stage</CardTitle>
            <CardDescription>
              Quick workflow summary for this patient&apos;s active case.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 py-5 text-sm text-muted-foreground">
            <div className="rounded-lg bg-muted p-3">
              Use latest vitals and timeline to confirm whether this is an initial review, a results review, or a final treatment decision.
            </div>
            <div className="rounded-lg bg-muted p-3">
              If labs are needed, keep the same encounter active and move the case to awaiting results.
            </div>
            <div className="rounded-lg bg-muted p-3">
              Final decisions should end in prescription, admission, referral, follow-up, or observation.
            </div>
            <div className="rounded-lg bg-muted p-3">
              Prescriptions written here are received by Pharmacy through the pharmacy queue for dispensing.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_.8fr]">
        <VitalsTimeline rows={vitalsTimeline} />
        <RecentEncounters
          hospitalSlug={hospital.slug}
          patientId={patient.id}
          encounters={recentEncounters}
        />
      </div>
    </main>
  );
}
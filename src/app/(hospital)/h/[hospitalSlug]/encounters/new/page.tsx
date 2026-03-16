import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createEncounter } from "@/features/encounters/actions/create-encounter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type PageProps = {
  params: Promise<{
    hospitalSlug: string;
  }>;
};

export default async function NewEncounterPage({ params }: PageProps) {
  const { hospitalSlug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: hospital } = await supabase
    .from("hospitals")
    .select("id, name, slug")
    .eq("slug", hospitalSlug)
    .maybeSingle();

  if (!hospital) notFound();

  const { data: patients, error: patientsError } = await supabase
    .from("patients")
    .select("id, patient_number, first_name, last_name")
    .eq("hospital_id", hospital.id)
    .order("last_name", { ascending: true });

  if (patientsError) {
    throw new Error(patientsError.message);
  }

  const { data: appointments, error: appointmentsError } = await supabase
    .from("appointments")
    .select(`
      id,
      scheduled_at,
      patients (
        id,
        patient_number,
        first_name,
        last_name
      )
    `)
    .eq("hospital_id", hospital.id)
    .order("scheduled_at", { ascending: false });

  if (appointmentsError) {
    throw new Error(appointmentsError.message);
  }

  return (
    <main className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Encounters</p>
        <h1 className="text-3xl font-bold">New Encounter</h1>
        <p className="text-muted-foreground">{hospital.name}</p>
      </div>

      <form action={createEncounter} className="max-w-5xl space-y-6 rounded-xl border p-6">
        <input type="hidden" name="hospital_id" value={hospital.id} />

        <div className="rounded-lg border bg-muted/30 p-4">
          <h2 className="text-lg font-semibold">Initial Clinical Review</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Start the encounter, record the first doctor assessment, and decide whether labs may be needed.
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Patient</label>
            <select
              name="patient_id"
              required
              defaultValue=""
              className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="" disabled>
                Select patient
              </option>
              {patients?.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.patient_number} - {patient.last_name}, {patient.first_name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Linked Appointment (optional)</label>
            <select
              name="appointment_id"
              defaultValue=""
              className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">No linked appointment</option>
              {appointments?.map((appointment) => {
                const patient = Array.isArray(appointment.patients)
                  ? appointment.patients[0]
                  : appointment.patients;

                return (
                  <option key={appointment.id} value={appointment.id}>
                    {new Date(appointment.scheduled_at).toLocaleString()} -{" "}
                    {patient
                      ? `${patient.last_name}, ${patient.first_name}`
                      : "Unknown patient"}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Chief Complaint</label>
          <Input name="chief_complaint" placeholder="Headache, fever, chest pain, routine follow-up..." />
        </div>

        <div className="rounded-lg border p-4">
          <div className="mb-4">
            <h2 className="text-base font-semibold">Initial Vitals Snapshot</h2>
            <p className="text-sm text-muted-foreground">
              Enter quick bedside values if needed. Use this as the initial clinical snapshot.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            <div className="space-y-2">
              <label className="text-sm font-medium">Temperature</label>
              <Input name="temperature" placeholder="37.0 C" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Blood Pressure</label>
              <Input name="blood_pressure" placeholder="120/80" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Pulse Rate</label>
              <Input name="pulse_rate" placeholder="72 bpm" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Respiratory Rate</label>
              <Input name="respiratory_rate" placeholder="18/min" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Oxygen Saturation</label>
              <Input name="oxygen_saturation" placeholder="98%" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Weight (kg)</label>
              <Input name="weight_kg" placeholder="70" />
            </div>
          </div>
        </div>

        <div className="grid gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">History Notes</label>
            <Textarea name="history_notes" placeholder="Patient history..." />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Assessment Notes</label>
            <Textarea name="assessment_notes" placeholder="Initial clinical findings..." />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Working Diagnosis</label>
            <Input name="diagnosis_text" placeholder="Working diagnosis" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Plan Notes</label>
            <Textarea name="plan_notes" placeholder="Immediate plan, requested investigations, bedside plan..." />
          </div>

          <div className="rounded-lg border p-4">
            <label className="flex items-center gap-3 text-sm">
              <input type="checkbox" name="requires_lab" />
              <span className="font-medium">Laboratory investigation likely needed for this case</span>
            </label>
            <p className="mt-2 text-sm text-muted-foreground">
              If checked, the encounter starts in <span className="font-medium">awaiting results</span>. Otherwise it starts in <span className="font-medium">initial review</span>.
            </p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Final Clinical Notes (optional)</label>
            <Textarea name="final_notes" placeholder="Use later if you already have a final clinical verdict..." />
          </div>
        </div>

        <div className="flex gap-3">
          <Button type="submit">Save Initial Encounter</Button>
          <Button asChild variant="outline">
            <Link href={`/h/${hospital.slug}/encounters`}>Cancel</Link>
          </Button>
        </div>
      </form>
    </main>
  );
}
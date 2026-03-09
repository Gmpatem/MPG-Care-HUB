import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

type PageProps = {
  params: Promise<{
    hospitalSlug: string;
    encounterId: string;
  }>;
};

export default async function EncounterDetailPage({ params }: PageProps) {
  const { hospitalSlug, encounterId } = await params;
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

  const { data: encounter, error } = await supabase
    .from("encounters")
    .select(`
      id,
      encounter_datetime,
      status,
      chief_complaint,
      history_notes,
      assessment_notes,
      plan_notes,
      diagnosis_text,
      vitals_json,
      appointment_id,
      created_at,
      patients (
        id,
        patient_number,
        first_name,
        last_name
      )
    `)
    .eq("id", encounterId)
    .eq("hospital_id", hospital.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!encounter) notFound();

  const patient = Array.isArray(encounter.patients)
    ? encounter.patients[0]
    : encounter.patients;

  const vitals = (encounter.vitals_json ?? {}) as Record<string, string | null>;

  return (
    <main className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Encounter Detail</p>
          <h1 className="text-3xl font-bold">
            {patient
              ? `${patient.last_name}, ${patient.first_name}`
              : "Unknown patient"}
          </h1>
          <p className="text-muted-foreground">
            Encounter Date: {new Date(encounter.encounter_datetime).toLocaleString()}
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href={`/h/${hospital.slug}/encounters`}>Back to Encounters</Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border p-6">
          <h2 className="text-xl font-semibold">Encounter Summary</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Patient:</span> {patient ? `${patient.patient_number} - ${patient.last_name}, ${patient.first_name}` : "-"}</p>
            <p><span className="font-medium">Status:</span> {encounter.status}</p>
            <p><span className="font-medium">Chief Complaint:</span> {encounter.chief_complaint ?? "-"}</p>
            <p><span className="font-medium">Diagnosis:</span> {encounter.diagnosis_text ?? "-"}</p>
            <p><span className="font-medium">Linked Appointment:</span> {encounter.appointment_id ?? "-"}</p>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border p-6">
          <h2 className="text-xl font-semibold">Vitals</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Temperature:</span> {vitals.temperature ?? "-"}</p>
            <p><span className="font-medium">Blood Pressure:</span> {vitals.blood_pressure ?? "-"}</p>
            <p><span className="font-medium">Pulse Rate:</span> {vitals.pulse_rate ?? "-"}</p>
            <p><span className="font-medium">Respiratory Rate:</span> {vitals.respiratory_rate ?? "-"}</p>
            <p><span className="font-medium">Oxygen Saturation:</span> {vitals.oxygen_saturation ?? "-"}</p>
            <p><span className="font-medium">Weight:</span> {vitals.weight_kg ?? "-"}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6">
        <div className="rounded-xl border p-6">
          <h2 className="text-xl font-semibold">History Notes</h2>
          <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">
            {encounter.history_notes ?? "No history notes."}
          </p>
        </div>

        <div className="rounded-xl border p-6">
          <h2 className="text-xl font-semibold">Assessment Notes</h2>
          <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">
            {encounter.assessment_notes ?? "No assessment notes."}
          </p>
        </div>

        <div className="rounded-xl border p-6">
          <h2 className="text-xl font-semibold">Plan Notes</h2>
          <p className="mt-3 text-sm text-muted-foreground whitespace-pre-wrap">
            {encounter.plan_notes ?? "No plan notes."}
          </p>
        </div>
      </div>

      <div className="rounded-xl border p-6">
        <p className="text-sm text-muted-foreground">MVP next links</p>
        <div className="mt-3 flex gap-3">
          <Button asChild>
            <Link href={`/h/${hospital.slug}/billing/invoices/new`}>Create Invoice</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/h/${hospital.slug}/appointments`}>View Appointments</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

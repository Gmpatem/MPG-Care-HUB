import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

type PageProps = {
  params: Promise<{
    hospitalSlug: string;
    appointmentId: string;
  }>;
};

export default async function AppointmentDetailPage({ params }: PageProps) {
  const { hospitalSlug, appointmentId } = await params;
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

  const { data: appointment, error } = await supabase
    .from("appointments")
    .select(`
      id,
      appointment_type,
      scheduled_at,
      duration_minutes,
      status,
      reason,
      notes,
      created_at,
      patients (
        id,
        patient_number,
        first_name,
        last_name
      )
    `)
    .eq("id", appointmentId)
    .eq("hospital_id", hospital.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!appointment) notFound();

  const patient = Array.isArray(appointment.patients)
    ? appointment.patients[0]
    : appointment.patients;

  return (
    <main className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Appointment Detail</p>
          <h1 className="text-3xl font-bold">
            {patient
              ? `${patient.last_name}, ${patient.first_name}`
              : "Unknown patient"}
          </h1>
          <p className="text-muted-foreground">
            Scheduled: {new Date(appointment.scheduled_at).toLocaleString()}
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href={`/h/${hospital.slug}/appointments`}>Back to Appointments</Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border p-6">
          <h2 className="text-xl font-semibold">Appointment Info</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Patient:</span> {patient ? `${patient.patient_number} - ${patient.last_name}, ${patient.first_name}` : "-"}</p>
            <p><span className="font-medium">Type:</span> {appointment.appointment_type ?? "-"}</p>
            <p><span className="font-medium">Status:</span> {appointment.status}</p>
            <p><span className="font-medium">Scheduled At:</span> {new Date(appointment.scheduled_at).toLocaleString()}</p>
            <p><span className="font-medium">Duration:</span> {appointment.duration_minutes} minutes</p>
            <p><span className="font-medium">Reason:</span> {appointment.reason ?? "-"}</p>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border p-6">
          <h2 className="text-xl font-semibold">Notes</h2>
          <div className="text-sm text-muted-foreground">
            {appointment.notes ?? "No notes added."}
          </div>
        </div>
      </div>

      <div className="rounded-xl border p-6">
        <p className="text-sm text-muted-foreground">MVP next links</p>
        <div className="mt-3 flex gap-3">
          <Button asChild>
            <Link href={`/h/${hospital.slug}/encounters/new`}>Create Encounter</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/h/${hospital.slug}/billing/invoices/new`}>Create Invoice</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

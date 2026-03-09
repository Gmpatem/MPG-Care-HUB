import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

type PageProps = {
  params: Promise<{
    hospitalSlug: string;
  }>;
};

export default async function AppointmentsPage({ params }: PageProps) {
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

  const { data: appointments, error } = await supabase
    .from("appointments")
    .select(`
      id,
      appointment_type,
      scheduled_at,
      duration_minutes,
      status,
      reason,
      created_at,
      patients (
        id,
        patient_number,
        first_name,
        last_name
      )
    `)
    .eq("hospital_id", hospital.id)
    .order("scheduled_at", { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Appointments</p>
          <h1 className="text-3xl font-bold">Appointment Schedule</h1>
          <p className="text-muted-foreground">{hospital.name}</p>
        </div>

        <Button asChild>
          <Link href={`/h/${hospital.slug}/appointments/new`}>New Appointment</Link>
        </Button>
      </div>

      <div className="rounded-xl border">
        <div className="grid grid-cols-6 gap-4 border-b px-4 py-3 text-sm font-medium text-muted-foreground">
          <div>Patient</div>
          <div>Type</div>
          <div>Scheduled</div>
          <div>Duration</div>
          <div>Status</div>
          <div>Open</div>
        </div>

        {appointments && appointments.length > 0 ? (
          appointments.map((appointment) => {
            const patient = Array.isArray(appointment.patients)
              ? appointment.patients[0]
              : appointment.patients;

            return (
              <div
                key={appointment.id}
                className="grid grid-cols-6 gap-4 border-b px-4 py-3 text-sm last:border-b-0"
              >
                <div className="font-medium">
                  {patient
                    ? `${patient.last_name}, ${patient.first_name}`
                    : "Unknown patient"}
                </div>
                <div>{appointment.appointment_type ?? "-"}</div>
                <div>{new Date(appointment.scheduled_at).toLocaleString()}</div>
                <div>{appointment.duration_minutes} min</div>
                <div className="capitalize">{appointment.status}</div>
                <div>
                  <Link
                    href={`/h/${hospital.slug}/appointments/${appointment.id}`}
                    className="text-primary underline underline-offset-4"
                  >
                    View
                  </Link>
                </div>
              </div>
            );
          })
        ) : (
          <div className="px-4 py-10 text-sm text-muted-foreground">
            No appointments yet. Create your first appointment.
          </div>
        )}
      </div>
    </main>
  );
}

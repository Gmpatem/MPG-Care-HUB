import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAppointment } from "@/features/appointments/actions/create-appointment";
import { SubmitButton } from "@/components/forms/submit-button";
import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type PageProps = {
  params: Promise<{
    hospitalSlug: string;
  }>;
  searchParams: Promise<{
    success?: string;
  }>;
};

export default async function NewAppointmentPage({ params, searchParams }: PageProps) {
  const { hospitalSlug } = await params;
  const { success } = await searchParams;
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

  return (
    <main className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Appointments</p>
        <h1 className="text-3xl font-bold">New Appointment</h1>
        <p className="text-muted-foreground">{hospital.name}</p>
      </div>

      {success === "1" ? (
        <FormMessage type="success" message="Appointment saved successfully." />
      ) : null}

      <form action={createAppointment} className="max-w-3xl space-y-6 rounded-xl border p-6">
        <input type="hidden" name="hospital_id" value={hospital.id} />

        <FormMessage
          type="info"
          message="Choose the patient, set the schedule, and optionally add type and notes."
        />

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

        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Appointment Type</label>
            <Input name="appointment_type" placeholder="Consultation" />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Scheduled At</label>
            <Input name="scheduled_at" type="datetime-local" required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Duration (minutes)</label>
            <Input name="duration_minutes" type="number" min="1" defaultValue="30" required />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Reason</label>
          <Input name="reason" placeholder="General consultation" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Notes</label>
          <Textarea name="notes" placeholder="Additional appointment notes" />
        </div>

        <div className="flex gap-3">
          <SubmitButton pendingText="Saving appointment...">
            Save Appointment
          </SubmitButton>
          <Button asChild variant="outline">
            <Link href={`/h/${hospital.slug}/appointments`}>Cancel</Link>
          </Button>
        </div>
      </form>
    </main>
  );
}

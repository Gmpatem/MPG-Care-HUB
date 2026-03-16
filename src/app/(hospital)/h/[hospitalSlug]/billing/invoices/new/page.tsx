import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createInvoice } from "@/features/billing/actions/create-invoice";
import { CreateInvoiceForm } from "@/features/billing/components/create-invoice-form";
import { SubmitButton } from "@/components/forms/submit-button";
import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

type PageProps = {
  params: Promise<{
    hospitalSlug: string;
  }>;
};

export default async function NewInvoicePage({ params }: PageProps) {
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
      patient_id,
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

  const { data: encounters, error: encountersError } = await supabase
    .from("encounters")
    .select(`
      id,
      encounter_datetime,
      patient_id,
      patients (
        id,
        patient_number,
        first_name,
        last_name
      )
    `)
    .eq("hospital_id", hospital.id)
    .order("encounter_datetime", { ascending: false });

  if (encountersError) {
    throw new Error(encountersError.message);
  }

  return (
    <main className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Billing</p>
        <h1 className="text-3xl font-bold">New Invoice</h1>
        <p className="text-muted-foreground">{hospital.name}</p>
      </div>

      <CreateInvoiceForm action={createInvoice}>
        <input type="hidden" name="hospital_id" value={hospital.id} />

        <FormMessage
          type="info"
          message="Create an invoice for one patient. You can optionally link an appointment or encounter."
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Linked Encounter (optional)</label>
            <select
              name="encounter_id"
              defaultValue=""
              className="flex h-10 w-full rounded-md border bg-background px-3 py-2 text-sm"
            >
              <option value="">No linked encounter</option>
              {encounters?.map((encounter) => {
                const patient = Array.isArray(encounter.patients)
                  ? encounter.patients[0]
                  : encounter.patients;

                return (
                  <option key={encounter.id} value={encounter.id}>
                    {new Date(encounter.encounter_datetime).toLocaleString()} -{" "}
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
          <label className="text-sm font-medium">Notes</label>
          <Textarea name="notes" placeholder="Optional invoice notes" />
        </div>

        <div className="flex gap-3">
          <SubmitButton pendingText="Creating invoice...">
            Create Invoice
          </SubmitButton>
          <Button asChild variant="outline">
            <Link href={`/h/${hospital.slug}/billing/invoices`}>Cancel</Link>
          </Button>
        </div>
      </CreateInvoiceForm>
    </main>
  );
}




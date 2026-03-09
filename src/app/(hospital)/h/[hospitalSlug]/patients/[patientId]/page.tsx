import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

type PageProps = {
  params: Promise<{
    hospitalSlug: string;
    patientId: string;
  }>;
};

export default async function PatientDetailPage({ params }: PageProps) {
  const { hospitalSlug, patientId } = await params;
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

  const { data: patient, error } = await supabase
    .from("patients")
    .select(`
      id,
      patient_number,
      first_name,
      last_name,
      middle_name,
      sex,
      date_of_birth,
      phone,
      email,
      address_text,
      emergency_contact_name,
      emergency_contact_phone,
      status,
      created_at
    `)
    .eq("id", patientId)
    .eq("hospital_id", hospital.id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!patient) notFound();

  return (
    <main className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">Patient Profile</p>
          <h1 className="text-3xl font-bold">
            {patient.last_name}, {patient.first_name}
          </h1>
          <p className="text-muted-foreground">
            Patient No: {patient.patient_number}
          </p>
        </div>

        <Button asChild variant="outline">
          <Link href={`/h/${hospital.slug}/patients`}>Back to Patients</Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4 rounded-xl border p-6">
          <h2 className="text-xl font-semibold">Demographics</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">First Name:</span> {patient.first_name}</p>
            <p><span className="font-medium">Last Name:</span> {patient.last_name}</p>
            <p><span className="font-medium">Middle Name:</span> {patient.middle_name ?? "-"}</p>
            <p><span className="font-medium">Sex:</span> {patient.sex}</p>
            <p><span className="font-medium">Date of Birth:</span> {patient.date_of_birth ?? "-"}</p>
            <p><span className="font-medium">Status:</span> {patient.status}</p>
          </div>
        </div>

        <div className="space-y-4 rounded-xl border p-6">
          <h2 className="text-xl font-semibold">Contact Details</h2>
          <div className="space-y-2 text-sm">
            <p><span className="font-medium">Phone:</span> {patient.phone ?? "-"}</p>
            <p><span className="font-medium">Email:</span> {patient.email ?? "-"}</p>
            <p><span className="font-medium">Address:</span> {patient.address_text ?? "-"}</p>
            <p><span className="font-medium">Emergency Contact:</span> {patient.emergency_contact_name ?? "-"}</p>
            <p><span className="font-medium">Emergency Contact Phone:</span> {patient.emergency_contact_phone ?? "-"}</p>
          </div>
        </div>
      </div>

      <div className="rounded-xl border p-6">
        <p className="text-sm text-muted-foreground">MVP next links</p>
        <div className="mt-3 flex gap-3">
          <Button asChild>
            <Link href={`/h/${hospital.slug}/appointments/new`}>Book Appointment</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/h/${hospital.slug}/encounters/new`}>New Encounter</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/h/${hospital.slug}/billing/invoices/new`}>Create Invoice</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

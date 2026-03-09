import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

type PageProps = {
  params: Promise<{
    hospitalSlug: string;
  }>;
};

export default async function HospitalDashboardPage({ params }: PageProps) {
  const { hospitalSlug } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: hospital, error: hospitalError } = await supabase
    .from("hospitals")
    .select("id, name, slug, type, status")
    .eq("slug", hospitalSlug)
    .maybeSingle();

  if (hospitalError) {
    throw new Error(hospitalError.message);
  }

  if (!hospital) {
    notFound();
  }

  const { data: membership } = await supabase
    .from("hospital_users")
    .select("id, role, status")
    .eq("hospital_id", hospital.id)
    .eq("user_id", user.id)
    .maybeSingle();

  const { count: patientCount } = await supabase
    .from("patients")
    .select("*", { count: "exact", head: true })
    .eq("hospital_id", hospital.id);

  const nowIso = new Date().toISOString();

  const { count: upcomingAppointmentCount } = await supabase
    .from("appointments")
    .select("*", { count: "exact", head: true })
    .eq("hospital_id", hospital.id)
    .gte("scheduled_at", nowIso);

  const { count: encounterCount } = await supabase
    .from("encounters")
    .select("*", { count: "exact", head: true })
    .eq("hospital_id", hospital.id);

  const { count: unpaidInvoiceCount } = await supabase
    .from("invoices")
    .select("*", { count: "exact", head: true })
    .eq("hospital_id", hospital.id)
    .in("status", ["issued", "partially_paid"]);

  const { data: payments } = await supabase
    .from("payments")
    .select("amount")
    .eq("hospital_id", hospital.id);

  const totalCollected = (payments ?? []).reduce(
    (sum, row) => sum + Number(row.amount ?? 0),
    0
  );

  const { data: recentAppointments } = await supabase
    .from("appointments")
    .select(`
      id,
      scheduled_at,
      status,
      appointment_type,
      patients (
        id,
        patient_number,
        first_name,
        last_name
      )
    `)
    .eq("hospital_id", hospital.id)
    .order("scheduled_at", { ascending: true })
    .limit(5);

  const { data: recentInvoices } = await supabase
    .from("invoices")
    .select(`
      id,
      invoice_number,
      status,
      balance_due,
      patients (
        id,
        patient_number,
        first_name,
        last_name
      )
    `)
    .eq("hospital_id", hospital.id)
    .order("created_at", { ascending: false })
    .limit(5);

  return (
    <main className="space-y-6">
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">Hospital Workspace</p>
        <h1 className="text-3xl font-bold">{hospital.name}</h1>
        <p className="text-muted-foreground">
          Type: {hospital.type} · Status: {hospital.status}
        </p>
        <p className="text-muted-foreground">
          Your role: {membership?.role ?? "platform_owner"}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-xl border p-6">
          <p className="text-sm text-muted-foreground">Patients</p>
          <h2 className="mt-2 text-3xl font-bold">{patientCount ?? 0}</h2>
        </div>

        <div className="rounded-xl border p-6">
          <p className="text-sm text-muted-foreground">Upcoming Appointments</p>
          <h2 className="mt-2 text-3xl font-bold">{upcomingAppointmentCount ?? 0}</h2>
        </div>

        <div className="rounded-xl border p-6">
          <p className="text-sm text-muted-foreground">Encounters</p>
          <h2 className="mt-2 text-3xl font-bold">{encounterCount ?? 0}</h2>
        </div>

        <div className="rounded-xl border p-6">
          <p className="text-sm text-muted-foreground">Unpaid Invoices</p>
          <h2 className="mt-2 text-3xl font-bold">{unpaidInvoiceCount ?? 0}</h2>
        </div>

        <div className="rounded-xl border p-6">
          <p className="text-sm text-muted-foreground">Payments Collected</p>
          <h2 className="mt-2 text-3xl font-bold">{totalCollected.toFixed(2)}</h2>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Upcoming Appointments</h2>
            <Button asChild variant="outline" size="sm">
              <Link href={`/h/${hospital.slug}/appointments`}>View All</Link>
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {recentAppointments && recentAppointments.length > 0 ? (
              recentAppointments.map((appointment) => {
                const patient = Array.isArray(appointment.patients)
                  ? appointment.patients[0]
                  : appointment.patients;

                return (
                  <div key={appointment.id} className="rounded-lg border p-3 text-sm">
                    <p className="font-medium">
                      {patient
                        ? `${patient.last_name}, ${patient.first_name}`
                        : "Unknown patient"}
                    </p>
                    <p className="text-muted-foreground">
                      {new Date(appointment.scheduled_at).toLocaleString()}
                    </p>
                    <p className="text-muted-foreground">
                      {appointment.appointment_type ?? "General"} · {appointment.status}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">
                No upcoming appointments.
              </p>
            )}
          </div>
        </div>

        <div className="rounded-xl border p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Recent Invoices</h2>
            <Button asChild variant="outline" size="sm">
              <Link href={`/h/${hospital.slug}/billing/invoices`}>View All</Link>
            </Button>
          </div>

          <div className="mt-4 space-y-3">
            {recentInvoices && recentInvoices.length > 0 ? (
              recentInvoices.map((invoice) => {
                const patient = Array.isArray(invoice.patients)
                  ? invoice.patients[0]
                  : invoice.patients;

                return (
                  <div key={invoice.id} className="rounded-lg border p-3 text-sm">
                    <p className="font-medium">{invoice.invoice_number}</p>
                    <p className="text-muted-foreground">
                      {patient
                        ? `${patient.last_name}, ${patient.first_name}`
                        : "Unknown patient"}
                    </p>
                    <p className="text-muted-foreground">
                      {invoice.status} · Balance {Number(invoice.balance_due).toFixed(2)}
                    </p>
                  </div>
                );
              })
            ) : (
              <p className="text-sm text-muted-foreground">
                No invoices yet.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Recent Activity</p>
            <h2 className="mt-1 text-xl font-semibold">Operational trail</h2>
          </div>

          <Button asChild variant="outline">
            <Link href={`/h/${hospital.slug}/activity`}>Open Activity Feed</Link>
          </Button>
        </div>

        <p className="mt-3 text-sm text-muted-foreground">
          Use the activity feed to review recent actions across patients, appointments,
          encounters, billing, and staff events.
        </p>
      </div>
    </main>
  );
}

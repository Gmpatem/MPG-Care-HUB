import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

type PageProps = {
  params: Promise<{
    hospitalSlug: string;
  }>;
};

export default async function PatientsPage({ params }: PageProps) {
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

  const { data: patients, error } = await supabase
    .from("patients")
    .select("id, patient_number, first_name, last_name, sex, phone, created_at")
    .eq("hospital_id", hospital.id)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Patients</p>
          <h1 className="text-3xl font-bold">Patient Registry</h1>
          <p className="text-muted-foreground">{hospital.name}</p>
        </div>

        <Button asChild>
          <Link href={`/h/${hospital.slug}/patients/new`}>Register Patient</Link>
        </Button>
      </div>

      <div className="rounded-xl border">
        <div className="grid grid-cols-6 gap-4 border-b px-4 py-3 text-sm font-medium text-muted-foreground">
          <div>Patient No.</div>
          <div>Name</div>
          <div>Sex</div>
          <div>Phone</div>
          <div>Created</div>
          <div>Open</div>
        </div>

        {patients && patients.length > 0 ? (
          patients.map((patient) => (
            <div
              key={patient.id}
              className="grid grid-cols-6 gap-4 border-b px-4 py-3 text-sm last:border-b-0"
            >
              <div>{patient.patient_number}</div>
              <div className="font-medium">
                {patient.last_name}, {patient.first_name}
              </div>
              <div className="capitalize">{patient.sex}</div>
              <div>{patient.phone ?? "-"}</div>
              <div>{new Date(patient.created_at).toLocaleDateString()}</div>
              <div>
                <Link
                  href={`/h/${hospital.slug}/patients/${patient.id}`}
                  className="text-primary underline underline-offset-4"
                >
                  View
                </Link>
              </div>
            </div>
          ))
        ) : (
          <div className="px-4 py-10 text-sm text-muted-foreground">
            No patients yet. Register your first patient.
          </div>
        )}
      </div>
    </main>
  );
}

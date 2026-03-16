import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Button } from "@/components/ui/button";

type PageProps = {
  params: Promise<{
    hospitalSlug: string;
  }>;
};

function stageLabel(stage: string | null) {
  if (!stage) return "initial review";
  return stage.replaceAll("_", " ");
}

function dispositionLabel(disposition: string | null) {
  if (!disposition) return "—";
  return disposition.replaceAll("_", " ");
}

export default async function EncountersPage({ params }: PageProps) {
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

  const { data: encounters, error } = await supabase
    .from("encounters")
    .select(`
      id,
      encounter_datetime,
      status,
      stage,
      disposition_type,
      requires_lab,
      chief_complaint,
      diagnosis_text,
      created_at,
      patients (
        id,
        patient_number,
        first_name,
        last_name
      )
    `)
    .eq("hospital_id", hospital.id)
    .order("encounter_datetime", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (
    <main className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">Encounters</p>
          <h1 className="text-3xl font-bold">Clinical Encounters</h1>
          <p className="text-muted-foreground">{hospital.name}</p>
        </div>

        <Button asChild>
          <Link href={`/h/${hospital.slug}/encounters/new`}>New Encounter</Link>
        </Button>
      </div>

      <div className="rounded-xl border">
        <div className="grid grid-cols-7 gap-4 border-b px-4 py-3 text-sm font-medium text-muted-foreground">
          <div>Patient</div>
          <div>Date</div>
          <div>Status</div>
          <div>Stage</div>
          <div>Chief Complaint</div>
          <div>Disposition</div>
          <div>Open</div>
        </div>

        {encounters && encounters.length > 0 ? (
          encounters.map((encounter) => {
            const patient = Array.isArray(encounter.patients)
              ? encounter.patients[0]
              : encounter.patients;

            return (
              <div
                key={encounter.id}
                className="grid grid-cols-7 gap-4 border-b px-4 py-3 text-sm last:border-b-0"
              >
                <div className="font-medium">
                  {patient
                    ? `${patient.last_name}, ${patient.first_name}`
                    : "Unknown patient"}
                </div>
                <div>{new Date(encounter.encounter_datetime).toLocaleString()}</div>
                <div className="capitalize">{encounter.status}</div>
                <div className="capitalize">
                  {stageLabel(encounter.stage)}
                  {encounter.requires_lab ? " · lab" : ""}
                </div>
                <div>{encounter.chief_complaint ?? "-"}</div>
                <div className="capitalize">{dispositionLabel(encounter.disposition_type)}</div>
                <div>
                  <Link
                    href={`/h/${hospital.slug}/encounters/${encounter.id}`}
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
            No encounters yet. Create your first encounter.
          </div>
        )}
      </div>
    </main>
  );
}
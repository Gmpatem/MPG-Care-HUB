import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DoctorQueueList } from "@/features/doctor-workflow/components/doctor-queue-list";
import { DoctorStats } from "@/features/doctor-workflow/components/doctor-stats";
import type { DoctorQueueRow, DoctorStageCounts, DoctorSummary } from "@/features/doctor-workflow/types";

type HospitalLite = {
  id: string;
  name: string;
  slug: string;
};

export function DoctorDashboard({
  hospital,
  summary,
  queueRows,
  stageCounts,
}: {
  hospital: HospitalLite;
  summary: DoctorSummary | null;
  queueRows: DoctorQueueRow[];
  stageCounts: DoctorStageCounts;
}) {
  return (
    <main className="space-y-6">
      <Card>
        <CardContent className="flex flex-col gap-4 py-5">
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Doctor Workflow</p>
            <h1 className="text-3xl font-bold">{hospital.name}</h1>
            <p className="text-sm text-muted-foreground">
              Review initial consultations, track investigations, make final clinical decisions, and send prescriptions into Pharmacy.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild>
              <Link href={`/h/${hospital.slug}/encounters`}>Open Encounters</Link>
            </Button>

            <Button asChild variant="outline">
              <Link href={`/h/${hospital.slug}/doctor/prescriptions/new`}>Write Prescription</Link>
            </Button>

            <Button asChild variant="outline">
              <Link href={`/h/${hospital.slug}/patients`}>Find Patient</Link>
            </Button>

            <Button asChild variant="outline">
              <Link href={`/h/${hospital.slug}/frontdesk/queue`}>Front Desk Queue</Link>
            </Button>

            <Button asChild variant="outline">
              <Link href={`/h/${hospital.slug}/doctor/rounds`}>Rounds</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      <DoctorStats summary={summary} stageCounts={stageCounts} />

      <div className="grid gap-6 lg:grid-cols-[1.7fr_.9fr]">
        <DoctorQueueList hospitalSlug={hospital.slug} rows={queueRows} />

        <Card>
          <CardContent className="space-y-4 py-5">
            <div>
              <h2 className="text-lg font-semibold">Clinical Flow</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                One encounter should carry the patient from review to investigation to final decision.
              </p>
            </div>

            <div className="space-y-3 text-sm text-muted-foreground">
              <div className="rounded-lg bg-muted p-3">
                New consultation starts the encounter and records the initial clinical picture.
              </div>
              <div className="rounded-lg bg-muted p-3">
                If labs are needed, keep the same encounter active and move it to awaiting results.
              </div>
              <div className="rounded-lg bg-muted p-3">
                After results review, make a final decision: prescribe, admit, refer, or follow up.
              </div>
              <div className="rounded-lg bg-muted p-3">
                Prescriptions created by doctors are received by Pharmacy for dispensing through the pharmacy queue.
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
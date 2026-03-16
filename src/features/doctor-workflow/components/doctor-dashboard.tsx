import Link from "next/link";
import {
  ArrowRight,
  ClipboardCheck,
  FlaskConical,
  Search,
  Stethoscope,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { WorkspacePageHeader } from "@/components/layout/workspace-page-header";
import { WorkspaceSectionHeader } from "@/components/layout/workspace-section-header";
import { WorkflowStepCard } from "@/components/layout/workflow-step-card";
import { DoctorQueueList } from "@/features/doctor-workflow/components/doctor-queue-list";
import { DoctorStats } from "@/features/doctor-workflow/components/doctor-stats";
import type {
  DoctorQueueRow,
  DoctorStageCounts,
  DoctorSummary,
} from "@/features/doctor-workflow/types";

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
      <WorkspacePageHeader
        eyebrow="Doctor Workspace"
        title={hospital.name}
        description="Review consultations, request investigations, revisit results, and make final clinical decisions that move patients to pharmacy, ward, discharge, or follow-up."
        actions={
          <>
            <Button asChild>
              <Link href={`/h/${hospital.slug}/encounters`}>Open Visit Queue</Link>
            </Button>

            <Button asChild variant="outline">
              <Link href={`/h/${hospital.slug}/doctor/prescriptions/new`}>
                Write Prescription
              </Link>
            </Button>

            <Button asChild variant="outline">
              <Link href={`/h/${hospital.slug}/patients`}>Find Patient</Link>
            </Button>

            <Button asChild variant="outline">
              <Link href={`/h/${hospital.slug}/doctor/rounds`}>Open Rounds</Link>
            </Button>
          </>
        }
      />

      <DoctorStats summary={summary} stageCounts={stageCounts} />

      <div className="grid gap-6 lg:grid-cols-[1.7fr_.9fr]">
        <div className="space-y-4">
          <WorkspaceSectionHeader
            title="Doctor Work Queue"
            description="Clinical visits arranged by encounter stage so the next action is always visible."
            actions={
              <Button asChild variant="outline" size="sm">
                <Link href={`/h/${hospital.slug}/encounters`}>
                  Open All Encounters
                </Link>
              </Button>
            }
          />

          <DoctorQueueList hospitalSlug={hospital.slug} rows={queueRows} />
        </div>

        <Card className="border-border/70">
          <CardContent className="space-y-4 py-5">
            <WorkspaceSectionHeader
              title="Clinical Flow"
              description="Keep one encounter active from first review to final decision."
            />

            <div className="space-y-3">
              <WorkflowStepCard
                step="Step 1"
                title="Start the visit"
                description="Record the complaint, history, assessment, plan, and initial decisions."
                icon={<Stethoscope className="h-4 w-4 text-muted-foreground" />}
              />

              <WorkflowStepCard
                step="Step 2"
                title="Request and review labs"
                description="Keep the same encounter active while the case waits for investigation results."
                icon={<FlaskConical className="h-4 w-4 text-muted-foreground" />}
              />

              <WorkflowStepCard
                step="Step 3"
                title="Make the final decision"
                description="Prescribe, admit, refer, discharge, or schedule follow-up from the same flow."
                icon={<ClipboardCheck className="h-4 w-4 text-muted-foreground" />}
              />

              <Button asChild variant="outline" className="w-full justify-between">
                <Link href={`/h/${hospital.slug}/encounters`}>
                  Open Clinical Encounters
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>

              <Button asChild variant="outline" className="w-full justify-between">
                <Link href={`/h/${hospital.slug}/patients`}>
                  Search Patient Record
                  <Search className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

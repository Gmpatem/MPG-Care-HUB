import Link from "next/link";
import { ArrowRight, ClipboardList, Search, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { WorkspacePageHeader } from "@/components/layout/workspace-page-header";
import { WorkspaceSectionHeader } from "@/components/layout/workspace-section-header";
import { WorkflowStepCard } from "@/components/layout/workflow-step-card";
import { FrontdeskStats } from "@/features/frontdesk/components/frontdesk-stats";
import { FrontdeskQueuePreview } from "@/features/frontdesk/components/frontdesk-queue-preview";
import type {
  FrontdeskQueueRow,
  FrontdeskSummary,
} from "@/features/frontdesk/types";

type HospitalLite = {
  id: string;
  name: string;
  slug: string;
};

export function FrontdeskDashboard({
  hospital,
  summary,
  queueRows,
}: {
  hospital: HospitalLite;
  summary: FrontdeskSummary | null;
  queueRows: FrontdeskQueueRow[];
}) {
  return (
    <main className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Front Desk Workspace"
        title="Front Desk"
        description="Register patients, confirm returning records, schedule visits, and hand patients into the live care queue without duplicate intake."
        actions={
          <>
            <Button asChild>
              <Link href={`/h/${hospital.slug}/frontdesk/intake`}>
                Register or Find Patient
              </Link>
            </Button>

            <Button asChild variant="outline">
              <Link href={`/h/${hospital.slug}/frontdesk/patients`}>
                Search Patients
              </Link>
            </Button>

            <Button asChild variant="outline">
              <Link href={`/h/${hospital.slug}/frontdesk/queue`}>
                Open Today&apos;s Queue
              </Link>
            </Button>
          </>
        }
      />

      <Card className="border-border/70">
        <CardContent className="py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <h2 className="text-lg font-semibold">Quick Intake Search</h2>
              <p className="text-sm text-muted-foreground">
                Step 1: search first to avoid duplicate records. Step 2: confirm or register.
                Step 3: send the patient into the live queue.
              </p>
            </div>

            <form
              action={`/h/${hospital.slug}/frontdesk/intake`}
              method="get"
              className="flex w-full max-w-2xl gap-3"
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  name="q"
                  placeholder="Search by patient name, phone number, or patient number..."
                  className="h-11 pl-10"
                />
              </div>

              <Button type="submit" variant="outline" className="h-11">
                Open Intake
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>

      <FrontdeskStats summary={summary} />

      <div className="grid gap-6 lg:grid-cols-[1.6fr_.9fr]">
        <div className="space-y-4">
          <WorkspaceSectionHeader
            title="Live Front Desk Queue"
            description="Patients already received or routed into today’s working queue."
            actions={
              <Button asChild variant="outline" size="sm">
                <Link href={`/h/${hospital.slug}/frontdesk/queue`}>
                  View Full Queue
                </Link>
              </Button>
            }
          />

          <FrontdeskQueuePreview hospitalSlug={hospital.slug} rows={queueRows} />
        </div>

        <Card className="border-border/70">
          <CardContent className="space-y-4 py-5">
            <WorkspaceSectionHeader
              title="Front Desk Flow"
              description="Use the same intake rhythm for every arrival."
            />

            <div className="space-y-3">
              <WorkflowStepCard
                step="Step 1"
                title="Search first"
                description="Use Smart Intake or Search Patients before creating a new record."
                icon={<Search className="h-4 w-4 text-muted-foreground" />}
              />

              <WorkflowStepCard
                step="Step 2"
                title="Confirm demographics"
                description="Update patient details, visit type, and assigned provider if needed."
                icon={<Users className="h-4 w-4 text-muted-foreground" />}
              />

              <WorkflowStepCard
                step="Step 3"
                title="Send to queue"
                description="Once intake is complete, the patient becomes visible for the next care step."
                icon={<ClipboardList className="h-4 w-4 text-muted-foreground" />}
              />

              <Button asChild variant="outline" className="w-full justify-between">
                <Link href={`/h/${hospital.slug}/frontdesk/intake`}>
                  Start Smart Intake
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}



import Link from "next/link";
import {
  ClipboardList,
  FlaskConical,
  ListChecks,
  TestTube2,
} from "lucide-react";

import { WorkspacePageHeader } from "@/components/layout/workspace-page-header";
import { WorkspaceSectionHeader } from "@/components/layout/workspace-section-header";
import { WorkspaceStatCard } from "@/components/layout/workspace-stat-card";
import { WorkflowStepCard } from "@/components/layout/workflow-step-card";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type LabDashboardProps = {
  hospitalSlug: string;
  hospitalName: string;
  totalTests: number;
  activeTests: number;
  pendingOrders: number;
  completedToday: number;
};

export function LabDashboard({
  hospitalSlug,
  hospitalName,
  totalTests,
  activeTests,
  pendingOrders,
  completedToday,
}: LabDashboardProps) {
  return (
    <main className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Laboratory Workspace"
        title={hospitalName}
        description="Process ordered investigations, enter results by test item, and send completed cases back to doctor review without losing the encounter flow."
        actions={
          <>
            <Button asChild>
              <Link href={`/h/${hospitalSlug}/lab/orders`}>Review Lab Queue</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/lab/tests`}>Lab Test Catalog</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/lab/tests/new`}>Add Test to Catalog</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WorkspaceStatCard
          title="Catalog Tests"
          value={totalTests}
          description="Total lab tests configured for this hospital"
          icon={<TestTube2 className="h-4 w-4" />}
        />

        <WorkspaceStatCard
          title="Active for Ordering"
          value={activeTests}
          description="Tests currently available to doctors"
          icon={<FlaskConical className="h-4 w-4" />}
        />

        <WorkspaceStatCard
          title="Pending Orders"
          value={pendingOrders}
          description="Orders waiting for result entry or completion"
          icon={<ClipboardList className="h-4 w-4" />}
        />

        <WorkspaceStatCard
          title="Completed Today"
          value={completedToday}
          description="Orders finished and returned for review"
          icon={<ListChecks className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.45fr_.95fr]">
        <Card className="border-border/70">
          <CardContent className="space-y-4 py-5">
            <WorkspaceSectionHeader
              title="Laboratory Workflow"
              description="Use the same result flow for every incoming order."
            />

            <div className="space-y-3">
              <WorkflowStepCard
                step="Step 1"
                title="Open the queue"
                description="New orders placed from the Doctor workspace appear in the lab queue automatically."
              />

              <WorkflowStepCard
                step="Step 2"
                title="Enter results by item"
                description="Record results per requested test item so incomplete orders can still stay in progress safely."
              />

              <WorkflowStepCard
                step="Step 3"
                title="Complete and return"
                description="Once all required items are recorded, complete the order so the doctor can continue the same encounter."
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/70">
          <CardContent className="space-y-4 py-5">
            <WorkspaceSectionHeader
              title="Quick Actions"
              description="Most-used lab routes"
            />

            <div className="flex flex-col gap-2">
              <Button asChild className="justify-between">
                <Link href={`/h/${hospitalSlug}/lab/orders`}>
                  Open Lab Orders
                </Link>
              </Button>

              <Button asChild variant="outline" className="justify-between">
                <Link href={`/h/${hospitalSlug}/lab/tests`}>
                  Review Lab Test Catalog
                </Link>
              </Button>

              <Button asChild variant="outline" className="justify-between">
                <Link href={`/h/${hospitalSlug}/doctor`}>
                  Return to Doctor Workflow
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}

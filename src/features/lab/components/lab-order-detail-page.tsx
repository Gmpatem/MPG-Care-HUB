import Link from "next/link";
import { ClipboardCheck, FlaskConical, TestTubeDiagonal, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WorkspacePageHeader } from "@/components/layout/workspace-page-header";
import { WorkspaceSectionHeader } from "@/components/layout/workspace-section-header";
import { WorkspaceStatCard } from "@/components/layout/workspace-stat-card";
import { WorkflowStepCard } from "@/components/layout/workflow-step-card";
import { StatusBadge } from "@/components/layout/status-badge";
import { InfoGrid } from "@/components/layout/info-grid";
import { TaskReadinessSummary } from "@/components/layout/task-readiness-summary";
import { SectionDisclosure } from "@/components/layout/progressive-disclosure";
import { TimelineFeed, type TimelineEvent } from "@/components/layout/timeline-feed";
import {
  SharedPatientContext,
  fullName,
  formatDateTime,
} from "@/components/layout/shared-patient-context";
import { RelatedActionsSection } from "@/components/layout/related-workspace-actions";
import { PatientJourneyStrip, type JourneyStageInfo } from "@/components/layout/patient-journey-strip";
import { getLabOrderReadiness } from "@/lib/ui/task-state";

function itemTone(status: string | null) {
  if (status === "verified") return "success" as const;
  if (status === "entered") return "info" as const;
  if (status === "pending") return "warning" as const;
  return "neutral" as const;
}

function LabOrderReadinessSummary({ 
  order, 
  items 
}: { 
  order: { status?: string | null }; 
  items: Array<{ status?: string | null }>;
}) {
  const pendingItems = items.filter((item) => item.status === "pending").length;
  const enteredItems = items.filter((item) => item.status === "entered").length;
  const verifiedItems = items.filter((item) => item.status === "verified" || item.status === "completed").length;
  
  const signal = getLabOrderReadiness(
    order?.status,
    pendingItems,
    enteredItems,
    verifiedItems,
    items.length
  );

  return <TaskReadinessSummary signal={signal} title="Lab Order Status" />;
}

function generateLabOrderTimeline(
  order: {
    id: string;
    status?: string | null;
    priority?: string | null;
    ordered_at?: string | null;
    sample_collected_at?: string | null;
    completed_at?: string | null;
    ordered_by_staff?: { full_name?: string | null } | null;
  },
  items: Array<{
    id: string;
    test_name: string;
    status?: string | null;
    entered_at?: string | null;
    verified_at?: string | null;
  }>
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  // Order created
  if (order.ordered_at) {
    events.push({
      id: `order-created-${order.id}`,
      type: "lab_order",
      title: "Lab order created",
      description: order.priority && order.priority !== "routine" 
        ? `${order.priority} priority` 
        : undefined,
      actor: order.ordered_by_staff?.full_name
        ? { name: order.ordered_by_staff.full_name, role: "Requesting Physician" }
        : undefined,
      timestamp: order.ordered_at,
      status: order.status === "cancelled" 
        ? { label: "Cancelled", tone: "danger" }
        : undefined,
    });
  }

  // Sample collected
  if (order.sample_collected_at) {
    events.push({
      id: `sample-collected-${order.id}`,
      type: "specimen_collected",
      title: "Specimen collected",
      timestamp: order.sample_collected_at,
    });
  }

  // Result entry events for each item
  items.forEach((item) => {
    if (item.entered_at) {
      events.push({
        id: `result-entered-${item.id}`,
        type: "lab_result",
        title: `Result entered: ${item.test_name}`,
        timestamp: item.entered_at,
        status: item.status === "verified"
          ? { label: "Verified", tone: "success" }
          : item.status === "entered"
          ? { label: "Pending verification", tone: "warning" }
          : undefined,
      });
    }

    if (item.verified_at && item.verified_at !== item.entered_at) {
      events.push({
        id: `result-verified-${item.id}`,
        type: "lab_result",
        title: `Result verified: ${item.test_name}`,
        timestamp: item.verified_at,
        status: { label: "Verified", tone: "success" },
      });
    }
  });

  // Order completed
  if (order.completed_at) {
    events.push({
      id: `order-completed-${order.id}`,
      type: "lab_result",
      title: "Lab order completed",
      description: "All results entered and verified",
      timestamp: order.completed_at,
      status: { label: "Completed", tone: "success" },
    });
  }

  // Sort by timestamp
  return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export function LabOrderDetailPage({
  hospitalSlug,
  order,
  items,
}: {
  hospitalSlug: string;
  order: {
    id: string;
    status?: string | null;
    priority?: string | null;
    clinical_notes?: string | null;
    ordered_at?: string | null;
    completed_at?: string | null;
    sample_collected_at?: string | null;
    encounter_id?: string | null;
    appointment_id?: string | null;
    patient?: {
      id?: string;
      patient_number?: string | null;
      first_name?: string;
      middle_name?: string | null;
      last_name?: string;
      sex?: string | null;
      phone?: string | null;
    } | null;
    ordered_by_staff?: {
      id?: string;
      full_name?: string | null;
    } | null;
    encounter?: unknown;
  };
  items: Array<{
    id: string;
    test_name: string;
    status?: string | null;
    result_text?: string | null;
    result_json?: unknown;
    unit?: string | null;
    reference_range?: string | null;
    entered_at?: string | null;
    verified_at?: string | null;
    notes?: string | null;
    lab_test?: {
      id?: string;
      code?: string | null;
      name?: string;
    } | null;
  }>;
}) {
  const completedItems = items.filter((item) => item.status === "verified" || item.status === "completed").length;
  const pendingItems = items.filter((item) => item.status === "pending").length;
  const enteredItems = items.filter((item) => item.status === "entered").length;

  const timelineEvents = generateLabOrderTimeline(order, items);

  const patientName = order?.patient?.first_name && order?.patient?.last_name
    ? fullName({
        first_name: order.patient.first_name,
        middle_name: order.patient.middle_name,
        last_name: order.patient.last_name,
      })
    : "Unknown patient";

  const orderMeta = (
    <>
      <StatusBadge 
        label={order?.status?.replaceAll("_", " ") ?? "ordered"} 
        tone={order?.status === "completed" ? "success" : order?.status === "cancelled" ? "danger" : "info"}
        className="text-xs capitalize"
      />
      <span className="text-muted-foreground">·</span>
      <span className="text-sm text-muted-foreground">
        Priority: {order?.priority ?? "routine"}
      </span>
      <span className="text-muted-foreground">·</span>
      <span className="text-sm text-muted-foreground">
        {items.length} items
      </span>
    </>
  );

  const patientForContext = order?.patient?.first_name && order?.patient?.last_name
    ? {
        id: order.patient.id,
        first_name: order.patient.first_name,
        middle_name: order.patient.middle_name,
        last_name: order.patient.last_name,
        patient_number: order.patient.patient_number,
        sex: order.patient.sex,
        phone: order.patient.phone,
      }
    : null;

  return (
    <main className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Laboratory Order"
        title={patientName}
        description="Review the full investigation request, enter results item by item, verify completed results, and keep doctor follow-up visible."
        meta={orderMeta}
        backLink={{ href: `/h/${hospitalSlug}/lab/orders`, label: "Back to Lab Orders" }}
        primaryAction={
          pendingItems > 0 ? (
            <Button asChild>
              <Link href={`/h/${hospitalSlug}/lab/orders/${order.id}/enter-results`}>
                Enter Results
              </Link>
            </Button>
          ) : undefined
        }
        secondaryActions={
          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/doctor`}>Doctor Workspace</Link>
          </Button>
        }
        compact
      />

      {/* Patient Journey Context */}
      <PatientJourneyStrip 
        hospitalSlug={hospitalSlug}
        stages={[
          { stage: "intake", status: "complete" },
          { stage: "checkin", status: "complete" },
          { stage: "doctor", status: "complete" },
          { stage: "lab", status: order?.status === "completed" ? "complete" : "active" },
          { stage: "pharmacy", status: "waiting" },
          { stage: "billing", status: "waiting" },
          { stage: "discharge", status: "skipped" },
        ]}
        currentInterpretation={order?.status === "completed" 
          ? "Lab work finished. Results available for doctor review."
          : "Lab order in progress. Results being processed."
        }
        nextStep={order?.status === "completed" 
          ? "Doctor will review results and determine next steps."
          : pendingItems > 0 
            ? `Enter results for ${pendingItems} pending item${pendingItems === 1 ? "" : "s"}.`
            : "Verify entered results to complete the order."
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WorkspaceStatCard
          title="Order Status"
          value={order?.status?.replaceAll("_", " ") ?? "ordered"}
          description={`Priority: ${order?.priority ?? "routine"}`}
          icon={<FlaskConical className="h-4 w-4" />}
          valueClassName="text-xl"
        />
        <WorkspaceStatCard
          title="Items Total"
          value={items.length}
          description="Requested tests on this order"
          icon={<TestTubeDiagonal className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Entered / Verified"
          value={`${enteredItems + completedItems}/${items.length}`}
          description="Results already touched by lab staff"
          icon={<ClipboardCheck className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Pending"
          value={pendingItems}
          description="Tests still waiting for result entry"
          icon={<UserRound className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.45fr_.95fr]">
        <div className="space-y-6">
          {/* Order Readiness Summary */}
          <LabOrderReadinessSummary order={order} items={items} />

          {/* Shared Patient Context */}
          <SharedPatientContext
            hospitalSlug={hospitalSlug}
            patient={patientForContext}
            labOrder={order}
            showRelatedLinks={true}
            primaryItems={[
              { label: "Priority", value: order?.priority },
              { label: "Ordered At", value: formatDateTime(order?.ordered_at) },
              { label: "Sample Collected", value: formatDateTime(order?.sample_collected_at) },
              { label: "Completed At", value: formatDateTime(order?.completed_at) },
            ]}
            secondaryItems={[
              { label: "Ordered By", value: order?.ordered_by_staff?.full_name ?? "Unknown" },
              { label: "Encounter", value: order?.encounter_id },
              { label: "Appointment", value: order?.appointment_id },
              { label: "Patient Phone", value: order?.patient?.phone },
            ]}
          />

          {/* Lab Order Timeline */}
          <TimelineFeed
            title="Lab Order Timeline"
            description="Order progression and result history"
            events={timelineEvents}
            expandable={false}
          />

          {/* Related Actions */}
          <RelatedActionsSection
            hospitalSlug={hospitalSlug}
            patientId={order?.patient?.id}
            labOrderId={order?.id}
            encounterId={order?.encounter_id ?? undefined}
            appointmentId={order?.appointment_id ?? undefined}
            currentWorkspace="lab"
            title="Continue Care"
          />

          {/* Clinical Notes - Progressive Disclosure */}
          <SectionDisclosure
            title="Clinical Notes"
            description="Doctor-provided context for the requested investigations"
            empty={!order?.clinical_notes}
            emptyMessage="No clinical notes provided."
            defaultExpanded={!!order?.clinical_notes}
          >
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4 text-sm leading-6 text-foreground">
              {order?.clinical_notes}
            </div>
          </SectionDisclosure>

          {/* Lab Result Items */}
          <section className="surface-panel p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Lab Result Items"
              description="Enter and verify results item by item so incomplete work stays visible."
            />

            <div className="mt-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="rounded-2xl border border-border/70 bg-background p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-foreground">{item.test_name}</p>
                        <StatusBadge
                          label={item.status?.replaceAll("_", " ") ?? "pending"}
                          tone={itemTone(item.status ?? null)}
                          className="px-2.5 py-1 capitalize font-medium"
                        />
                      </div>

                      <InfoGrid
                        items={[
                          { label: "Unit", value: item.unit },
                          { label: "Reference Range", value: item.reference_range },
                          { label: "Entered At", value: formatDateTime(item.entered_at) },
                          { label: "Verified At", value: formatDateTime(item.verified_at) },
                        ]}
                      />

                      {/* Result and Notes - Progressive Disclosure */}
                      <div className="grid gap-3 xl:grid-cols-2">
                        <SectionDisclosure
                          title="Result Text"
                          empty={!item.result_text}
                          emptyMessage="No result entered yet."
                          defaultExpanded={!!item.result_text}
                          className="border-0 bg-muted/30"
                        >
                          <p className="text-sm leading-6 text-foreground">
                            {item.result_text}
                          </p>
                        </SectionDisclosure>

                        <SectionDisclosure
                          title="Notes"
                          empty={!item.notes}
                          emptyMessage="No notes."
                          defaultExpanded={!!item.notes}
                          className="border-0 bg-muted/30"
                        >
                          <p className="text-sm leading-6 text-foreground">
                            {item.notes}
                          </p>
                        </SectionDisclosure>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button asChild size="sm">
                        <Link href={`/h/${hospitalSlug}/lab/orders/${order.id}/items/${item.id}`}>
                          Enter Result
                        </Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <RelatedActionsSection
            hospitalSlug={hospitalSlug}
            patientId={order?.patient?.id}
            labOrderId={order?.id}
            encounterId={order?.encounter_id ?? undefined}
            appointmentId={order?.appointment_id ?? undefined}
            currentWorkspace="lab"
            title="Related Workspaces"
          />

          <section className="surface-panel p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Lab Flow"
              description="Safe result-entry routine"
            />

            <div className="mt-4 space-y-3">
              <WorkflowStepCard
                step="Step 1"
                title="Confirm patient and order context"
                description="Review the doctor's notes, order priority, and collection timing before entering results."
              />

              <WorkflowStepCard
                step="Step 2"
                title="Enter results by test"
                description="Record each requested investigation separately so pending items remain visible."
              />

              <WorkflowStepCard
                step="Step 3"
                title="Verify and release"
                description="Mark completed results clearly so the doctor can continue the patient decision flow."
              />
            </div>
          </section>

          <section className="surface-panel p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Order Snapshot"
              description="Quick lab context"
            />

            <div className="mt-4">
              <InfoGrid
                items={[
                  { label: "Pending Items", value: pendingItems },
                  { label: "Entered Items", value: enteredItems },
                  { label: "Verified / Completed", value: completedItems },
                  { label: "Priority", value: order?.priority },
                ]}
                columnsClassName="sm:grid-cols-2"
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

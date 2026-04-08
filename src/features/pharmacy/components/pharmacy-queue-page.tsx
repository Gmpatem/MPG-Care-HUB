import Link from "next/link";
import {
  AlertTriangle,
  ClipboardList,
  Pill,
  Receipt,
  PackageOpen,
  Clock,
  CheckCircle2,
} from "lucide-react";

import { StatusBadge } from "@/components/layout/status-badge";
import { WorkspaceEmptyState } from "@/components/layout/workspace-empty-state";
import { InlineInfo } from "@/components/feedback/inline-feedback";
import { WorkspacePageHeader } from "@/components/layout/workspace-page-header";
import { WorkspaceSectionHeader } from "@/components/layout/workspace-section-header";
import { WorkflowStepCard } from "@/components/layout/workflow-step-card";
import { QueueItemCard } from "@/components/layout/queue-item-card";
import { KpiCard, KpiSummaryStrip } from "@/components/layout/kpi-card";
import { HandoffHint } from "@/components/layout/workflow-handoff-card";
import {
  AttentionPanel,
  ActivityFeed,
  type AttentionItem,
  type ActivityItem,
} from "@/components/layout";
import {
  WorkspacePageShell,
} from "@/components/layout/workspace-page-shell";
import { Button } from "@/components/ui/button";
import { getPrescriptionReadiness } from "@/lib/ui/task-state";

function fullName(patient: any) {
  if (!patient) return "Unknown patient";
  return [patient.first_name, patient.middle_name, patient.last_name].filter(Boolean).join(" ");
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function statusTone(status: string) {
  if (status === "dispensed") return "success" as const;
  if (status === "partially_dispensed") return "warning" as const;
  return "neutral" as const;
}

function PrescriptionListItem({
  hospitalSlug,
  prescription,
}: {
  hospitalSlug: string;
  prescription: any;
}) {
  const readiness = getPrescriptionReadiness(
    prescription.status,
    prescription.stock_ready_count ?? 0,
    prescription.no_stock_count ?? 0,
    prescription.dispensed_count ?? 0,
    prescription.item_count ?? 0
  );

  const badges = [];
  if (prescription.prescribed_by_staff?.full_name) {
    badges.push({ label: "From doctor", tone: "info" as const });
  }

  // Determine handoff status
  const isBlocked = prescription.no_stock_count > 0;
  const isComplete = prescription.status === "dispensed";

  return (
    <QueueItemCard
      id={prescription.id}
      title={fullName(prescription.patient)}
      subtitle={`${prescription.patient?.patient_number ?? "No patient number"} · Received ${formatDateTime(prescription.prescribed_at)}`}
      readiness={readiness}
      badges={badges}
      meta={[
        { label: "Prescriber", value: prescription.prescribed_by_staff?.full_name ?? "Unknown" },
        { label: "Items", value: `${prescription.dispensed_count ?? 0}/${prescription.item_count ?? 0} dispensed` },
        { label: "Ready", value: prescription.stock_ready_count ?? 0 },
        { label: "No stock", value: prescription.no_stock_count ?? 0 },
      ]}
      actions={{
        primary: {
          label: "Open for Dispensing",
          href: `/h/${hospitalSlug}/pharmacy/prescriptions/${prescription.id}`,
        },
      }}
    >
      <div className="flex items-center gap-2 pt-2 border-t">
        <HandoffHint
          from="doctor"
          to="pharmacy"
          status={isComplete ? "complete" : isBlocked ? "blocked" : "ready"}
          description={isComplete ? "Dispensed — ready for billing" : isBlocked ? "Stock shortage" : "Ready for dispensing"}
        />
        {isComplete && (
          <>
            <span className="text-muted-foreground">→</span>
            <HandoffHint
              from="pharmacy"
              to="billing"
              status="ready"
              description="Awaiting payment"
            />
          </>
        )}
      </div>
    </QueueItemCard>
  );
}

function EmptyState({ hospitalSlug }: { hospitalSlug: string }) {
  return (
    <WorkspaceEmptyState
      variant="default"
      title="No prescriptions in queue"
      description="Doctor prescriptions will appear here automatically after they are created from the clinical workflow. Check the Doctor workspace for pending prescriptions."
      action={
        <Button asChild variant="outline">
          <Link href={`/h/${hospitalSlug}/doctor`}>Open Doctor Workspace</Link>
        </Button>
      }
    />
  );
}

function Section({
  title,
  description,
  prescriptions,
  hospitalSlug,
}: {
  title: string;
  description: string;
  prescriptions: any[];
  hospitalSlug: string;
}) {
  return (
    <section className="surface-panel p-4 sm:p-5">
      <WorkspaceSectionHeader title={title} description={description} />

      {prescriptions.length === 0 ? (
        <div className="mt-4">
          <InlineInfo 
            message="No prescriptions in this section. Items will appear here as prescriptions move through the workflow."
            compact
          />
        </div>
      ) : (
        <div className="mt-4 space-y-4">
          {prescriptions.map((prescription) => (
            <PrescriptionListItem
              key={prescription.id}
              hospitalSlug={hospitalSlug}
              prescription={prescription}
            />
          ))}
        </div>
      )}
    </section>
  );
}

export function PharmacyQueuePage({
  hospitalSlug,
  hospitalName,
  prescriptions,
  attentionItems = [],
  recentActivity = [],
}: {
  hospitalSlug: string;
  hospitalName: string;
  prescriptions: any[];
  attentionItems?: AttentionItem[];
  recentActivity?: ActivityItem[];
}) {
  const incoming = prescriptions.filter((p) => p.workflow_bucket === "incoming");
  const partial = prescriptions.filter((p) => p.workflow_bucket === "partial");
  const completed = prescriptions.filter((p) => p.workflow_bucket === "completed");

  const activeCount = prescriptions.filter((p) => p.status === "active").length;
  const partialCount = prescriptions.filter((p) => p.status === "partially_dispensed").length;
  const dispensedCount = prescriptions.filter((p) => p.status === "dispensed").length;
  const noStockPrescriptionCount = prescriptions.filter((p) => p.no_stock_count > 0).length;

  // Generate attention items from data if not provided
  const generatedAttentionItems: AttentionItem[] = attentionItems.length > 0
    ? attentionItems
    : [
        ...(noStockPrescriptionCount > 0 ? [{
          id: "stock-issues",
          title: `${noStockPrescriptionCount} prescription${noStockPrescriptionCount > 1 ? 's' : ''} with stock issues`,
          description: "Items unavailable — consider alternatives or restocking",
          tone: "warning" as const,
          href: `/h/${hospitalSlug}/pharmacy`,
          actionLabel: "Review Issues",
        }] : []),
        ...(incoming.length > 5 ? [{
          id: "pharmacy-backlog",
          title: "Pharmacy queue backing up",
          description: `${incoming.length} prescriptions waiting to be processed`,
          tone: "info" as const,
          href: `/h/${hospitalSlug}/pharmacy`,
          actionLabel: "Process Queue",
        }] : []),
      ].filter(Boolean);

  return (
    <WorkspacePageShell>
      <WorkspacePageHeader
        eyebrow="Pharmacy Workspace"
        title="Pharmacy"
        description="Receive doctor prescriptions, confirm stock availability, dispense medication safely, and track partial fulfillment without losing item-level visibility."
        primaryAction={
          <Button asChild>
            <Link href={`/h/${hospitalSlug}/pharmacy`}>Refresh Dispensing Queue</Link>
          </Button>
        }
        secondaryActions={
          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/doctor`}>Doctor Workspace</Link>
          </Button>
        }
      />

      {/* KPI Summary Strip - Primary pharmacy metrics */}
      <KpiSummaryStrip>
        <KpiCard
          title="Incoming"
          value={incoming.length}
          description={incoming.length > 0 
            ? "New prescriptions waiting for dispensing action"
            : "No new prescriptions to process"}
          icon={<ClipboardList className="h-4 w-4" />}
          tone={incoming.length > 5 ? "warning" : incoming.length > 0 ? "info" : "neutral"}
          action={{ label: "Dispense", href: `/h/${hospitalSlug}/pharmacy` }}
        />
        <KpiCard
          title="Partially Filled"
          value={partialCount}
          description={partialCount > 0 
            ? "Prescriptions with some items still pending"
            : "No partially filled prescriptions"}
          icon={<Clock className="h-4 w-4" />}
          tone={partialCount > 0 ? "warning" : "neutral"}
          action={{ label: "Complete", href: `/h/${hospitalSlug}/pharmacy` }}
        />
        <KpiCard
          title="Stock Issues"
          value={noStockPrescriptionCount}
          description={noStockPrescriptionCount > 0 
            ? "Prescriptions blocked by unavailable medication"
            : "All prescriptions have stock available"}
          icon={<AlertTriangle className="h-4 w-4" />}
          tone={noStockPrescriptionCount > 0 ? "danger" : "neutral"}
          action={{ label: "Review Issues", href: `/h/${hospitalSlug}/admin/pharmacy-stock` }}
        />
        <KpiCard
          title="Completed Today"
          value={dispensedCount}
          description={dispensedCount > 0 
            ? "Prescriptions fully dispensed"
            : "No prescriptions completed yet"}
          icon={<CheckCircle2 className="h-4 w-4" />}
          tone={dispensedCount > 0 ? "success" : "neutral"}
          action={{ label: "View History", href: `/h/${hospitalSlug}/pharmacy` }}
        />
      </KpiSummaryStrip>

      {/* Attention Panel for pharmacy priorities */}
      {generatedAttentionItems.length > 0 && (
        <AttentionPanel
          title="Pharmacy Attention"
          description="Prescriptions requiring priority handling"
          items={generatedAttentionItems}
          className="mb-6"
        />
      )}

      <div className="grid gap-6 lg:grid-cols-[1.55fr_.95fr]">
        <div className="space-y-6">
          {prescriptions.length === 0 ? (
            <EmptyState hospitalSlug={hospitalSlug} />
          ) : (
            <>
              <Section
                title="Incoming from Doctors"
                description="Start here first. These prescriptions have reached pharmacy and still need dispensing action."
                prescriptions={incoming}
                hospitalSlug={hospitalSlug}
              />

              <Section
                title="Partially Dispensed"
                description="These prescriptions still have pending items or stock-related follow-up."
                prescriptions={partial}
                hospitalSlug={hospitalSlug}
              />

              <Section
                title="Completed"
                description="Recently completed dispensing records."
                prescriptions={completed}
                hospitalSlug={hospitalSlug}
              />
            </>
          )}
        </div>

        <div className="space-y-6">
          <section className="surface-panel p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Dispensing Flow"
              description="Use this same rhythm for every prescription."
            />

            <div className="mt-4 space-y-3">
              <WorkflowStepCard
                step="Step 1"
                title="Open the prescription"
                description="Review prescriber details, item list, quantities, and special instructions."
              />

              <WorkflowStepCard
                step="Step 2"
                title="Confirm stock by item"
                description="Dispense what is available, flag missing stock, and keep partial fulfillment visible."
              />

              <WorkflowStepCard
                step="Step 3"
                title="Complete or continue later"
                description="Mark items as dispensed and return later if the prescription is only partially fulfilled."
              />
            </div>
          </section>

          <section className="surface-panel p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Queue Summary"
              description="Live pharmacy counts"
            />

            <div className="mt-4 grid gap-3">
              <div className="rounded-2xl border border-border/70 bg-background/70 p-3 text-sm text-muted-foreground">
                Total prescriptions
                <div className="mt-1 text-lg font-semibold text-foreground">{prescriptions.length}</div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/70 p-3 text-sm text-muted-foreground">
                Active status
                <div className="mt-1 text-lg font-semibold text-foreground">{activeCount}</div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/70 p-3 text-sm text-muted-foreground">
                Workflow partial
                <div className="mt-1 text-lg font-semibold text-foreground">{partial.length}</div>
              </div>
              <div className="rounded-2xl border border-border/70 bg-background/70 p-3 text-sm text-muted-foreground">
                Workflow completed
                <div className="mt-1 text-lg font-semibold text-foreground">{completed.length}</div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </WorkspacePageShell>
  );
}

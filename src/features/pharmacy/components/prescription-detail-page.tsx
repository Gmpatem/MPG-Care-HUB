import Link from "next/link";
import { AlertTriangle, ClipboardList, Pill, UserRound } from "lucide-react";

import { WorkspacePageHeader } from "@/components/layout/workspace-page-header";
import { WorkspaceSectionHeader } from "@/components/layout/workspace-section-header";
import { WorkspaceStatCard } from "@/components/layout/workspace-stat-card";
import { WorkflowStepCard } from "@/components/layout/workflow-step-card";
import { InfoGrid } from "@/components/layout/info-grid";
import { StatusBadge } from "@/components/layout/status-badge";
import { TaskReadinessSummary } from "@/components/layout/task-readiness-summary";
import { TimelineFeed, type TimelineEvent } from "@/components/layout/timeline-feed";
import { Button } from "@/components/ui/button";
import {
  SharedPatientContext,
  fullName,
  formatDateTime,
} from "@/components/layout/shared-patient-context";
import { RelatedActionsSection } from "@/components/layout/related-workspace-actions";
import { PatientJourneyStrip } from "@/components/layout/patient-journey-strip";
import { getPrescriptionReadiness, getPrescriptionItemReadiness } from "@/lib/ui/task-state";

function itemTone(item: { status?: string | null; has_stock?: boolean }) {
  const signal = getPrescriptionItemReadiness(item.status, item.has_stock);
  return signal.tone;
}

function itemLabel(item: { status?: string | null; has_stock?: boolean }) {
  const signal = getPrescriptionItemReadiness(item.status, item.has_stock);
  return signal.label;
}

function PrescriptionReadinessSummary({
  prescription,
  items,
}: {
  prescription: { status?: string | null };
  items: Array<{ has_stock?: boolean; status?: string | null }>;
}) {
  const readyCount = items.filter((item) => item.has_stock !== false).length;
  const blockedCount = items.filter((item) => item.has_stock === false).length;
  const dispensedCount = items.filter((item) => item.status === "dispensed").length;

  const signal = getPrescriptionReadiness(
    prescription?.status,
    readyCount,
    blockedCount,
    dispensedCount,
    items.length
  );

  return <TaskReadinessSummary signal={signal} title="Prescription Status" />;
}

function generatePrescriptionTimeline(
  prescription: {
    id: string;
    status?: string | null;
    prescribed_at?: string | null;
    prescribed_by_staff?: { full_name?: string | null } | null;
  },
  dispensations: Array<{
    id: string;
    status?: string | null;
    dispensed_at?: string | null;
    dispensed_by_staff?: { full_name?: string | null } | null;
    dispensation_items?: Array<{
      prescription_item_id?: string;
      quantity_dispensed?: number;
    }>;
  }>
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  // Prescription created
  if (prescription.prescribed_at) {
    events.push({
      id: `prescription-created-${prescription.id}`,
      type: "prescription",
      title: "Prescription created",
      actor: prescription.prescribed_by_staff?.full_name
        ? { name: prescription.prescribed_by_staff.full_name, role: "Prescribing Physician" }
        : undefined,
      timestamp: prescription.prescribed_at,
    });
  }

  // Dispensation events
  dispensations.forEach((dispensation) => {
    if (dispensation.dispensed_at) {
      const itemCount = dispensation.dispensation_items?.length ?? 0;
      const totalQty = dispensation.dispensation_items?.reduce(
        (sum, item) => sum + (item.quantity_dispensed ?? 0),
        0
      ) ?? 0;

      events.push({
        id: `dispensation-${dispensation.id}`,
        type: "dispensation",
        title: "Medication dispensed",
        description: `${itemCount} item${itemCount !== 1 ? "s" : ""} · ${totalQty} unit${totalQty !== 1 ? "s" : ""}`,
        actor: dispensation.dispensed_by_staff?.full_name
          ? { name: dispensation.dispensed_by_staff.full_name, role: "Pharmacist" }
          : undefined,
        timestamp: dispensation.dispensed_at,
        status: dispensation.status === "completed"
          ? { label: "Completed", tone: "success" }
          : dispensation.status === "partial"
          ? { label: "Partial", tone: "warning" }
          : undefined,
      });
    }
  });

  // Sort by timestamp
  return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export function PrescriptionDetailPage({
  hospitalSlug,
  prescription,
  items,
  dispensations,
}: {
  hospitalSlug: string;
  prescription: {
    id: string;
    status?: string | null;
    notes?: string | null;
    prescribed_at?: string | null;
    encounter_id?: string | null;
    patient?: {
      id?: string;
      patient_number?: string | null;
      first_name?: string;
      middle_name?: string | null;
      last_name?: string;
      sex?: string | null;
      phone?: string | null;
    } | null;
    prescribed_by_staff?: {
      id?: string;
      full_name?: string | null;
    } | null;
    encounter?: unknown;
  };
  items: Array<{
    id: string;
    medication_name: string;
    dose?: string | null;
    frequency?: string | null;
    duration?: string | null;
    route?: string | null;
    quantity_prescribed?: number | null;
    quantity_dispensed?: number | null;
    available_stock?: number | null;
    status?: string | null;
    instructions?: string | null;
    has_stock?: boolean;
  }>;
  dispensations: Array<{
    id: string;
    status?: string | null;
    dispensed_at?: string | null;
    dispensed_by_staff?: { full_name?: string | null } | null;
    dispensation_items?: Array<{
      prescription_item_id?: string;
      quantity_dispensed?: number;
    }>;
  }>;
}) {
  const readyCount = items.filter((item) => item.has_stock !== false).length;
  const blockedCount = items.filter((item) => item.has_stock === false).length;
  const dispensedCount = items.filter((item) => item.status === "dispensed").length;
  const pendingCount = items.filter((item) => item.status !== "dispensed").length;

  const timelineEvents = generatePrescriptionTimeline(prescription, dispensations);

  const patientName = prescription?.patient?.first_name && prescription?.patient?.last_name
    ? fullName({
        first_name: prescription.patient.first_name,
        middle_name: prescription.patient.middle_name,
        last_name: prescription.patient.last_name,
      })
    : "Unknown patient";

  const patientForContext = prescription?.patient?.first_name && prescription?.patient?.last_name
    ? {
        id: prescription.patient.id,
        first_name: prescription.patient.first_name,
        middle_name: prescription.patient.middle_name,
        last_name: prescription.patient.last_name,
        patient_number: prescription.patient.patient_number,
        sex: prescription.patient.sex,
        phone: prescription.patient.phone,
      }
    : null;

  const prescriptionMeta = (
    <>
      <StatusBadge 
        label={prescription?.status?.replaceAll("_", " ") ?? "pending"} 
        tone={prescription?.status === "dispensed" ? "success" : prescription?.status === "partial" ? "warning" : "info"}
        className="text-xs capitalize"
      />
      <span className="text-muted-foreground">·</span>
      <span className="text-sm text-muted-foreground">
        {items.length} items
      </span>
      {blockedCount > 0 && (
        <>
          <span className="text-muted-foreground">·</span>
          <StatusBadge label={`${blockedCount} blocked`} tone="warning" className="text-xs" />
        </>
      )}
    </>
  );

  return (
    <main className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Prescription"
        title={patientName}
        description="Review the full prescription, confirm item availability, and dispense medication safely without losing visibility into blocked or partial items."
        meta={prescriptionMeta}
        backLink={{ href: `/h/${hospitalSlug}/pharmacy`, label: "Back to Pharmacy" }}
        primaryAction={
          pendingCount > 0 ? (
            <Button asChild>
              <Link href={`/h/${hospitalSlug}/pharmacy/prescriptions/${prescription.id}/dispense`}>
                Dispense
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
          { stage: "lab", status: "optional" },
          { stage: "pharmacy", status: prescription?.status === "dispensed" ? "complete" : "active" },
          { stage: "billing", status: "waiting" },
          { stage: "discharge", status: "skipped" },
        ]}
        currentInterpretation={prescription?.status === "dispensed"
          ? "Medication dispensed. Patient can proceed to billing."
          : blockedCount > 0
            ? `${blockedCount} item${blockedCount === 1 ? "" : "s"} blocked by stock shortage.`
            : "Prescription ready for dispensing."
        }
        nextStep={prescription?.status === "dispensed"
          ? "Billing will finalize payment for dispensed medications."
          : blockedCount > 0
            ? "Resolve stock issues or order alternative medications."
            : pendingCount > 0
              ? `Dispense ${pendingCount} remaining item${pendingCount === 1 ? "" : "s"}.`
              : "All items dispensed - proceed to billing."
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WorkspaceStatCard
          title="Prescription Items"
          value={items.length}
          description="Total medications on this prescription"
          icon={<ClipboardList className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Ready to Dispense"
          value={readyCount}
          description="Items with stock available"
          icon={<Pill className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Blocked by Stock"
          value={blockedCount}
          description="Items needing stock attention"
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Dispensed"
          value={dispensedCount}
          description="Items already completed"
          icon={<UserRound className="h-4 w-4" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.45fr_.95fr]">
        <div className="space-y-6">
          {/* Prescription Readiness Summary */}
          <PrescriptionReadinessSummary prescription={prescription} items={items} />

          {/* Shared Patient Context */}
          <SharedPatientContext
            hospitalSlug={hospitalSlug}
            patient={patientForContext}
            prescription={prescription}
            showRelatedLinks={true}
            primaryItems={[
              { label: "Phone", value: prescription?.patient?.phone },
              { label: "Prescriber", value: prescription?.prescribed_by_staff?.full_name ?? "Unknown" },
              { label: "Prescription Status", value: prescription?.status?.replaceAll("_", " ") ?? "—" },
              { label: "Dispensations", value: dispensations.length },
            ]}
            secondaryItems={[
              { label: "Ready Items", value: readyCount },
              { label: "Blocked Items", value: blockedCount },
              { label: "Pending Items", value: pendingCount },
              { label: "Dispensed Items", value: dispensedCount },
            ]}
          />

          {/* Prescription Timeline */}
          <TimelineFeed
            title="Prescription Timeline"
            description="Dispensing history and progress"
            events={timelineEvents}
            expandable={false}
          />

          {/* Related Actions */}
          <RelatedActionsSection
            hospitalSlug={hospitalSlug}
            patientId={prescription?.patient?.id}
            prescriptionId={prescription?.id}
            encounterId={prescription?.encounter_id ?? undefined}
            currentWorkspace="pharmacy"
            title="Continue Care"
          />

          <section className="surface-panel p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Prescription Notes"
              description="Review any doctor instructions before dispensing."
            />

            <div className="mt-4 rounded-2xl border border-border/70 bg-background/70 p-4 text-sm leading-6 text-foreground">
              {prescription?.notes ?? "—"}
            </div>
          </section>

          <section className="surface-panel p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Medication Items"
              description="Dispense item by item so shortages stay visible instead of being hidden."
            />

            <div className="mt-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="rounded-2xl border border-border/70 bg-background p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                    <div className="space-y-3">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-foreground">{item.medication_name}</p>
                        <StatusBadge
                          label={itemLabel(item)}
                          tone={itemTone(item)}
                          className="px-2.5 py-1 capitalize font-medium"
                        />
                      </div>

                      <InfoGrid
                        items={[
                          { label: "Dose", value: item.dose },
                          { label: "Frequency", value: item.frequency },
                          { label: "Duration", value: item.duration },
                          { label: "Route", value: item.route },
                          { label: "Qty Prescribed", value: item.quantity_prescribed },
                          { label: "Qty Dispensed", value: item.quantity_dispensed ?? 0 },
                          { label: "Available Stock", value: item.available_stock ?? 0 },
                          { label: "Status", value: item.status?.replaceAll("_", " ") },
                        ]}
                      />

                      <div className="rounded-2xl border border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Instructions
                        </p>
                        <p className="mt-2 leading-6 text-foreground">
                          {item.instructions ?? "—"}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button asChild>
                        <Link href={`/h/${hospitalSlug}/pharmacy/prescriptions/${prescription.id}/dispense`}>
                          Dispense Item
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
            patientId={prescription?.patient?.id}
            prescriptionId={prescription?.id}
            encounterId={prescription?.encounter_id ?? undefined}
            currentWorkspace="pharmacy"
            title="Related Workspaces"
          />

          <section className="surface-panel p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Dispensing Flow"
              description="Safe pharmacy rhythm"
            />

            <div className="mt-4 space-y-3">
              <WorkflowStepCard
                step="Step 1"
                title="Verify the prescription"
                description="Confirm patient, doctor, item list, and instructions before touching stock."
              />

              <WorkflowStepCard
                step="Step 2"
                title="Dispense by item"
                description="Handle each medication separately so partial availability stays visible and safe."
              />

              <WorkflowStepCard
                step="Step 3"
                title="Complete or leave partial"
                description="If stock is incomplete, leave the prescription partially dispensed rather than hiding the gap."
              />
            </div>
          </section>

          <section className="surface-panel p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Live Item Counts"
              description="This prescription only"
            />

            <div className="mt-4">
              <InfoGrid
                items={[
                  { label: "Pending Items", value: pendingCount },
                  { label: "Ready Items", value: readyCount },
                  { label: "Blocked Items", value: blockedCount },
                  { label: "Dispensations Recorded", value: dispensations.length },
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

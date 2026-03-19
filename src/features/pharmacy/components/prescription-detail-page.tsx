import Link from "next/link";
import { AlertTriangle, ClipboardList, Pill, UserRound } from "lucide-react";

import { WorkspacePageHeader } from "@/components/layout/workspace-page-header";
import { WorkspaceSectionHeader } from "@/components/layout/workspace-section-header";
import { WorkspaceStatCard } from "@/components/layout/workspace-stat-card";
import { WorkflowStepCard } from "@/components/layout/workflow-step-card";
import { InfoGrid } from "@/components/layout/info-grid";
import { PatientSummaryPanel } from "@/components/layout/patient-summary-panel";
import { StatusBadge } from "@/components/layout/status-badge";
import { Button } from "@/components/ui/button";

function fullName(patient: any) {
  if (!patient) return "Unknown patient";
  return [patient.first_name, patient.middle_name, patient.last_name].filter(Boolean).join(" ");
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function itemTone(item: any) {
  if (item.status === "dispensed") return "success" as const;
  if (item.has_stock === false) return "danger" as const;
  if (item.status === "partially_dispensed") return "warning" as const;
  return "neutral" as const;
}

function itemLabel(item: any) {
  if (item.has_stock === false) return "no stock";
  return item.status?.replaceAll("_", " ") ?? "pending";
}

export function PrescriptionDetailPage({
  hospitalSlug,
  prescription,
  items,
  dispensations,
}: {
  hospitalSlug: string;
  prescription: any;
  items: any[];
  dispensations: any[];
}) {
  const readyCount = items.filter((item: any) => item.has_stock !== false).length;
  const blockedCount = items.filter((item: any) => item.has_stock === false).length;
  const dispensedCount = items.filter((item: any) => item.status === "dispensed").length;
  const pendingCount = items.filter((item: any) => item.status !== "dispensed").length;

  return (
    <main className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Prescription Dispensing"
        title={fullName(prescription?.patient)}
        description="Review the full prescription, confirm item availability, and dispense medication safely without losing visibility into blocked or partial items."
        actions={
          <>
            <Button asChild>
              <Link href={`/h/${hospitalSlug}/pharmacy`}>Back to Pharmacy Queue</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/doctor`}>Doctor Workspace</Link>
            </Button>
          </>
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
          <PatientSummaryPanel
            name={fullName(prescription?.patient)}
            patientNumber={prescription?.patient?.patient_number}
            subtitle={`Received ${formatDateTime(prescription?.prescribed_at)}`}
            statusLabel={prescription?.status?.replaceAll("_", " ") ?? "active"}
            statusTone={prescription?.status === "dispensed" ? "success" : prescription?.status === "partially_dispensed" ? "warning" : "info"}
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
              {items.map((item: any) => (
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

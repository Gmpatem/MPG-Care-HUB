import Link from "next/link";
import {
  AlertTriangle,
  ClipboardList,
  Pill,
  Receipt,
} from "lucide-react";

import { WorkspaceEmptyState } from "@/components/layout/workspace-empty-state";
import { WorkspacePageHeader } from "@/components/layout/workspace-page-header";
import { WorkspaceSectionHeader } from "@/components/layout/workspace-section-header";
import { WorkspaceStatCard } from "@/components/layout/workspace-stat-card";
import { Button } from "@/components/ui/button";

function fullName(patient: any) {
  if (!patient) return "Unknown patient";
  return [patient.first_name, patient.middle_name, patient.last_name].filter(Boolean).join(" ");
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function statusTone(status: string) {
  if (status === "dispensed") return "bg-emerald-100 text-emerald-700";
  if (status === "partially_dispensed") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
}

function EmptyState({ hospitalSlug }: { hospitalSlug: string }) {
  return (
    <WorkspaceEmptyState
      title="No prescriptions received yet"
      description="Doctor prescriptions will appear here automatically after they are created from the clinical workflow."
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
    <section className="space-y-4 rounded-2xl border p-4 sm:p-5">
      <WorkspaceSectionHeader title={title} description={description} />

      {prescriptions.length === 0 ? (
        <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
          No prescriptions in this section.
        </div>
      ) : (
        <div className="space-y-4">
          {prescriptions.map((prescription) => (
            <div
              key={prescription.id}
              className="flex flex-col gap-4 rounded-xl border bg-background p-4 lg:flex-row lg:items-start lg:justify-between"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{fullName(prescription.patient)}</p>

                  <span className={`rounded-full px-2 py-0.5 text-xs ${statusTone(prescription.status)}`}>
                    {prescription.status}
                  </span>

                  <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
                    {prescription.prescribed_by_staff?.full_name ? "from doctor" : "received"}
                  </span>

                  {prescription.no_stock_count > 0 ? (
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-xs text-rose-700">
                      {prescription.no_stock_count} no stock
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs text-emerald-700">
                      stock ready
                    </span>
                  )}
                </div>

                <p className="text-sm text-muted-foreground">
                  {prescription.patient?.patient_number ?? "No patient number"} · Received {formatDateTime(prescription.prescribed_at)}
                </p>

                <p className="text-sm text-muted-foreground">
                  Prescriber: {prescription.prescribed_by_staff?.full_name ?? "Unknown"}
                </p>

                <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-4">
                  <p>Total items: {prescription.item_count}</p>
                  <p>Pending: {prescription.pending_count}</p>
                  <p>Partial: {prescription.partial_count}</p>
                  <p>Dispensed: {prescription.dispensed_count}</p>
                </div>

                <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-3">
                  <p>Ready items: {prescription.stock_ready_count}</p>
                  <p>No stock items: {prescription.no_stock_count}</p>
                  <p>Completion: {prescription.completion_ratio}%</p>
                </div>

                {prescription.notes ? (
                  <p className="text-sm text-muted-foreground">{prescription.notes}</p>
                ) : null}
              </div>

              <div className="flex gap-2">
                <Button asChild>
                  <Link href={`/h/${hospitalSlug}/pharmacy/prescriptions/${prescription.id}`}>
                    Open for Dispensing
                  </Link>
                </Button>
              </div>
            </div>
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
}: {
  hospitalSlug: string;
  hospitalName: string;
  prescriptions: any[];
}) {
  const incoming = prescriptions.filter((p) => p.workflow_bucket === "incoming");
  const partial = prescriptions.filter((p) => p.workflow_bucket === "partial");
  const completed = prescriptions.filter((p) => p.workflow_bucket === "completed");

  const activeCount = prescriptions.filter((p) => p.status === "active").length;
  const partialCount = prescriptions.filter((p) => p.status === "partially_dispensed").length;
  const dispensedCount = prescriptions.filter((p) => p.status === "dispensed").length;
  const noStockPrescriptionCount = prescriptions.filter((p) => p.no_stock_count > 0).length;

  return (
    <main className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Pharmacy Workspace"
        title={hospitalName}
        description="Receive doctor prescriptions, confirm stock availability, dispense medication safely, and track partial fulfillment without losing item-level visibility."
        actions={
          <>
            <Button asChild>
              <Link href={`/h/${hospitalSlug}/pharmacy`}>Refresh Dispensing Queue</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/doctor`}>Doctor Workspace</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WorkspaceStatCard
          title="Incoming Prescriptions"
          value={incoming.length}
          description="New prescriptions waiting for pharmacy action"
          icon={<ClipboardList className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="In Progress"
          value={partialCount}
          description="Prescriptions partially dispensed or still being prepared"
          icon={<Pill className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Completed"
          value={dispensedCount}
          description="Prescriptions fully dispensed"
          icon={<Receipt className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Stock Issues"
          value={noStockPrescriptionCount}
          description="Prescriptions blocked by unavailable medication"
          icon={<AlertTriangle className="h-4 w-4" />}
        />
      </div>

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
          <section className="rounded-2xl border p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Dispensing Flow"
              description="Use this same rhythm for every prescription."
            />

            <div className="mt-4 space-y-3">
              <div className="rounded-xl border bg-muted/40 p-4">
                <p className="text-sm font-medium">Step 1: Open the prescription</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Review prescriber details, item list, quantities, and special instructions.
                </p>
              </div>

              <div className="rounded-xl border bg-muted/40 p-4">
                <p className="text-sm font-medium">Step 2: Confirm stock by item</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Dispense what is available, flag missing stock, and keep partial fulfillment visible.
                </p>
              </div>

              <div className="rounded-xl border bg-muted/40 p-4">
                <p className="text-sm font-medium">Step 3: Complete or continue later</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Mark items as dispensed and return later if the prescription is only partially fulfilled.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Queue Summary"
              description="Live pharmacy counts"
            />

            <div className="mt-4 grid gap-3 text-sm text-muted-foreground">
              <div className="rounded-xl border bg-muted/30 p-3">Total prescriptions: {prescriptions.length}</div>
              <div className="rounded-xl border bg-muted/30 p-3">Active status: {activeCount}</div>
              <div className="rounded-xl border bg-muted/30 p-3">Workflow partial: {partial.length}</div>
              <div className="rounded-xl border bg-muted/30 p-3">Workflow completed: {completed.length}</div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

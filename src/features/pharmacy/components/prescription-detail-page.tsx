import Link from "next/link";
import { AlertTriangle, ClipboardList, Pill, UserRound } from "lucide-react";

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

function itemTone(item: any) {
  if (item.status === "dispensed") return "bg-emerald-100 text-emerald-700";
  if (item.has_stock === false) return "bg-rose-100 text-rose-700";
  if (item.status === "partially_dispensed") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
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
        <section className="space-y-4 rounded-2xl border p-4 sm:p-5">
          <WorkspaceSectionHeader
            title="Prescription Summary"
            description="Confirm patient, prescriber, and timing before dispensing."
          />

          <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2">
            <div className="rounded-xl border bg-muted/30 p-4">
              <p className="font-medium text-foreground">{fullName(prescription?.patient)}</p>
              <p className="mt-1">{prescription?.patient?.patient_number ?? "No patient number"}</p>
              <p className="mt-1">Phone: {prescription?.patient?.phone ?? "—"}</p>
            </div>

            <div className="rounded-xl border bg-muted/30 p-4">
              <p>Prescriber: {prescription?.prescribed_by_staff?.full_name ?? "Unknown"}</p>
              <p className="mt-1">Prescribed at: {formatDateTime(prescription?.prescribed_at)}</p>
              <p className="mt-1">Status: {prescription?.status ?? "—"}</p>
            </div>
          </div>

          <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
            Notes: {prescription?.notes ?? "—"}
          </div>

          <WorkspaceSectionHeader
            title="Medication Items"
            description="Dispense item by item so shortages stay visible instead of being hidden."
          />

          <div className="space-y-4">
            {items.map((item: any) => (
              <div key={item.id} className="rounded-xl border bg-background p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{item.medication_name}</p>
                      <span className={`rounded-full px-2 py-0.5 text-xs ${itemTone(item)}`}>
                        {item.has_stock === false ? "no stock" : item.status}
                      </span>
                    </div>

                    <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
                      <p>Dose: {item.dose ?? "—"}</p>
                      <p>Frequency: {item.frequency ?? "—"}</p>
                      <p>Duration: {item.duration ?? "—"}</p>
                      <p>Route: {item.route ?? "—"}</p>
                    </div>

                    <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-3">
                      <p>Quantity prescribed: {item.quantity_prescribed ?? "—"}</p>
                      <p>Quantity dispensed: {item.quantity_dispensed ?? 0}</p>
                      <p>Available stock: {item.available_stock ?? 0}</p>
                    </div>

                    <p className="text-sm text-muted-foreground">
                      Instructions: {item.instructions ?? "—"}
                    </p>
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

        <div className="space-y-6">
          <section className="rounded-2xl border p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Dispensing Flow"
              description="Safe pharmacy rhythm"
            />

            <div className="mt-4 space-y-3">
              <div className="rounded-xl border bg-muted/40 p-4">
                <p className="text-sm font-medium">Step 1: Verify the prescription</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Confirm patient, doctor, item list, and instructions before touching stock.
                </p>
              </div>

              <div className="rounded-xl border bg-muted/40 p-4">
                <p className="text-sm font-medium">Step 2: Dispense by item</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Handle each medication separately so partial availability stays visible and safe.
                </p>
              </div>

              <div className="rounded-xl border bg-muted/40 p-4">
                <p className="text-sm font-medium">Step 3: Complete or leave partial</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  If stock is incomplete, leave the prescription partially dispensed rather than hiding the gap.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border p-4 sm:p-5 text-sm text-muted-foreground">
            <WorkspaceSectionHeader
              title="Live Item Counts"
              description="This prescription only"
            />

            <div className="mt-4 grid gap-3">
              <div className="rounded-xl border bg-muted/30 p-3">Pending items: {pendingCount}</div>
              <div className="rounded-xl border bg-muted/30 p-3">Ready items: {readyCount}</div>
              <div className="rounded-xl border bg-muted/30 p-3">Blocked items: {blockedCount}</div>
              <div className="rounded-xl border bg-muted/30 p-3">Dispensations recorded: {dispensations.length}</div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

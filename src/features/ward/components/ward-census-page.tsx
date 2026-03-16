import Link from "next/link";
import { BedDouble, Building2, ClipboardCheck, Users } from "lucide-react";

import { WorkspaceEmptyState } from "@/components/layout/workspace-empty-state";
import { WorkspacePageHeader } from "@/components/layout/workspace-page-header";
import { WorkspaceSectionHeader } from "@/components/layout/workspace-section-header";
import { WorkspaceStatCard } from "@/components/layout/workspace-stat-card";
import { Button } from "@/components/ui/button";

function fullName(patient: any) {
  if (!patient) return "Unknown patient";
  return [patient.first_name, patient.middle_name, patient.last_name].filter(Boolean).join(" ");
}

function statusTone(status: string) {
  if (status === "occupied") return "bg-emerald-100 text-emerald-700";
  if (status === "reserved") return "bg-amber-100 text-amber-700";
  return "bg-slate-100 text-slate-700";
}

export function WardCensusPage({
  hospitalSlug,
  hospitalName,
  wards,
  admissions,
}: {
  hospitalSlug: string;
  hospitalName: string;
  wards: any[];
  admissions: any[];
}) {
  const totalBeds = wards.reduce((sum, ward) => sum + (ward.total_beds ?? 0), 0);
  const occupiedBeds = wards.reduce((sum, ward) => sum + (ward.occupied_beds ?? 0), 0);
  const freeBeds = wards.reduce((sum, ward) => sum + (ward.available_beds ?? 0), 0);
  const activeAdmissions =
    admissions?.length ??
    wards.reduce((sum, ward) => sum + (ward.active_admissions ?? 0), 0);

  return (
    <main className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Ward Census"
        title={hospitalName}
        description="View ward occupancy, bed usage, and current inpatient placement at a glance so the team can assign and release beds confidently."
        actions={
          <>
            <Button asChild>
              <Link href={`/h/${hospitalSlug}/ward`}>Ward Workspace</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/ward/discharges`}>Discharge Queue</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/ward/config`}>Ward Setup</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WorkspaceStatCard
          title="Configured Beds"
          value={totalBeds}
          description="Beds currently configured across wards"
          icon={<BedDouble className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Occupied Beds"
          value={occupiedBeds}
          description="Beds currently assigned to active admissions"
          icon={<Users className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Available Beds"
          value={freeBeds}
          description="Beds ready for new assignment"
          icon={<Building2 className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Discharge Pressure"
          value={wards.reduce((sum, ward) => sum + (ward.discharge_requested_count ?? 0), 0)}
          description="Beds likely to free up after discharge handling"
          icon={<ClipboardCheck className="h-4 w-4" />}
        />
      </div>

      {wards.length === 0 ? (
        <WorkspaceEmptyState
          title="No census data available yet"
          description="Create wards and beds first, then active admissions will appear here as the ward grows."
          action={
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/ward/config`}>Open Ward Setup</Link>
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {wards.map((ward) => (
            <section key={ward.id} className="space-y-4 rounded-2xl border p-4 sm:p-5">
              <WorkspaceSectionHeader
                title={ward.name}
                description={`${ward.code ?? "No code"} · ${ward.ward_type ?? "general"} · ${ward.active_admissions ?? 0} active admissions`}
              />

              <div className="grid gap-3 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
                <div className="rounded-xl border bg-muted/30 p-3">Total beds: {ward.total_beds ?? 0}</div>
                <div className="rounded-xl border bg-muted/30 p-3">Occupied: {ward.occupied_beds ?? 0}</div>
                <div className="rounded-xl border bg-muted/30 p-3">Available: {ward.available_beds ?? 0}</div>
                <div className="rounded-xl border bg-muted/30 p-3">Discharge requested: {ward.discharge_requested_count ?? 0}</div>
              </div>

              {(ward.beds ?? []).length === 0 ? (
                <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                  No bed records available for this ward.
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                  {ward.beds.map((bed: any) => (
                    <div key={bed.id} className="rounded-xl border bg-background p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">Bed {bed.bed_number}</p>
                        <span className={`rounded-full px-2 py-0.5 text-xs ${statusTone(bed.status)}`}>
                          {bed.status}
                        </span>
                      </div>

                      {bed.current_admission ? (
                        <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                          <p>Patient: {fullName(bed.current_admission.patient)}</p>
                          <p>Patient no: {bed.current_admission.patient?.patient_number ?? "—"}</p>
                          <p>Doctor: {bed.current_admission.admitting_doctor?.full_name ?? "Unknown"}</p>

                          {bed.current_admission.discharge_requested ? (
                            <p className="font-medium text-amber-700">Discharge requested</p>
                          ) : null}

                          <div className="pt-2">
                            <Button asChild size="sm">
                              <Link href={`/h/${hospitalSlug}/ward/admissions/${bed.current_admission.id}`}>
                                Open Chart
                              </Link>
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3 text-sm text-muted-foreground">
                          No patient currently assigned.
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          ))}

          <section className="rounded-2xl border p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Census Summary"
              description="Current inpatient placement across all wards"
            />

            <div className="mt-4 grid gap-3 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-xl border bg-muted/30 p-3">Active admissions: {activeAdmissions}</div>
              <div className="rounded-xl border bg-muted/30 p-3">Occupied beds: {occupiedBeds}</div>
              <div className="rounded-xl border bg-muted/30 p-3">Free beds: {freeBeds}</div>
              <div className="rounded-xl border bg-muted/30 p-3">Total beds: {totalBeds}</div>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

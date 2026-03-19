import Link from "next/link";
import { BedDouble, Building2, ClipboardCheck, Users } from "lucide-react";

import { StatusBadge } from "@/components/layout/status-badge";
import { WorkspaceEmptyState } from "@/components/layout/workspace-empty-state";
import { WorkspacePageHeader } from "@/components/layout/workspace-page-header";
import { WorkspaceSectionHeader } from "@/components/layout/workspace-section-header";
import { WorkspaceStatCard } from "@/components/layout/workspace-stat-card";
import { Button } from "@/components/ui/button";

export function WardCensusPage({
  hospitalSlug,
  wards,
  stats,
}: {
  hospitalSlug: string;
  wards: any[];
  stats: {
    total_wards: number;
    total_beds: number;
    occupied_beds: number;
    available_beds: number;
    active_admissions: number;
    discharge_requested: number;
  };
}) {
  return (
    <main className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Ward Census"
        title="Ward Census"
        description="Track occupancy, bed availability, and discharge pressure across every ward without leaving the hospital workflow."
        actions={
          <>
            <Button asChild>
              <Link href={`/h/${hospitalSlug}/ward`}>Ward Workspace</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/ward/discharges`}>Discharge Queue</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WorkspaceStatCard
          title="Wards"
          value={stats.total_wards}
          description="Configured inpatient areas"
          icon={<Building2 className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Total Beds"
          value={stats.total_beds}
          description="Configured ward capacity"
          icon={<BedDouble className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Occupied Beds"
          value={stats.occupied_beds}
          description={`${stats.available_beds} still available`}
          icon={<Users className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Discharge Requested"
          value={stats.discharge_requested}
          description="Cases needing ward-side action"
          icon={<ClipboardCheck className="h-4 w-4" />}
        />
      </div>

      <section className="surface-panel p-4 sm:p-5">
        <WorkspaceSectionHeader
          title="Ward Census Detail"
          description="Use this view to understand bed pressure before new admissions or transfers."
        />

        {wards.length === 0 ? (
          <div className="mt-4">
            <WorkspaceEmptyState
              title="No wards available yet"
              description="Once wards and beds are configured, census visibility will appear here."
            />
          </div>
        ) : (
          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            {wards.map((ward) => (
              <section key={ward.id} className="rounded-2xl border border-border/70 bg-background p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-foreground">{ward.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {ward.code ?? "No code"} · {ward.ward_type ?? "general"}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <StatusBadge
                      label={`${ward.active_admissions} admissions`}
                      tone="info"
                      className="px-2.5 py-1 font-medium"
                    />
                    {ward.discharge_requested_count > 0 ? (
                      <StatusBadge
                        label={`${ward.discharge_requested_count} discharge requested`}
                        tone="warning"
                        className="px-2.5 py-1 font-medium"
                      />
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/70 bg-background/70 p-3 text-sm text-muted-foreground">
                    Total beds
                    <div className="mt-1 text-lg font-semibold text-foreground">{ward.total_beds}</div>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/70 p-3 text-sm text-muted-foreground">
                    Occupied beds
                    <div className="mt-1 text-lg font-semibold text-foreground">{ward.occupied_beds}</div>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/70 p-3 text-sm text-muted-foreground">
                    Available beds
                    <div className="mt-1 text-lg font-semibold text-foreground">{ward.available_beds}</div>
                  </div>
                  <div className="rounded-2xl border border-border/70 bg-background/70 p-3 text-sm text-muted-foreground">
                    Occupancy
                    <div className="mt-1 text-lg font-semibold text-foreground">
                      {ward.total_beds > 0 ? Math.round((ward.occupied_beds / ward.total_beds) * 100) : 0}%
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/h/${hospitalSlug}/ward/admissions`}>Admissions</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href={`/h/${hospitalSlug}/ward`}>Open Ward</Link>
                  </Button>
                </div>
              </section>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

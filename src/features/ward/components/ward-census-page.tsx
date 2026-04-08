import Link from "next/link";
import { BedDouble, Building2, ClipboardCheck, Users } from "lucide-react";

import { StatusBadge } from "@/components/layout/status-badge";
import { DetailPeekCard } from "@/components/layout/detail-peek-card";
import { PeekSummary } from "@/components/layout/peek-summary";
import { WorkspaceEmptyState } from "@/components/layout/workspace-empty-state";
import { WorkspacePageHeader } from "@/components/layout/workspace-page-header";
import { WorkspaceSectionHeader } from "@/components/layout/workspace-section-header";
import { WorkspaceStatCard } from "@/components/layout/workspace-stat-card";
import { Button } from "@/components/ui/button";

function WardCensusCard({
  hospitalSlug,
  ward,
}: {
  hospitalSlug: string;
  ward: any;
}) {
  const badges = [];
  if (ward.active_admissions > 0) {
    badges.push({ label: `${ward.active_admissions} admissions`, tone: "info" as const });
  }
  if (ward.discharge_requested_count > 0) {
    badges.push({ label: `${ward.discharge_requested_count} discharge requested`, tone: "warning" as const });
  }

  const occupancyRate = ward.total_beds > 0 
    ? Math.round((ward.occupied_beds / ward.total_beds) * 100) 
    : 0;

  const occupancyTone = occupancyRate > 90 
    ? "danger" as const 
    : occupancyRate > 75 
    ? "warning" as const 
    : "success" as const;

  return (
    <DetailPeekCard
      id={ward.id}
      title={ward.name}
      subtitle={`${ward.code ?? "No code"} · ${ward.ward_type ?? "general"}`}
      href={`/h/${hospitalSlug}/ward`}
      badges={badges}
      meta={[
        { label: "Total beds", value: ward.total_beds },
        { label: "Occupied", value: ward.occupied_beds },
        { label: "Available", value: ward.available_beds },
        { label: "Occupancy", value: `${occupancyRate}%` },
      ]}
      expandable
      fullPageLabel="Open Ward"
      primaryAction={{
        label: "View Ward",
        href: `/h/${hospitalSlug}/ward`,
      }}
      secondaryAction={{
        label: "Admissions",
        href: `/h/${hospitalSlug}/ward/admissions`,
      }}
    >
      {/* Expanded content shows detailed breakdown */}
      <div className="space-y-3">
        <PeekSummary
          title="Bed Status Breakdown"
          items={[
            { label: "Total Beds", value: ward.total_beds },
            { label: "Occupied", value: ward.occupied_beds },
            { label: "Available", value: ward.available_beds },
            { label: "Maintenance", value: ward.maintenance_beds ?? 0 },
            { label: "Active Admissions", value: ward.active_admissions ?? 0, highlight: true },
            { label: "Discharge Requested", value: ward.discharge_requested_count ?? 0, highlight: (ward.discharge_requested_count ?? 0) > 0 },
          ]}
          columns={3}
          density="compact"
          bordered={false}
        />
        
        {/* Occupancy indicator */}
        <div className="rounded-lg border bg-muted/30 p-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Occupancy Rate</span>
            <StatusBadge 
              label={`${occupancyRate}%`} 
              tone={occupancyTone}
              className="text-xs"
            />
          </div>
          <div className="mt-2 h-2 rounded-full bg-muted overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all ${
                occupancyRate > 90 
                  ? "bg-red-500" 
                  : occupancyRate > 75 
                  ? "bg-amber-500" 
                  : "bg-emerald-500"
              }`}
              style={{ width: `${Math.min(occupancyRate, 100)}%` }}
            />
          </div>
        </div>
      </div>
    </DetailPeekCard>
  );
}

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
              <WardCensusCard
                key={ward.id}
                hospitalSlug={hospitalSlug}
                ward={ward}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

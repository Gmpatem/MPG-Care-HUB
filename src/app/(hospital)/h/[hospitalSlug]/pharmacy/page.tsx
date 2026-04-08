import Link from "next/link";
import { Button } from "@/components/ui/button";
import { WorkspacePageHeader } from "@/components/layout/workspace-page-header";
import { WorkspaceSectionHeader } from "@/components/layout/workspace-section-header";
import { WorkspaceEmptyState } from "@/components/layout/workspace-empty-state";
import { StatusBadge } from "@/components/layout/status-badge";
import {
  WorkspacePageShell,
  WorkspaceTwoColumnLayout,
} from "@/components/layout/workspace-page-shell";
import { getPharmacyDashboardData } from "@/features/pharmacy/server/get-pharmacy-dashboard-data";
import { PharmacyWorkflowCard } from "@/features/pharmacy/components/pharmacy-workflow-card";

type Props = {
  params: Promise<{
    hospitalSlug: string;
  }>;
};

function formatDateTime(value: string) {
  return new Date(value).toLocaleString();
}

function PrescriptionStatusBadge({ status, stockReady, stockBlocked }: { 
  status: string; 
  stockReady?: boolean;
  stockBlocked?: boolean;
}) {
  if (stockBlocked) {
    return <StatusBadge label="stock blocked" tone="warning" className="text-xs" />;
  }
  if (stockReady) {
    return <StatusBadge label="ready" tone="success" className="text-xs" />;
  }
  return <StatusBadge label={status} tone="neutral" className="text-xs capitalize" />;
}

export default async function PharmacyDashboardRoute({ params }: Props) {
  const { hospitalSlug } = await params;
  const data = await getPharmacyDashboardData(hospitalSlug);

  return (
    <WorkspacePageShell>
      {/* Page Header */}
      <WorkspacePageHeader
        eyebrow="Pharmacy Workspace"
        title="Pharmacy"
        description="Prescription queue, stock readiness, and dispensing workflow. Review incoming prescriptions, verify stock availability, and dispense medications safely."
        primaryAction={
          <Button asChild>
            <Link href={`/h/${hospitalSlug}/pharmacy/prescriptions`}>Review Queue</Link>
          </Button>
        }
        secondaryActions={
          <>
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/admin/medications`}>Medications</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/admin/pharmacy-stock`}>Stock</Link>
            </Button>
          </>
        }
      />

      {/* Workflow Stats */}
      <PharmacyWorkflowCard
        hospitalSlug={hospitalSlug}
        stats={data.stats}
      />

      {/* Prescription Queue */}
      <div className="space-y-4 rounded-2xl border p-4 sm:p-5">
        <WorkspaceSectionHeader
          title="Prescription Queue"
          description="Current prescriptions entering the pharmacy workflow"
          actions={
            <Button asChild variant="outline" size="sm">
              <Link href={`/h/${hospitalSlug}/pharmacy/prescriptions`}>View All</Link>
            </Button>
          }
        />

        {data.rows.length === 0 ? (
          <WorkspaceEmptyState
            variant="queue"
            title="No prescriptions in queue"
            description="New prescriptions will appear here when doctors send them from encounters."
          />
        ) : (
          <div className="space-y-3">
            {data.rows.map((row) => (
              <div
                key={row.id}
                className="flex flex-col gap-4 rounded-xl border bg-background p-4 lg:flex-row lg:items-start lg:justify-between"
              >
                <div className="min-w-0 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-medium">{row.patient_full_name}</h3>
                    <PrescriptionStatusBadge 
                      status={row.status} 
                      stockReady={row.stock_ready}
                      stockBlocked={row.stock_blocked}
                    />
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {row.patient_number ?? "No patient number"} · {row.item_count} items · Prescribed {formatDateTime(row.prescribed_at)}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/h/${hospitalSlug}/pharmacy/prescriptions/${row.id}`}>
                      Open Prescription
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </WorkspacePageShell>
  );
}

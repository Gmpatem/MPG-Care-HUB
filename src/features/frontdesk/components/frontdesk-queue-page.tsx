"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ClipboardList, UserPlus, Users } from "lucide-react";

import { QueueItemCard } from "@/components/layout/queue-item-card";
import { WorkspaceEmptyState } from "@/components/layout/workspace-empty-state";
import { WorkspacePageHeader } from "@/components/layout/workspace-page-header";
import { WorkspaceSectionHeader } from "@/components/layout/workspace-section-header";
import { WorkspaceStatCard } from "@/components/layout/workspace-stat-card";
import { ListFilterBar } from "@/components/layout/list-filter-bar";
import { SavedViewTabs } from "@/components/layout/saved-view-tabs";
import { Button } from "@/components/ui/button";
import { getQueueItemReadiness } from "@/lib/ui/task-state";

function fullName(row: any) {
  return [row.first_name, row.middle_name, row.last_name].filter(Boolean).join(" ");
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function statusTone(status: string | null) {
  switch (status) {
    case "checked_in":
      return "info" as const;
    case "completed":
      return "success" as const;
    case "cancelled":
      return "danger" as const;
    default:
      return "neutral" as const;
  }
}

function FrontdeskQueueItem({
  hospitalSlug,
  row,
}: {
  hospitalSlug: string;
  row: any;
}) {
  const readiness = getQueueItemReadiness(row.status);

  const badges = [];
  if (row.visit_type) {
    badges.push({ label: row.visit_type, tone: "neutral" as const });
  }

  return (
    <QueueItemCard
      id={row.appointment_id}
      title={fullName(row) || "Unknown patient"}
      subtitle={`${row.patient_number ?? "No patient number"} · Queue #${row.queue_number ?? "—"}`}
      readiness={readiness}
      badges={badges}
      meta={[
        { label: "Scheduled", value: formatDateTime(row.scheduled_at) },
        { label: "Check-in", value: formatDateTime(row.check_in_at) },
        { label: "Doctor", value: row.staff_name ?? "Unassigned" },
        { label: "Reason", value: row.reason ?? "—" },
      ]}
      actions={{
        primary: {
          label: "Open Visit",
          href: `/h/${hospitalSlug}/doctor/appointments/${row.appointment_id}/open`,
        },
        secondary: [
          {
            label: "Patients",
            href: `/h/${hospitalSlug}/patients`,
            variant: "outline",
          },
        ],
      }}
    />
  );
}

export function FrontdeskQueuePage({
  hospitalSlug,
  hospitalName,
  rows,
}: {
  hospitalSlug: string;
  hospitalName: string;
  rows: any[];
}) {
  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeView, setActiveView] = useState("all");

  // Apply view preset
  const effectiveStatusFilter = activeView !== "all" ? activeView : statusFilter;

  // Filter rows
  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        row.first_name?.toLowerCase().includes(searchLower) ||
        row.last_name?.toLowerCase().includes(searchLower) ||
        row.patient_number?.toLowerCase().includes(searchLower) ||
        row.staff_name?.toLowerCase().includes(searchLower);

      // Status filter
      const matchesStatus =
        effectiveStatusFilter === "all" ||
        row.status === effectiveStatusFilter ||
        (effectiveStatusFilter === "unassigned" && !row.staff_name);

      return matchesSearch && matchesStatus;
    });
  }, [rows, searchQuery, effectiveStatusFilter]);

  const checkedInCount = rows.filter((row) => row.status === "checked_in").length;
  const scheduledCount = rows.filter((row) => row.status === "scheduled").length;
  const unassignedCount = rows.filter((row) => !row.staff_name).length;

  // View tabs
  const views = [
    { id: "all", label: "All", count: rows.length },
    { id: "checked_in", label: "Checked In", count: checkedInCount },
    { id: "scheduled", label: "Scheduled", count: scheduledCount },
    { id: "unassigned", label: "Unassigned", count: unassignedCount },
  ];

  // Status options
  const statusOptions = [
    { label: "Checked In", value: "checked_in" },
    { label: "Scheduled", value: "scheduled" },
    { label: "Unassigned", value: "unassigned" },
  ];

  // Reset
  const handleReset = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setActiveView("all");
  };

  const hasActiveFilters = searchQuery !== "" || statusFilter !== "all" || activeView !== "all";

  return (
    <main className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Front Desk Queue"
        title="Front Desk Queue"
        description="Manage arrivals, track queue order, and move patients into the next stage of care with less confusion at the intake desk."
        actions={
          <>
            <Button asChild>
              <Link href={`/h/${hospitalSlug}/frontdesk`}>Front Desk Dashboard</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/frontdesk/intake`}>Open Intake</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WorkspaceStatCard
          title="Queue Total"
          value={rows.length}
          description="Patients currently visible to front desk"
          icon={<ClipboardList className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Checked In"
          value={checkedInCount}
          description="Patients already arrived and marked present"
          icon={<Users className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Scheduled"
          value={scheduledCount}
          description="Patients still waiting to arrive or be checked in"
          icon={<UserPlus className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Unassigned"
          value={unassignedCount}
          description="Visits without doctor assignment yet"
          icon={<Users className="h-4 w-4" />}
        />
      </div>

      <section className="surface-panel p-4 sm:p-5">
        <WorkspaceSectionHeader
          title="Today’s Queue"
          description="Scan by queue number first, then confirm patient identity and doctor assignment."
          actions={
            <Button asChild variant="outline" size="sm">
              <Link href={`/h/${hospitalSlug}/appointments`}>Appointments</Link>
            </Button>
          }
        />

        {/* Quick Views */}
        <SavedViewTabs
          views={views}
          activeView={activeView}
          onViewChange={(viewId) => {
            setActiveView(viewId);
            if (viewId !== "all") {
              setStatusFilter("all");
            }
          }}
          variant="pills"
        />

        {/* Filter Bar */}
        <ListFilterBar
          searchValue={searchQuery}
          searchPlaceholder="Search by patient name, ID, or doctor..."
          onSearchChange={setSearchQuery}
          statusOptions={statusOptions}
          statusValue={statusFilter}
          onStatusChange={(value) => {
            setStatusFilter(value);
            setActiveView("all");
          }}
          hasActiveFilters={hasActiveFilters}
          onReset={handleReset}
          resultCount={filteredRows.length}
          resultLabel="patients"
        />

        {rows.length === 0 ? (
          <div className="mt-4">
            <WorkspaceEmptyState
              title="No patients in the queue right now"
              description="Scheduled and checked-in visits will appear here automatically as front desk activity begins."
            />
          </div>
        ) : filteredRows.length === 0 ? (
          <div className="mt-4">
            <WorkspaceEmptyState
              variant="search"
              title="No matching patients"
              description="Try adjusting your search or filter criteria."
              action={
                <Button variant="outline" onClick={handleReset}>
                  Clear filters
                </Button>
              }
            />
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            {filteredRows.map((row) => (
              <FrontdeskQueueItem
                key={row.appointment_id}
                hospitalSlug={hospitalSlug}
                row={row}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

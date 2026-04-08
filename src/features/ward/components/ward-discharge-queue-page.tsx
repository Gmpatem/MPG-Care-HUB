"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ClipboardCheck, FileCheck2, ListChecks, TriangleAlert } from "lucide-react";

import { WorkspaceEmptyState } from "@/components/layout/workspace-empty-state";
import { WorkspacePageHeader } from "@/components/layout/workspace-page-header";
import { WorkspaceSectionHeader } from "@/components/layout/workspace-section-header";
import { WorkspaceStatCard } from "@/components/layout/workspace-stat-card";
import { QueueItemCard } from "@/components/layout/queue-item-card";
import { ListFilterBar } from "@/components/layout/list-filter-bar";
import { SavedViewTabs } from "@/components/layout/saved-view-tabs";
import { Button } from "@/components/ui/button";
import { getDischargeReadiness } from "@/lib/ui/task-state";

function fullName(patient: any) {
  if (!patient) return "Unknown patient";
  return [patient.first_name, patient.middle_name, patient.last_name].filter(Boolean).join(" ");
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function checklistProgress(admission: any) {
  const total = admission.checklist_total ?? 0;
  const completed = admission.checklist_completed ?? 0;
  return `${completed}/${total}`;
}

function DischargeQueueItem({
  hospitalSlug,
  admission,
}: {
  hospitalSlug: string;
  admission: any;
}) {
  const readiness = getDischargeReadiness(
    admission.checklist_ready ?? false,
    admission.discharge_requested ?? false,
    admission.checklist_completed ?? 0,
    admission.checklist_total ?? 0,
    admission.checklist_required_completed ?? admission.checklist_completed ?? 0,
    admission.checklist_required_total ?? admission.checklist_total ?? 0
  );

  const badges = [
    { label: "Discharge requested", tone: "warning" as const },
  ];

  return (
    <QueueItemCard
      id={admission.id}
      title={fullName(admission.patient)}
      subtitle={`${admission.patient?.patient_number ?? "No patient number"} · Ward ${admission.ward?.name ?? "—"} · Bed ${admission.bed?.bed_number ?? "Unassigned"}`}
      readiness={readiness}
      badges={badges}
      meta={[
        { label: "Requested", value: formatDateTime(admission.discharge_requested_at) },
        { label: "Admitted", value: formatDateTime(admission.admitted_at) },
        { label: "Doctor", value: admission.admitting_doctor?.full_name ?? "Unknown" },
        { label: "Checklist", value: checklistProgress(admission) },
      ]}
      actions={{
        primary: {
          label: "Open Discharge Chart",
          href: `/h/${hospitalSlug}/ward/admissions/${admission.id}`,
        },
        secondary: [
          {
            label: "Census",
            href: `/h/${hospitalSlug}/census`,
            variant: "outline",
          },
        ],
      }}
    />
  );
}

export function WardDischargeQueuePage({
  hospitalSlug,
  hospitalName,
  admissions,
}: {
  hospitalSlug: string;
  hospitalName: string;
  admissions: any[];
}) {
  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [readinessFilter, setReadinessFilter] = useState("all");
  const [activeView, setActiveView] = useState("all");

  // Apply view preset
  const effectiveReadinessFilter = activeView !== "all" ? activeView : readinessFilter;

  // Filter admissions
  const filteredAdmissions = useMemo(() => {
    return admissions.filter((admission) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        admission.patient?.first_name?.toLowerCase().includes(searchLower) ||
        admission.patient?.last_name?.toLowerCase().includes(searchLower) ||
        admission.patient?.patient_number?.toLowerCase().includes(searchLower) ||
        admission.ward?.name?.toLowerCase().includes(searchLower);

      // Readiness filter
      const matchesReadiness =
        effectiveReadinessFilter === "all" ||
        (effectiveReadinessFilter === "ready" && admission.checklist_ready === true) ||
        (effectiveReadinessFilter === "blocked" && admission.checklist_ready !== true);

      return matchesSearch && matchesReadiness;
    });
  }, [admissions, searchQuery, effectiveReadinessFilter]);

  const readyCount = admissions.filter((row) => row.checklist_ready === true).length;
  const blockedCount = admissions.filter((row) => row.checklist_ready !== true).length;

  // View tabs
  const views = [
    { id: "all", label: "All", count: admissions.length },
    { id: "ready", label: "Ready", count: readyCount },
    { id: "blocked", label: "Blocked", count: blockedCount },
  ];

  // Readiness options
  const readinessOptions = [
    { label: "Ready to discharge", value: "ready" },
    { label: "Blocked", value: "blocked" },
  ];

  // Reset
  const handleReset = () => {
    setSearchQuery("");
    setReadinessFilter("all");
    setActiveView("all");
  };

  const hasActiveFilters = searchQuery !== "" || readinessFilter !== "all" || activeView !== "all";

  return (
    <main className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Discharge Queue"
        title={hospitalName}
        description="Review discharge-requested admissions first, confirm checklist completion, and clear patients out of ward flow safely."
        actions={
          <>
            <Button asChild>
              <Link href={`/h/${hospitalSlug}/ward`}>Ward Workspace</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/census`}>Open Census</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WorkspaceStatCard
          title="Discharge Requested"
          value={admissions.length}
          description="Admissions already marked for discharge handling"
          icon={<ClipboardCheck className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Checklist Ready"
          value={readyCount}
          description="Admissions that can move forward safely"
          icon={<FileCheck2 className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Still Blocked"
          value={blockedCount}
          description="Admissions missing discharge requirements"
          icon={<TriangleAlert className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Queue Reviewed"
          value={readyCount + blockedCount}
          description="Current discharge queue load"
          icon={<ListChecks className="h-4 w-4" />}
        />
      </div>

      {/* Quick Views */}
      <SavedViewTabs
        views={views}
        activeView={activeView}
        onViewChange={(viewId) => {
          setActiveView(viewId);
          if (viewId !== "all") {
            setReadinessFilter("all");
          }
        }}
        variant="pills"
      />

      {/* Filter Bar */}
      <ListFilterBar
        searchValue={searchQuery}
        searchPlaceholder="Search by patient name, ID, or ward..."
        onSearchChange={setSearchQuery}
        statusOptions={readinessOptions}
        statusValue={readinessFilter}
        statusLabel="Readiness"
        onStatusChange={(value) => {
          setReadinessFilter(value);
          setActiveView("all");
        }}
        hasActiveFilters={hasActiveFilters}
        onReset={handleReset}
        resultCount={filteredAdmissions.length}
        resultLabel="patients"
      />

      {admissions.length === 0 ? (
        <WorkspaceEmptyState
          title="No discharge requests yet"
          description="Patients marked for discharge by the care team will appear here automatically."
          action={
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/ward`}>Return to Ward Workspace</Link>
            </Button>
          }
        />
      ) : filteredAdmissions.length === 0 ? (
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
      ) : (
        <section className="space-y-4 rounded-2xl border p-4 sm:p-5">
          <WorkspaceSectionHeader
            title="Patients Awaiting Discharge"
            description="Handle patients with completed checklists first so beds are released quickly."
          />

          <div className="space-y-4">
            {filteredAdmissions.map((admission) => (
              <DischargeQueueItem
                key={admission.id}
                hospitalSlug={hospitalSlug}
                admission={admission}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

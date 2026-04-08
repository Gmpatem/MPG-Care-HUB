"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { FileText, Receipt, Wallet, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WorkspaceEmptyState } from "@/components/layout/workspace-empty-state";
import { WorkspacePageHeader } from "@/components/layout/workspace-page-header";
import { WorkspaceSectionHeader } from "@/components/layout/workspace-section-header";
import { WorkspaceStatCard } from "@/components/layout/workspace-stat-card";
import { DetailPeekCard } from "@/components/layout/detail-peek-card";
import { PeekSummary, CompactPeek } from "@/components/layout/peek-summary";
import { ListFilterBar } from "@/components/layout/list-filter-bar";
import { SavedViewTabs } from "@/components/layout/saved-view-tabs";
import { getInvoiceReadiness } from "@/lib/ui/task-state";

function fullName(patient: any) {
  if (!patient) return "Unknown patient";
  return [patient.first_name, patient.middle_name, patient.last_name].filter(Boolean).join(" ");
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function formatMoney(value: any) {
  return Number(value ?? 0).toFixed(2);
}

function InvoiceListItem({
  hospitalSlug,
  invoice,
}: {
  hospitalSlug: string;
  invoice: any;
}) {
  const readiness = getInvoiceReadiness(
    Number(invoice.total_amount ?? 0),
    Number(invoice.amount_paid ?? 0),
    Number(invoice.balance_due ?? 0)
  );

  const balance = Number(invoice.balance_due ?? 0);
  const statusBadge = balance > 0 
    ? { label: "unpaid", tone: "warning" as const }
    : { label: "paid", tone: "success" as const };

  return (
    <DetailPeekCard
      id={invoice.id}
      title={invoice.invoice_number}
      subtitle={`${fullName(invoice.patient)} · ${invoice.patient?.patient_number ?? "No patient number"}`}
      href={`/h/${hospitalSlug}/billing/invoices/${invoice.id}`}
      readiness={readiness}
      badges={[statusBadge]}
      meta={[
        { label: "Issued", value: formatDateTime(invoice.issued_at) },
        { label: "Total", value: formatMoney(invoice.total_amount) },
        { label: "Paid", value: formatMoney(invoice.amount_paid) },
        { label: "Balance", value: formatMoney(invoice.balance_due), highlight: balance > 0 },
      ]}
      expandable
      fullPageLabel="Open Invoice"
      primaryAction={
        balance > 0
          ? {
              label: "Record Payment",
              href: `/h/${hospitalSlug}/billing/payments/new?invoice=${invoice.id}`,
            }
          : {
              label: "View Invoice",
              href: `/h/${hospitalSlug}/billing/invoices/${invoice.id}`,
            }
      }
      secondaryAction={{
        label: "Print",
        href: `/h/${hospitalSlug}/billing/invoices/${invoice.id}`,
      }}
    >
      {/* Expanded content shows invoice breakdown */}
      <div className="space-y-3">
        <PeekSummary
          title="Invoice Summary"
          items={[
            { label: "Subtotal", value: formatMoney(invoice.subtotal_amount) },
            { label: "Discount", value: formatMoney(invoice.discount_amount) },
            { label: "Tax", value: formatMoney(invoice.tax_amount) },
            { label: "Total", value: formatMoney(invoice.total_amount), highlight: true },
            { label: "Paid", value: formatMoney(invoice.amount_paid) },
            { label: "Balance", value: formatMoney(invoice.balance_due), highlight: balance > 0 },
          ]}
          columns={3}
          density="compact"
          bordered={false}
        />
        {invoice.notes && (
          <div className="rounded-lg border bg-muted/30 p-3">
            <p className="text-xs font-medium text-muted-foreground">Notes</p>
            <p className="mt-1 text-sm text-foreground">{invoice.notes}</p>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm">
          <CompactPeek
            items={[
              { label: "Status", value: invoice.status ?? "draft" },
              { label: "Items", value: invoice.items?.length ?? 0 },
              { label: "Due", value: formatDateTime(invoice.due_at) },
            ]}
          />
        </div>
      </div>
    </DetailPeekCard>
  );
}

export function InvoicesPage({
  hospitalSlug,
  invoices,
}: {
  hospitalSlug: string;
  invoices: any[];
}) {
  // Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [activeView, setActiveView] = useState("all");

  // Apply view preset
  const effectiveStatusFilter = activeView !== "all" ? activeView : statusFilter;

  // Filtered invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter((invoice) => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const matchesSearch =
        searchQuery === "" ||
        invoice.invoice_number?.toLowerCase().includes(searchLower) ||
        invoice.patient?.first_name?.toLowerCase().includes(searchLower) ||
        invoice.patient?.last_name?.toLowerCase().includes(searchLower) ||
        invoice.patient?.patient_number?.toLowerCase().includes(searchLower);

      // Status filter
      const matchesStatus =
        effectiveStatusFilter === "all" ||
        invoice.status === effectiveStatusFilter ||
        (effectiveStatusFilter === "unpaid" && Number(invoice.balance_due ?? 0) > 0) ||
        (effectiveStatusFilter === "overdue" && Number(invoice.balance_due ?? 0) > 0);

      return matchesSearch && matchesStatus;
    });
  }, [invoices, searchQuery, effectiveStatusFilter]);

  // Stats
  const openCount = invoices.filter((invoice) => invoice.status === "open" || invoice.status === "draft").length;
  const paidCount = invoices.filter((invoice) => invoice.status === "paid").length;
  const overdueCount = invoices.filter((invoice) => Number(invoice.balance_due ?? 0) > 0).length;
  const totalValue = invoices.reduce((sum, invoice) => sum + Number(invoice.total_amount ?? 0), 0);

  // View tabs
  const views = [
    { id: "all", label: "All", count: invoices.length },
    { id: "open", label: "Open", count: openCount },
    { id: "paid", label: "Paid", count: paidCount },
    { id: "unpaid", label: "Unpaid", count: overdueCount },
  ];

  // Status options for select
  const statusOptions = [
    { label: "Open", value: "open" },
    { label: "Paid", value: "paid" },
    { label: "Draft", value: "draft" },
    { label: "Unpaid", value: "unpaid" },
  ];

  // Reset filters
  const handleReset = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setActiveView("all");
  };

  // Check if filters are active
  const hasActiveFilters = searchQuery !== "" || statusFilter !== "all" || activeView !== "all";

  return (
    <main className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Invoice List"
        title="Billing Invoices"
        description="Review invoice status, open balances, and jump into individual invoice detail for collection or reconciliation."
        actions={
          <>
            <Button asChild>
              <Link href={`/h/${hospitalSlug}/billing/invoices/new`}>Create Invoice</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/billing`}>Billing Dashboard</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WorkspaceStatCard
          title="All Invoices"
          value={invoices.length}
          description="Every invoice currently in the system"
          icon={<FileText className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Open or Draft"
          value={openCount}
          description="Invoices still needing collection or review"
          icon={<AlertTriangle className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Paid"
          value={paidCount}
          description="Invoices already settled"
          icon={<Wallet className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Total Value"
          value={totalValue.toFixed(2)}
          description="Sum of all listed invoice totals"
          icon={<Receipt className="h-4 w-4" />}
          valueClassName="text-xl"
        />
      </div>

      <section className="space-y-4 rounded-2xl border p-4 sm:p-5">
        <WorkspaceSectionHeader
          title="Invoices"
          description="Open any invoice to review line items, payments, and outstanding balance."
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
          searchPlaceholder="Search by invoice number, patient name, or ID..."
          onSearchChange={setSearchQuery}
          statusOptions={statusOptions}
          statusValue={statusFilter}
          onStatusChange={(value) => {
            setStatusFilter(value);
            setActiveView("all");
          }}
          hasActiveFilters={hasActiveFilters}
          onReset={handleReset}
          resultCount={filteredInvoices.length}
          resultLabel="invoices"
        />

        {invoices.length === 0 ? (
          <WorkspaceEmptyState
            title="No invoices yet"
            description="Create the first invoice to begin billing and collection tracking."
            action={
              <Button asChild>
                <Link href={`/h/${hospitalSlug}/billing/invoices/new`}>Create Invoice</Link>
              </Button>
            }
          />
        ) : filteredInvoices.length === 0 ? (
          <WorkspaceEmptyState
            variant="search"
            title="No matching invoices"
            description="Try adjusting your search or filter criteria."
            action={
              <Button variant="outline" onClick={handleReset}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredInvoices.map((invoice) => (
              <InvoiceListItem
                key={invoice.id}
                hospitalSlug={hospitalSlug}
                invoice={invoice}
              />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

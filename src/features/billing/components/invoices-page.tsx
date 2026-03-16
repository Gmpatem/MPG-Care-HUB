import Link from "next/link";
import { FileText, Receipt, Wallet, AlertTriangle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WorkspaceEmptyState } from "@/components/layout/workspace-empty-state";
import { WorkspacePageHeader } from "@/components/layout/workspace-page-header";
import { WorkspaceSectionHeader } from "@/components/layout/workspace-section-header";
import { WorkspaceStatCard } from "@/components/layout/workspace-stat-card";

function fullName(patient: any) {
  if (!patient) return "Unknown patient";
  return [patient.first_name, patient.middle_name, patient.last_name].filter(Boolean).join(" ");
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export function InvoicesPage({
  hospitalSlug,
  invoices,
}: {
  hospitalSlug: string;
  invoices: any[];
}) {
  const openCount = invoices.filter((invoice) => invoice.status === "open" || invoice.status === "draft").length;
  const paidCount = invoices.filter((invoice) => invoice.status === "paid").length;
  const overdueCount = invoices.filter((invoice) => Number(invoice.balance_due ?? 0) > 0).length;
  const totalValue = invoices.reduce((sum, invoice) => sum + Number(invoice.total_amount ?? 0), 0);

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
        ) : (
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div
                key={invoice.id}
                className="flex flex-col gap-4 rounded-xl border bg-background p-4 lg:flex-row lg:items-start lg:justify-between"
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-medium">{invoice.invoice_number}</p>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                      {invoice.status}
                    </span>
                  </div>

                  <p className="text-sm text-muted-foreground">
                    {fullName(invoice.patient)} · {invoice.patient?.patient_number ?? "—"}
                  </p>

                  <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
                    <p>Issued: {formatDateTime(invoice.issued_at)}</p>
                    <p>Total: {Number(invoice.total_amount ?? 0).toFixed(2)}</p>
                    <p>Paid: {Number(invoice.amount_paid ?? 0).toFixed(2)}</p>
                    <p>Balance: {Number(invoice.balance_due ?? 0).toFixed(2)}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button asChild variant="outline">
                    <Link href={`/h/${hospitalSlug}/billing/invoices/${invoice.id}`}>Open Invoice</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

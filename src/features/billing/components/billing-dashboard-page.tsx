import Link from "next/link";
import { CreditCard, FileText, Receipt, Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WorkspaceEmptyState } from "@/components/layout/workspace-empty-state";
import { WorkspacePageHeader } from "@/components/layout/workspace-page-header";
import { WorkspaceSectionHeader } from "@/components/layout/workspace-section-header";
import { WorkspaceStatCard } from "@/components/layout/workspace-stat-card";
import { WorkflowStepCard } from "@/components/layout/workflow-step-card";

function fullName(patient: any) {
  if (!patient) return "Unknown patient";
  return [patient.first_name, patient.middle_name, patient.last_name].filter(Boolean).join(" ");
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

function formatMoney(currency: string, value: unknown) {
  return `${currency} ${Number(value ?? 0).toFixed(2)}`;
}

export function BillingDashboardPage({
  hospitalSlug,
  hospitalName,
  currencyCode,
  stats,
  invoices,
  payments,
}: {
  hospitalSlug: string;
  hospitalName: string;
  currencyCode?: string | null;
  stats: any;
  invoices: any[];
  payments: any[];
}) {
  const currency = currencyCode || "XAF";

  return (
    <main className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Billing Workspace"
        title="Billing"
        description="Review open balances, post payments, and keep financial clearance visible for patient discharge and service completion."
        actions={
          <>
            <Button asChild>
              <Link href={`/h/${hospitalSlug}/billing/invoices/new`}>Create Invoice</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/billing/invoices`}>Invoice List</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/billing/payments`}>Payments</Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WorkspaceStatCard
          title="Total Invoices"
          value={stats.totalInvoices}
          description={`${stats.openInvoices} still open`}
          icon={<FileText className="h-4 w-4" />}
        />
        <WorkspaceStatCard
          title="Total Billed"
          value={formatMoney(currency, stats.totalBilled)}
          description="All invoice value recorded"
          icon={<Receipt className="h-4 w-4" />}
          valueClassName="text-xl"
        />
        <WorkspaceStatCard
          title="Collected"
          value={formatMoney(currency, stats.totalCollected)}
          description="Payments already posted"
          icon={<Wallet className="h-4 w-4" />}
          valueClassName="text-xl"
        />
        <WorkspaceStatCard
          title="Outstanding"
          value={formatMoney(currency, stats.totalOutstanding)}
          description="Balances still due"
          icon={<CreditCard className="h-4 w-4" />}
          valueClassName="text-xl"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_.9fr]">
        <section className="space-y-4 rounded-2xl border p-4 sm:p-5">
          <WorkspaceSectionHeader
            title="Recent Invoices"
            description="Use this list to spot open balances and jump into invoice detail quickly."
            actions={
              <Button asChild variant="outline" size="sm">
                <Link href={`/h/${hospitalSlug}/billing/invoices`}>View All Invoices</Link>
              </Button>
            }
          />

          {invoices.length === 0 ? (
            <WorkspaceEmptyState
              title="No invoices yet"
              description="Create the first invoice to begin billing activity for the hospital."
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
                      {fullName(invoice.patient)} · {invoice.patient?.patient_number ?? "No patient number"}
                    </p>

                    <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
                      <p>Issued: {formatDateTime(invoice.issued_at)}</p>
                      <p>Total: {formatMoney(currency, invoice.total_amount)}</p>
                      <p>Paid: {formatMoney(currency, invoice.amount_paid)}</p>
                      <p>Balance: {formatMoney(currency, invoice.balance_due)}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button asChild>
                      <Link href={`/h/${hospitalSlug}/billing/invoices/${invoice.id}`}>Open Invoice</Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <div className="space-y-6">
          <section className="rounded-2xl border p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Recent Payments"
              description="Most recently posted payment activity"
              actions={
                <Button asChild variant="outline" size="sm">
                  <Link href={`/h/${hospitalSlug}/billing/payments`}>View All Payments</Link>
                </Button>
              }
            />

            {payments.length === 0 ? (
              <div className="rounded-xl border border-dashed p-4 text-sm text-muted-foreground">
                No payments posted yet.
              </div>
            ) : (
              <div className="space-y-3">
                {payments.map((payment) => (
                  <div key={payment.id} className="rounded-xl border bg-background p-4 text-sm text-muted-foreground">
                    <p className="font-medium text-foreground">
                      {formatMoney(currency, payment.amount)}
                    </p>
                    <p className="mt-1">
                      {payment.receipt_number ?? "No receipt number"} · {payment.method ?? "Unknown method"}
                    </p>
                    <p className="mt-1">
                      {formatDateTime(payment.payment_date)}
                    </p>
                    <p className="mt-1">
                      Payer: {payment.payer_name ?? "—"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          <section className="rounded-2xl border p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Billing Flow"
              description="Standard finance routine"
            />

            <div className="mt-4 space-y-3">
              <WorkflowStepCard
                step="Step 1"
                title="Open or create the invoice"
                description="Make sure charges are visible before requesting payment or discharge clearance."
              />

              <WorkflowStepCard
                step="Step 2"
                title="Post the payment"
                description="Record the amount, method, and reference cleanly so balances stay accurate."
              />

              <WorkflowStepCard
                step="Step 3"
                title="Recheck balance due"
                description="Use remaining balance to determine whether the patient is financially cleared."
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}


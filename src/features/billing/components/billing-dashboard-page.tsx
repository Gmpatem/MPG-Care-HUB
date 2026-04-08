import Link from "next/link";
import { CreditCard, FileText, Receipt, Wallet, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { WorkspaceEmptyState } from "@/components/layout/workspace-empty-state";
import { WorkspacePageHeader } from "@/components/layout/workspace-page-header";
import { WorkspaceSectionHeader } from "@/components/layout/workspace-section-header";
import { WorkflowStepCard } from "@/components/layout/workflow-step-card";
import { AttentionPanel, ActivityFeed } from "@/components/layout";
import type { AttentionItem, ActivityItem } from "@/components/layout";
import { KpiCard, KpiSummaryStrip } from "@/components/layout/kpi-card";
import { MobileSummaryStack, SummaryPill } from "@/components/layout/mobile-summary-stack";
import { TodayViewPanel, type TodayItem } from "@/components/layout/today-view-panel";
import {
  WorkspacePageShell,
  WorkspaceTwoColumnLayout,
} from "@/components/layout/workspace-page-shell";

function fullName(patient: unknown) {
  if (!patient || typeof patient !== "object") return "Unknown patient";
  const p = patient as Record<string, string | null | undefined>;
  return [p.first_name, p.middle_name, p.last_name].filter(Boolean).join(" ");
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
  currencyCode,
  stats,
  invoices,
  payments,
  attentionItems = [],
  recentActivity = [],
}: {
  hospitalSlug: string;
  hospitalName: string;
  currencyCode?: string | null;
  stats: {
    totalInvoices: number;
    openInvoices: number;
    totalBilled: number;
    totalCollected: number;
    totalOutstanding: number;
  };
  invoices: Array<{
    id: string;
    invoice_number: string;
    status: string;
    issued_at: string | null;
    total_amount: number;
    amount_paid: number;
    balance_due: number;
    patient?: {
      first_name?: string | null;
      middle_name?: string | null;
      last_name?: string | null;
      patient_number?: string | null;
    } | null;
  }>;
  payments: Array<{
    id: string;
    payment_number?: string | null;
    amount: number;
    method?: string | null;
    payment_date?: string | null;
    receipt_number?: string | null;
    payer_name?: string | null;
  }>;
  attentionItems?: AttentionItem[];
  recentActivity?: ActivityItem[];
}) {
  const currency = currencyCode || "XAF";
  const collectionRate = stats.totalBilled > 0 
    ? Math.round((stats.totalCollected / stats.totalBilled) * 100) 
    : 0;

  // Generate attention items from data if not provided
  const generatedAttentionItems: AttentionItem[] = attentionItems.length > 0
    ? attentionItems
    : [
        ...(stats.totalOutstanding > 0 ? [{
          id: "outstanding",
          title: `${formatMoney(currency, stats.totalOutstanding)} outstanding`,
          description: `${stats.openInvoices} invoice${stats.openInvoices > 1 ? 's' : ''} need${stats.openInvoices === 1 ? 's' : ''} payment or follow-up`,
          tone: "warning" as const,
          href: `/h/${hospitalSlug}/billing/invoices`,
          actionLabel: "Review Invoices",
        }] : []),
        ...(stats.openInvoices > 5 ? [{
          id: "many-open",
          title: "Many unpaid invoices",
          description: "Consider following up on long-outstanding balances",
          tone: "info" as const,
          href: `/h/${hospitalSlug}/billing/invoices`,
          actionLabel: "View All Unpaid",
        }] : []),
        ...(stats.totalOutstanding === 0 && stats.totalInvoices > 0 ? [{
          id: "all-paid",
          title: "All invoices paid",
          description: "No outstanding balances — great job!",
          tone: "success" as const,
          href: `/h/${hospitalSlug}/billing/invoices`,
          actionLabel: "View Invoices",
        }] : []),
      ].filter(Boolean);

  // Generate activity from payments if not provided
  const generatedActivity: ActivityItem[] = recentActivity.length > 0
    ? recentActivity
    : payments.slice(0, 5).map((p, i) => ({
        id: p.id || `payment-${i}`,
        type: "payment" as const,
        title: `Payment recorded`,
        description: `${formatMoney(currency, p.amount)} · ${p.receipt_number || 'No receipt'}`,
        actor: p.payer_name || undefined,
        timestamp: p.payment_date || new Date().toISOString(),
        status: "completed" as const,
      }));

  // Count payments today
  const paymentsToday = payments.filter(p => {
    if (!p.payment_date) return false;
    const paymentDate = new Date(p.payment_date);
    const today = new Date();
    return paymentDate.toDateString() === today.toDateString();
  }).length;

  // Generate Today View items
  const todayUrgentItems: TodayItem[] = [
    ...(stats.totalOutstanding > 0 ? [{
      id: "outstanding",
      title: "Outstanding balances need collection",
      description: `${formatMoney(currency, stats.totalOutstanding)} across ${stats.openInvoices} invoice${stats.openInvoices > 1 ? 's' : ''}`,
      tone: "urgent" as const,
      count: stats.openInvoices,
      href: `/h/${hospitalSlug}/billing/invoices`,
      actionLabel: "Collect Now",
    }] : []),
  ];

  const todayReadyItems: TodayItem[] = [
    ...(stats.openInvoices > 0 && stats.totalOutstanding === 0 ? [{
      id: "partial-paid",
      title: "Partial payments to review",
      description: `${stats.openInvoices} invoice${stats.openInvoices > 1 ? 's' : ''} with partial payments`,
      tone: "ready" as const,
      count: stats.openInvoices,
      href: `/h/${hospitalSlug}/billing/invoices`,
      actionLabel: "Review Invoices",
    }] : []),
  ];

  const todayWaitingItems: TodayItem[] = [
    ...(invoices.filter(inv => inv.status === "draft").length > 0 ? [{
      id: "draft-invoices",
      title: "Draft invoices to finalize",
      description: `${invoices.filter(inv => inv.status === "draft").length} draft invoice${invoices.filter(inv => inv.status === "draft").length > 1 ? 's' : ''} awaiting completion`,
      tone: "waiting" as const,
      count: invoices.filter(inv => inv.status === "draft").length,
      href: `/h/${hospitalSlug}/billing/invoices`,
      actionLabel: "Finalize",
    }] : []),
  ];

  return (
    <WorkspacePageShell>
      {/* Page Header */}
      <WorkspacePageHeader
        eyebrow="Billing Workspace"
        title="Billing"
        description="Review open balances, post payments, and keep financial clearance visible for patient discharge and service completion."
        primaryAction={
          <Button asChild>
            <Link href={`/h/${hospitalSlug}/billing/invoices/new`}>Create Invoice</Link>
          </Button>
        }
        secondaryActions={
          <>
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/billing/invoices`}>Invoice List</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/billing/payments`}>Payments</Link>
            </Button>
          </>
        }
      />

      {/* Today View - Billing priorities */}
      <TodayViewPanel
        title="Start Here Today"
        description="What needs your attention in billing now"
        urgentItems={todayUrgentItems}
        readyItems={todayReadyItems}
        waitingItems={todayWaitingItems}
        completedToday={paymentsToday}
        completedLabel="payments posted today"
        emptyMessage="All invoices are paid"
        emptyDescription="No outstanding balances need collection right now."
      />

      {/* Mobile Summary Stack */}
      <MobileSummaryStack className="lg:hidden">
        <SummaryPill
          label="Outstanding"
          value={formatMoney(currency, stats.totalOutstanding)}
          tone={stats.totalOutstanding > 0 ? "warning" : stats.totalInvoices > 0 ? "success" : "neutral"}
          icon={<CreditCard className="h-3.5 w-3.5" />}
        />
        <SummaryPill
          label="Collected"
          value={formatMoney(currency, stats.totalCollected)}
          tone={stats.totalCollected > 0 ? "success" : "neutral"}
          icon={<Wallet className="h-3.5 w-3.5" />}
        />
        <SummaryPill
          label="Open"
          value={stats.openInvoices}
          tone={stats.openInvoices > 5 ? "warning" : stats.openInvoices > 0 ? "info" : "neutral"}
          icon={<FileText className="h-3.5 w-3.5" />}
        />
        <SummaryPill
          label="Billed"
          value={formatMoney(currency, stats.totalBilled)}
          tone="neutral"
          icon={<Receipt className="h-3.5 w-3.5" />}
        />
      </MobileSummaryStack>

      {/* Desktop KPI Summary Strip */}
      <div className="hidden lg:block">
        <KpiSummaryStrip>
          <KpiCard
            title="Outstanding Balance"
            value={formatMoney(currency, stats.totalOutstanding)}
            description={stats.totalOutstanding > 0 
              ? `${stats.openInvoices} invoice${stats.openInvoices > 1 ? 's' : ''} awaiting payment`
              : stats.totalInvoices > 0 
                ? "All invoices paid in full"
                : "No invoices created yet"}
            icon={<CreditCard className="h-4 w-4" />}
            tone={stats.totalOutstanding > 0 ? "warning" : stats.totalInvoices > 0 ? "success" : "neutral"}
            action={{ label: "Review Invoices", href: `/h/${hospitalSlug}/billing/invoices` }}
          />
          <KpiCard
            title="Total Collected"
            value={formatMoney(currency, stats.totalCollected)}
            description={stats.totalCollected > 0 
              ? `${collectionRate}% collection rate on total billed`
              : "No payments recorded yet"}
            icon={<Wallet className="h-4 w-4" />}
            tone={stats.totalCollected > 0 ? "success" : "neutral"}
            action={{ label: "View Payments", href: `/h/${hospitalSlug}/billing/payments` }}
          />
          <KpiCard
            title="Open Invoices"
            value={stats.openInvoices}
            description={stats.openInvoices > 0 
              ? "Invoices awaiting payment or follow-up"
              : "No pending invoices"}
            icon={<FileText className="h-4 w-4" />}
            tone={stats.openInvoices > 5 ? "warning" : stats.openInvoices > 0 ? "info" : "neutral"}
            action={{ label: "View Open", href: `/h/${hospitalSlug}/billing/invoices` }}
          />
          <KpiCard
            title="Total Billed"
            value={formatMoney(currency, stats.totalBilled)}
            description={stats.totalInvoices > 0 
              ? `${stats.totalInvoices} total invoice${stats.totalInvoices > 1 ? 's' : ''} created`
              : "No invoices created yet"}
            icon={<Receipt className="h-4 w-4" />}
            tone="neutral"
          />
        </KpiSummaryStrip>
      </div>

      {/* Attention Panel for billing alerts */}
      {generatedAttentionItems.length > 0 && (
        <AttentionPanel
          title="Billing Attention"
          description="Invoices requiring payment or follow-up"
          items={generatedAttentionItems}
          className="mb-6"
        />
      )}

      {/* Main Content */}
      <WorkspaceTwoColumnLayout
        ratio="60-40"
        main={
          <div className="space-y-4 rounded-2xl border p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Recent Invoices"
              description="Use this list to spot open balances and jump into invoice detail quickly."
              actions={
                <Button asChild variant="outline" size="sm">
                  <Link href={`/h/${hospitalSlug}/billing/invoices`}>View All</Link>
                </Button>
              }
            />

            {invoices.length === 0 ? (
              <WorkspaceEmptyState
                variant="default"
                title="No invoices yet"
                description="Create the first invoice to begin billing activity. Invoices can be created from encounters or directly from patient records."
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
                        {invoice.balance_due > 0 && (
                          <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                            Unpaid
                          </span>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {fullName(invoice.patient)} · {invoice.patient?.patient_number ?? "No patient number"}
                      </p>

                      <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
                        <p>Issued: {formatDateTime(invoice.issued_at)}</p>
                        <p>Total: {formatMoney(currency, invoice.total_amount)}</p>
                        <p>Paid: {formatMoney(currency, invoice.amount_paid)}</p>
                        <p className={invoice.balance_due > 0 ? "font-medium text-amber-600" : ""}>
                          Balance: {formatMoney(currency, invoice.balance_due)}
                        </p>
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
          </div>
        }
        side={
          <div className="space-y-6">
            {/* Recent Payment Activity */}
            <ActivityFeed
              title="Recent Payments"
              description="Most recently posted payment activity"
              items={generatedActivity}
              viewAllHref={`/h/${hospitalSlug}/billing/payments`}
              viewAllLabel="View All"
              compact
            />

            {/* Billing Flow */}
            <div className="rounded-2xl border p-4 sm:p-5">
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
            </div>
          </div>
        }
      />
    </WorkspacePageShell>
  );
}

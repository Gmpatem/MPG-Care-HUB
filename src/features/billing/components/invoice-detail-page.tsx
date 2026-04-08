import Link from "next/link";

import { Button } from "@/components/ui/button";
import { WorkspacePageHeader } from "@/components/layout/workspace-page-header";
import { WorkspaceSectionHeader } from "@/components/layout/workspace-section-header";
import { WorkspaceStatCard } from "@/components/layout/workspace-stat-card";
import { WorkflowStepCard } from "@/components/layout/workflow-step-card";
import { StatusBadge } from "@/components/layout/status-badge";
import { TaskReadinessSummary } from "@/components/layout/task-readiness-summary";
import { SectionDisclosure } from "@/components/layout/progressive-disclosure";
import { TimelineFeed, type TimelineEvent } from "@/components/layout/timeline-feed";
import { PaymentEntryForm } from "@/features/billing/components/payment-entry-form";
import {
  SharedPatientContext,
  formatDateTime,
} from "@/components/layout/shared-patient-context";
import { RelatedActionsSection } from "@/components/layout/related-workspace-actions";
import { PatientJourneyStrip } from "@/components/layout/patient-journey-strip";
import { getInvoiceReadiness, getPaymentReadiness } from "@/lib/ui/task-state";

function formatMoney(value: unknown) {
  return Number(value ?? 0).toFixed(2);
}

function PaymentStatusBadge({ status }: { status: string | null | undefined }) {
  const signal = getPaymentReadiness(status);
  return (
    <StatusBadge
      label={signal.label}
      tone={signal.tone}
      className="px-2.5 py-1 capitalize font-medium"
    />
  );
}

function InvoiceReadinessSummary({ invoice }: { invoice: unknown }) {
  const inv = invoice as { total_amount?: number; amount_paid?: number; balance_due?: number };
  const signal = getInvoiceReadiness(
    Number(inv.total_amount ?? 0),
    Number(inv.amount_paid ?? 0),
    Number(inv.balance_due ?? 0)
  );

  return <TaskReadinessSummary signal={signal} title="Payment Status" />;
}

function generateInvoiceTimeline(
  invoice: {
    id: string;
    invoice_number: string;
    status: string;
    issued_at: string | null;
    total_amount: number;
    amount_paid: number;
    balance_due: number;
    patient?: {
      id?: string;
      first_name?: string;
      middle_name?: string | null;
      last_name?: string;
    } | null;
  },
  payments: Array<{
    id: string;
    payment_number?: string | null;
    amount: number;
    method?: string | null;
    paid_at?: string | null;
    payer_name?: string | null;
    status?: string | null;
  }>
): TimelineEvent[] {
  const events: TimelineEvent[] = [];

  // Invoice created event
  if (invoice.issued_at) {
    events.push({
      id: `invoice-created-${invoice.id}`,
      type: "invoice",
      title: "Invoice created",
      description: `Invoice #${invoice.invoice_number} issued`,
      timestamp: invoice.issued_at,
      details: [
        { label: "Invoice Number", value: invoice.invoice_number },
        { label: "Total Amount", value: formatMoney(invoice.total_amount) },
        { label: "Status", value: invoice.status },
      ],
    });
  }

  // Payment events
  payments.forEach((payment) => {
    if (payment.paid_at) {
      events.push({
        id: `payment-${payment.id}`,
        type: "payment",
        title: "Payment recorded",
        description: `${formatMoney(payment.amount)} via ${payment.method ?? "unknown method"}`,
        actor: payment.payer_name
          ? { name: payment.payer_name }
          : undefined,
        timestamp: payment.paid_at,
        status: payment.status === "completed"
          ? { label: "Completed", tone: "success" }
          : payment.status === "pending"
          ? { label: "Pending", tone: "warning" }
          : { label: payment.status ?? "Unknown", tone: "neutral" },
        details: [
          { label: "Payment Number", value: payment.payment_number ?? "—" },
          { label: "Amount", value: formatMoney(payment.amount) },
          { label: "Method", value: payment.method ?? "—" },
        ],
      });
    }
  });

  // Sort by timestamp
  return events.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
}

export function InvoiceDetailPage({
  hospitalSlug,
  invoice,
  items,
  payments,
}: {
  hospitalSlug: string;
  invoice: unknown;
  items: unknown[];
  payments: unknown[];
}) {
  const inv = invoice as {
    id: string;
    invoice_number: string;
    status: string;
    subtotal_amount?: number;
    discount_amount?: number;
    tax_amount?: number;
    total_amount: number;
    amount_paid: number;
    balance_due: number;
    issued_at: string | null;
    due_at: string | null;
    notes: string | null;
    appointment_id?: string | null;
    encounter_id?: string | null;
    patient?: {
      id?: string;
      patient_number?: string | null;
      first_name?: string;
      middle_name?: string | null;
      last_name?: string;
      phone?: string | null;
    } | null;
  };
  
  const balanceDue = Number(inv.balance_due ?? 0);
  const typedPayments = payments as Array<{
    id: string;
    payment_number?: string | null;
    amount: number;
    method?: string | null;
    paid_at?: string | null;
    payer_name?: string | null;
    status?: string | null;
    reference_number?: string | null;
    notes?: string | null;
  }>;

  const timelineEvents = generateInvoiceTimeline(inv, typedPayments);
  
  const invoiceMeta = (
    <>
      <StatusBadge 
        label={inv.status ?? "draft"} 
        tone={inv.status === "paid" ? "success" : inv.status === "overdue" ? "danger" : "info"}
        className="text-xs capitalize"
      />
      <span className="text-muted-foreground">·</span>
      <span className="text-sm text-muted-foreground">
        {items.length} items
      </span>
      <span className="text-muted-foreground">·</span>
      <span className={`text-sm font-medium ${balanceDue > 0 ? "text-amber-600" : "text-emerald-600"}`}>
        Balance: {formatMoney(balanceDue)}
      </span>
    </>
  );

  return (
    <main className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Invoice"
        title={inv.invoice_number}
        description="Review invoice composition, track allocations, and post payments without losing patient or encounter context."
        meta={invoiceMeta}
        backLink={{ href: `/h/${hospitalSlug}/billing/invoices`, label: "Back to Invoices" }}
        primaryAction={
          balanceDue > 0 ? (
            <Button asChild>
              <Link href={`/h/${hospitalSlug}/billing/payments/new?invoice=${inv.id}`}>
                Record Payment
              </Link>
            </Button>
          ) : undefined
        }
        secondaryActions={
          <>
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/billing/payments`}>View Payments</Link>
            </Button>
          </>
        }
        compact
      />

      {/* Patient Journey Context */}
      <PatientJourneyStrip
        hospitalSlug={hospitalSlug}
        stages={[
          { stage: "intake", status: "complete" },
          { stage: "checkin", status: "complete" },
          { stage: "doctor", status: "complete" },
          { stage: "lab", status: "optional" },
          { stage: "pharmacy", status: "optional" },
          { stage: "admission", status: "optional" },
          { stage: "billing", status: inv.status === "paid" ? "complete" : "active" },
          { stage: "discharge", status: inv.status === "paid" ? "waiting" : "skipped" },
        ]}
        currentInterpretation={inv.status === "paid"
          ? "Payment complete. Patient ready for discharge."
          : balanceDue > 0
            ? `Outstanding balance: ${formatMoney(balanceDue)}`
            : "Awaiting payment processing."
        }
        nextStep={inv.status === "paid"
          ? "Final discharge checklist and documentation."
          : balanceDue > 0
            ? `Collect remaining payment of ${formatMoney(balanceDue)}.`
            : "Verify payment allocation and close invoice."
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WorkspaceStatCard
          title="Total Amount"
          value={formatMoney(inv.total_amount)}
          description="Invoice total before remaining balance"
        />
        <WorkspaceStatCard
          title="Amount Paid"
          value={formatMoney(inv.amount_paid)}
          description="Payments already posted"
        />
        <WorkspaceStatCard
          title="Balance Due"
          value={formatMoney(inv.balance_due)}
          description="Outstanding amount still unpaid"
          valueClassName={balanceDue > 0 ? "text-amber-700 dark:text-amber-400" : undefined}
        />
        <WorkspaceStatCard
          title="Line Items"
          value={items.length}
          description="Billable entries on this invoice"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          {/* Invoice Readiness Summary */}
          <InvoiceReadinessSummary invoice={inv} />

          {/* Shared Patient Context */}
          <SharedPatientContext
            hospitalSlug={hospitalSlug}
            patient={inv.patient && inv.patient.first_name && inv.patient.last_name ? {
              id: inv.patient.id,
              first_name: inv.patient.first_name,
              middle_name: inv.patient.middle_name,
              last_name: inv.patient.last_name,
              patient_number: inv.patient.patient_number,
              phone: inv.patient.phone,
            } : null}
            invoice={inv}
            showRelatedLinks={true}
            primaryItems={[
              { label: "Issued At", value: formatDateTime(inv.issued_at) },
              { label: "Due At", value: formatDateTime(inv.due_at) },
              { label: "Encounter", value: inv.encounter_id },
              { label: "Status", value: inv.status },
            ]}
            secondaryItems={[
              { label: "Subtotal", value: formatMoney(inv.subtotal_amount) },
              { label: "Discount", value: formatMoney(inv.discount_amount) },
              { label: "Tax", value: formatMoney(inv.tax_amount) },
              { label: "Total", value: formatMoney(inv.total_amount) },
            ]}
          />

          {/* Invoice Timeline */}
          <TimelineFeed
            title="Invoice History"
            description="Payment and status timeline"
            events={timelineEvents}
            expandable={false}
          />

          {/* Related Actions */}
          <RelatedActionsSection
            hospitalSlug={hospitalSlug}
            patientId={inv.patient?.id}
            invoiceId={inv.id}
            encounterId={inv.encounter_id ?? undefined}
            currentWorkspace="billing"
            title="Continue Care"
          />

          {/* Invoice Notes - Progressive Disclosure */}
          <SectionDisclosure
            title="Invoice Notes"
            description="Additional billing context"
            empty={!inv.notes}
            emptyMessage="No notes added to this invoice."
            defaultExpanded={!!inv.notes}
          >
            <div className="rounded-2xl border border-border/70 bg-background/70 p-4 text-sm leading-6 text-foreground">
              {inv.notes}
            </div>
          </SectionDisclosure>

          {/* Invoice Items */}
          <section className="surface-panel p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Invoice Items"
              description="Line-by-line charges and payment allocation visibility."
            />

            {items.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-border/80 bg-background/50 p-4 text-sm text-muted-foreground">
                No invoice items yet.
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {items.map((item) => {
                  const it = item as {
                    id: string;
                    description: string;
                    item_type: string;
                    source_entity_type?: string | null;
                    quantity: number;
                    unit_price: number;
                    line_total: number;
                    payment_allocations?: Array<{ id: string; amount: number; payment?: { payment_number?: string } }>;
                  };
                  const allocated = (it.payment_allocations ?? []).reduce(
                    (sum: number, row: { amount?: number }) => sum + Number(row.amount ?? 0),
                    0
                  );

                  return (
                    <div key={it.id} className="rounded-2xl border border-border/70 bg-background p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-foreground">{it.description}</p>
                        <StatusBadge
                          label={it.item_type}
                          tone="neutral"
                          className="px-2.5 py-1 capitalize font-medium"
                        />
                        {it.source_entity_type ? (
                          <StatusBadge
                            label={it.source_entity_type}
                            tone="info"
                            className="px-2.5 py-1 capitalize font-medium"
                          />
                        ) : null}
                      </div>

                      <div className="mt-3 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2 xl:grid-cols-4">
                        <p>Quantity: {it.quantity}</p>
                        <p>Unit Price: {formatMoney(it.unit_price)}</p>
                        <p>Line Total: {formatMoney(it.line_total)}</p>
                        <p>Allocated: {formatMoney(allocated)}</p>
                      </div>

                      {/* Payment Allocations - Progressive Disclosure */}
                      {it.payment_allocations && it.payment_allocations.length > 0 && (
                        <div className="mt-3 rounded-2xl border border-border/70 bg-background/70 p-3">
                          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                            Payment Allocations
                          </p>
                          <div className="mt-2 space-y-1">
                            {it.payment_allocations.map((alloc: { id: string; amount: number; payment?: { payment_number?: string } }) => (
                              <p key={alloc.id} className="text-muted-foreground">
                                {alloc.payment?.payment_number ?? "Payment"}: {formatMoney(alloc.amount)}
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <RelatedActionsSection
            hospitalSlug={hospitalSlug}
            patientId={inv.patient?.id}
            invoiceId={inv.id}
            encounterId={inv.encounter_id ?? undefined}
            currentWorkspace="billing"
            title="Related Workspaces"
          />

          {balanceDue > 0 && (
            <section className="surface-panel p-4 sm:p-5">
              <WorkspaceSectionHeader
                title="Payment Entry"
                description="Record a new payment and allocate it to line items."
              />

              <div className="mt-4">
                <PaymentEntryForm
                  hospitalSlug={hospitalSlug}
                  invoices={[{ ...inv, balance_due: inv.balance_due }]}
                  defaultInvoiceId={inv.id}
                />
              </div>
            </section>
          )}

          {/* Payment History - Progressive Disclosure */}
          <SectionDisclosure
            title="Payment History"
            description="Payments already posted to this invoice"
            empty={payments.length === 0}
            emptyMessage="No payments recorded yet."
            defaultExpanded={payments.length > 0}
          >
            <div className="space-y-4">
              {typedPayments.map((payment) => (
                <div key={payment.id} className="rounded-2xl border border-border/70 bg-background p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-medium text-foreground">
                      {payment.payment_number}
                    </p>
                    <PaymentStatusBadge status={payment.status} />
                  </div>

                  <div className="mt-2 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                    <p>Method: {payment.method}</p>
                    <p>Amount: {formatMoney(payment.amount)}</p>
                    <p>Paid At: {formatDateTime(payment.paid_at)}</p>
                    <p>Reference: {payment.reference_number || "—"}</p>
                  </div>

                  {payment.notes ? (
                    <p className="mt-2 text-sm text-muted-foreground">{payment.notes}</p>
                  ) : null}
                </div>
              ))}
            </div>
          </SectionDisclosure>

          {/* Billing Workflow Guide */}
          <section className="surface-panel p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Billing Flow"
              description="Payment collection routine"
            />

            <div className="mt-4 space-y-3">
              <WorkflowStepCard
                step="Step 1"
                title="Review invoice composition"
                description="Check line items, verify charges, and confirm patient identity before collection."
              />

              <WorkflowStepCard
                step="Step 2"
                title="Record payment"
                description="Post the payment with method, reference, and allocate to specific line items."
              />

              <WorkflowStepCard
                step="Step 3"
                title="Issue receipt"
                description="Generate receipt and confirm balance is updated."
              />
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

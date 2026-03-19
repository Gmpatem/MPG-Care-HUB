import Link from "next/link";

import { Button } from "@/components/ui/button";
import { WorkspacePageHeader } from "@/components/layout/workspace-page-header";
import { WorkspaceSectionHeader } from "@/components/layout/workspace-section-header";
import { WorkspaceStatCard } from "@/components/layout/workspace-stat-card";
import { InfoGrid } from "@/components/layout/info-grid";
import { PatientSummaryPanel } from "@/components/layout/patient-summary-panel";
import { StatusBadge } from "@/components/layout/status-badge";
import { PaymentEntryForm } from "@/features/billing/components/payment-entry-form";

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

function invoiceTone(status: string | null) {
  if (status === "paid") return "success" as const;
  if (status === "partially_paid") return "warning" as const;
  if (status === "cancelled") return "danger" as const;
  return "neutral" as const;
}

export function InvoiceDetailPage({
  hospitalSlug,
  invoice,
  items,
  payments,
}: {
  hospitalSlug: string;
  invoice: any;
  items: any[];
  payments: any[];
}) {
  return (
    <main className="space-y-6">
      <WorkspacePageHeader
        eyebrow="Billing Invoice"
        title={invoice.invoice_number}
        description="Review invoice composition, track allocations, and post payments without losing patient or encounter context."
        actions={
          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/billing/invoices`}>Back to Invoices</Link>
          </Button>
        }
      />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <WorkspaceStatCard
          title="Total Amount"
          value={formatMoney(invoice.total_amount)}
          description="Invoice total before remaining balance"
        />
        <WorkspaceStatCard
          title="Amount Paid"
          value={formatMoney(invoice.amount_paid)}
          description="Payments already posted"
        />
        <WorkspaceStatCard
          title="Balance Due"
          value={formatMoney(invoice.balance_due)}
          description="Outstanding amount still unpaid"
          valueClassName={Number(invoice.balance_due ?? 0) > 0 ? "text-amber-700 dark:text-amber-400" : undefined}
        />
        <WorkspaceStatCard
          title="Line Items"
          value={items.length}
          description="Billable entries on this invoice"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <PatientSummaryPanel
            name={fullName(invoice.patient)}
            patientNumber={invoice.patient?.patient_number}
            subtitle={`Invoice ${invoice.invoice_number}`}
            statusLabel={invoice.status ?? "draft"}
            statusTone={invoiceTone(invoice.status)}
            primaryItems={[
              { label: "Issued At", value: formatDateTime(invoice.issued_at) },
              { label: "Due At", value: formatDateTime(invoice.due_at) },
              { label: "Encounter", value: invoice.encounter_id },
              { label: "Status", value: invoice.status },
            ]}
            secondaryItems={[
              { label: "Subtotal", value: formatMoney(invoice.subtotal_amount) },
              { label: "Discount", value: formatMoney(invoice.discount_amount) },
              { label: "Tax", value: formatMoney(invoice.tax_amount) },
              { label: "Total", value: formatMoney(invoice.total_amount) },
            ]}
          />

          <section className="surface-panel p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Invoice Notes"
              description="Additional billing context"
            />

            <div className="mt-4 rounded-2xl border border-border/70 bg-background/70 p-4 text-sm leading-6 text-foreground">
              {invoice.notes || "—"}
            </div>
          </section>

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
                  const allocated = (item.payment_allocations ?? []).reduce(
                    (sum: number, row: any) => sum + Number(row.amount ?? 0),
                    0
                  );

                  return (
                    <div key={item.id} className="rounded-2xl border border-border/70 bg-background p-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium text-foreground">{item.description}</p>
                        <StatusBadge
                          label={item.item_type}
                          tone="neutral"
                          className="px-2.5 py-1 capitalize font-medium"
                        />
                        {item.source_entity_type ? (
                          <StatusBadge
                            label={item.source_entity_type}
                            tone="info"
                            className="px-2.5 py-1 capitalize font-medium"
                          />
                        ) : null}
                      </div>

                      <div className="mt-3">
                        <InfoGrid
                          items={[
                            { label: "Quantity", value: formatMoney(item.quantity) },
                            { label: "Unit Price", value: formatMoney(item.unit_price) },
                            { label: "Line Total", value: formatMoney(item.line_total) },
                            { label: "Allocated", value: allocated.toFixed(2) },
                            { label: "Unpaid", value: Math.max(0, Number(item.line_total ?? 0) - allocated).toFixed(2) },
                            { label: "Source ID", value: item.source_entity_id },
                          ]}
                          columnsClassName="md:grid-cols-2 xl:grid-cols-3"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        <div className="space-y-6">
          <PaymentEntryForm
            hospitalSlug={hospitalSlug}
            invoices={[
              {
                id: invoice.id,
                invoice_number: invoice.invoice_number,
                balance_due: invoice.balance_due,
                patient: invoice.patient,
              },
            ]}
            defaultInvoiceId={invoice.id}
          />

          <section className="surface-panel p-4 sm:p-5">
            <WorkspaceSectionHeader
              title="Payments"
              description="Recorded payments and allocations"
            />

            {payments.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-dashed border-border/80 bg-background/50 p-4 text-sm text-muted-foreground">
                No payments posted yet.
              </div>
            ) : (
              <div className="mt-4 space-y-4">
                {payments.map((payment) => (
                  <div key={payment.id} className="rounded-2xl border border-border/70 bg-background p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium text-foreground">{formatMoney(payment.amount)}</p>
                      <StatusBadge
                        label={payment.method}
                        tone="info"
                        className="px-2.5 py-1 capitalize font-medium"
                      />
                      <StatusBadge
                        label={payment.status}
                        tone={payment.status === "posted" ? "success" : "neutral"}
                        className="px-2.5 py-1 capitalize font-medium"
                      />
                    </div>

                    <div className="mt-3">
                      <InfoGrid
                        items={[
                          { label: "Receipt", value: payment.receipt_number },
                          { label: "Reference", value: payment.reference_number },
                          { label: "Payer", value: payment.payer_name },
                          { label: "Payment Date", value: formatDateTime(payment.payment_date) },
                        ]}
                        columnsClassName="md:grid-cols-2"
                      />
                    </div>

                    {(payment.payment_allocations ?? []).length > 0 ? (
                      <div className="mt-3 rounded-2xl border border-border/70 bg-background/70 p-4 text-sm text-muted-foreground">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                          Allocations
                        </p>
                        <ul className="mt-2 space-y-1">
                          {payment.payment_allocations.map((allocation: any) => (
                            <li key={allocation.id}>
                              Item {allocation.invoice_item_id} · {formatMoney(allocation.amount)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {payment.notes ? (
                      <div className="mt-3 rounded-2xl border border-border/70 bg-background/70 p-4 text-sm leading-6 text-foreground">
                        {payment.notes}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { PaymentEntryForm } from "@/features/billing/components/payment-entry-form";

function fullName(patient: any) {
  if (!patient) return "Unknown patient";
  return [patient.first_name, patient.middle_name, patient.last_name].filter(Boolean).join(" ");
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Invoice detail</p>
          <h1 className="text-3xl font-semibold tracking-tight">{invoice.invoice_number}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {fullName(invoice.patient)} · {invoice.patient?.patient_number ?? "No patient number"}
          </p>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/billing/invoices`}>Back to Invoices</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <div className="rounded-xl border p-5">
            <h2 className="text-lg font-semibold">Invoice Summary</h2>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
              <p><span className="font-medium">Status:</span> {invoice.status}</p>
              <p><span className="font-medium">Issued At:</span> {formatDateTime(invoice.issued_at)}</p>
              <p><span className="font-medium">Due At:</span> {formatDateTime(invoice.due_at)}</p>
              <p><span className="font-medium">Encounter:</span> {invoice.encounter_id ?? "—"}</p>
              <p><span className="font-medium">Subtotal:</span> {Number(invoice.subtotal_amount ?? 0).toFixed(2)}</p>
              <p><span className="font-medium">Discount:</span> {Number(invoice.discount_amount ?? 0).toFixed(2)}</p>
              <p><span className="font-medium">Tax:</span> {Number(invoice.tax_amount ?? 0).toFixed(2)}</p>
              <p><span className="font-medium">Total:</span> {Number(invoice.total_amount ?? 0).toFixed(2)}</p>
              <p><span className="font-medium">Paid:</span> {Number(invoice.amount_paid ?? 0).toFixed(2)}</p>
              <p><span className="font-medium">Balance:</span> {Number(invoice.balance_due ?? 0).toFixed(2)}</p>
            </div>

            <div className="mt-4">
              <p className="font-medium">Notes</p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-muted-foreground">
                {invoice.notes || "—"}
              </p>
            </div>
          </div>

          <div className="rounded-xl border">
            <div className="border-b px-4 py-3">
              <h2 className="font-medium">Invoice Items</h2>
            </div>

            {items.length === 0 ? (
              <div className="px-4 py-8 text-sm text-muted-foreground">
                No invoice items yet.
              </div>
            ) : (
              <div className="divide-y">
                {items.map((item) => {
                  const allocated = (item.payment_allocations ?? []).reduce(
                    (sum: number, row: any) => sum + Number(row.amount ?? 0),
                    0
                  );

                  return (
                    <div key={item.id} className="px-4 py-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{item.description}</p>
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                          {item.item_type}
                        </span>
                        {item.source_entity_type ? (
                          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                            {item.source_entity_type}
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-2 text-sm text-muted-foreground">
                        Qty {Number(item.quantity ?? 0).toFixed(2)} · Unit {Number(item.unit_price ?? 0).toFixed(2)} · Line {Number(item.line_total ?? 0).toFixed(2)}
                      </p>

                      <p className="text-sm text-muted-foreground">
                        Allocated {allocated.toFixed(2)} · Unpaid {Math.max(0, Number(item.line_total ?? 0) - allocated).toFixed(2)}
                      </p>

                      {item.source_entity_id ? (
                        <p className="text-xs text-muted-foreground">
                          Source: {item.source_entity_type} / {item.source_entity_id}
                        </p>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
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

          <div className="rounded-xl border">
            <div className="border-b px-4 py-3">
              <h2 className="font-medium">Payments</h2>
            </div>

            {payments.length === 0 ? (
              <div className="px-4 py-8 text-sm text-muted-foreground">
                No payments posted yet.
              </div>
            ) : (
              <div className="divide-y">
                {payments.map((payment) => (
                  <div key={payment.id} className="px-4 py-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{Number(payment.amount ?? 0).toFixed(2)}</p>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                        {payment.method}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700">
                        {payment.status}
                      </span>
                    </div>

                    <p className="mt-2 text-sm text-muted-foreground">
                      Receipt: {payment.receipt_number ?? "—"} · Ref: {payment.reference_number ?? "—"}
                    </p>

                    <p className="text-sm text-muted-foreground">
                      Payer: {payment.payer_name ?? "—"} · {formatDateTime(payment.payment_date)}
                    </p>

                    {(payment.payment_allocations ?? []).length > 0 ? (
                      <div className="mt-2 text-xs text-muted-foreground">
                        Allocations:
                        <ul className="mt-1 list-disc pl-5">
                          {payment.payment_allocations.map((allocation: any) => (
                            <li key={allocation.id}>
                              Item {allocation.invoice_item_id} · {Number(allocation.amount ?? 0).toFixed(2)}
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : null}

                    {payment.notes ? (
                      <p className="mt-2 text-sm text-muted-foreground">{payment.notes}</p>
                    ) : null}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
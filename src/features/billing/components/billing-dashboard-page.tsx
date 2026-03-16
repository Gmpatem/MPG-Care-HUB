import Link from "next/link";
import { Button } from "@/components/ui/button";

function fullName(patient: any) {
  if (!patient) return "Unknown patient";
  return [patient.first_name, patient.middle_name, patient.last_name].filter(Boolean).join(" ");
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
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
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Billing dashboard</p>
          <h1 className="text-3xl font-semibold tracking-tight">Billing</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Financial overview for {hospitalName}.
          </p>
        </div>

        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/billing/invoices`}>Invoices</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href={`/h/${hospitalSlug}/billing/payments`}>Payments</Link>
          </Button>
          <Button asChild>
            <Link href={`/h/${hospitalSlug}/billing/invoices/new`}>New Invoice</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-6">
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Total invoices</p>
          <div className="mt-2 text-2xl font-semibold">{stats.totalInvoices}</div>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Open invoices</p>
          <div className="mt-2 text-2xl font-semibold">{stats.openInvoices}</div>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Paid invoices</p>
          <div className="mt-2 text-2xl font-semibold">{stats.paidInvoices}</div>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Total billed</p>
          <div className="mt-2 text-2xl font-semibold">{currency} {Number(stats.totalBilled ?? 0).toFixed(2)}</div>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Collected</p>
          <div className="mt-2 text-2xl font-semibold">{currency} {Number(stats.totalCollected ?? 0).toFixed(2)}</div>
        </div>
        <div className="rounded-xl border p-5">
          <p className="text-sm text-muted-foreground">Outstanding</p>
          <div className="mt-2 text-2xl font-semibold">{currency} {Number(stats.totalOutstanding ?? 0).toFixed(2)}</div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="rounded-xl border">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="font-medium">Recent invoices</h2>
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/billing/invoices`}>View all</Link>
            </Button>
          </div>

          {invoices.length === 0 ? (
            <div className="px-4 py-8 text-sm text-muted-foreground">
              No invoices yet.
            </div>
          ) : (
            <div className="divide-y">
              {invoices.map((invoice) => (
                <div key={invoice.id} className="flex flex-col gap-4 px-4 py-4 lg:flex-row lg:items-start lg:justify-between">
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
                    <p className="text-sm text-muted-foreground">
                      Issued: {formatDateTime(invoice.issued_at)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Total {Number(invoice.total_amount ?? 0).toFixed(2)} · Paid {Number(invoice.amount_paid ?? 0).toFixed(2)} · Balance {Number(invoice.balance_due ?? 0).toFixed(2)}
                    </p>
                  </div>

                  <Button asChild>
                    <Link href={`/h/${hospitalSlug}/billing/invoices/${invoice.id}`}>Open</Link>
                  </Button>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border">
          <div className="flex items-center justify-between border-b px-4 py-3">
            <h2 className="font-medium">Recent payments</h2>
            <Button asChild variant="outline">
              <Link href={`/h/${hospitalSlug}/billing/payments`}>View all</Link>
            </Button>
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
                    Invoice: {payment.invoice?.invoice_number ?? "—"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Receipt: {payment.receipt_number ?? "—"} · Payer: {payment.payer_name ?? "—"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(payment.payment_date)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
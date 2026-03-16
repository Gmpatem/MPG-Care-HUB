import { PaymentEntryForm } from "@/features/billing/components/payment-entry-form";

function fullName(patient: any) {
  if (!patient) return "Unknown patient";
  return [patient.first_name, patient.middle_name, patient.last_name].filter(Boolean).join(" ");
}

function formatDateTime(value: string | null) {
  if (!value) return "—";
  return new Date(value).toLocaleString();
}

export function PaymentsPage({
  hospitalSlug,
  payments,
  invoices,
}: {
  hospitalSlug: string;
  payments: any[];
  invoices: any[];
}) {
  return (
    <main className="space-y-6">
      <div>
        <p className="text-sm text-muted-foreground">Payments</p>
        <h1 className="text-3xl font-semibold tracking-tight">Cashier Payments</h1>
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <PaymentEntryForm
          hospitalSlug={hospitalSlug}
          invoices={invoices}
        />

        <div className="rounded-xl border">
          <div className="border-b px-4 py-3">
            <h2 className="font-medium">Recent Payments</h2>
          </div>

          {payments.length === 0 ? (
            <div className="px-4 py-8 text-sm text-muted-foreground">
              No payments recorded yet.
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
                    Patient: {fullName(payment.invoice?.patient)} · {payment.invoice?.patient?.patient_number ?? "—"}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    Receipt: {payment.receipt_number ?? "—"} · Payer: {payment.payer_name ?? "—"}
                  </p>

                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(payment.payment_date)}
                  </p>

                  {payment.notes ? (
                    <p className="mt-2 text-sm text-muted-foreground">{payment.notes}</p>
                  ) : null}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
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

export function InvoicesPage({
  hospitalSlug,
  invoices,
}: {
  hospitalSlug: string;
  invoices: any[];
}) {
  return (
    <main className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Invoices</p>
          <h1 className="text-3xl font-semibold tracking-tight">Invoice List</h1>
        </div>

        <Button asChild>
          <Link href={`/h/${hospitalSlug}/billing/invoices/new`}>New Invoice</Link>
        </Button>
      </div>

      <div className="rounded-xl border">
        <div className="grid grid-cols-6 gap-4 border-b px-4 py-3 text-sm font-medium">
          <div>Invoice</div>
          <div>Patient</div>
          <div>Status</div>
          <div>Total</div>
          <div>Balance</div>
          <div></div>
        </div>

        {invoices.length === 0 ? (
          <div className="px-4 py-8 text-sm text-muted-foreground">
            No invoices yet.
          </div>
        ) : (
          <div className="divide-y">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="grid grid-cols-6 gap-4 px-4 py-4 text-sm">
                <div>
                  <p className="font-medium">{invoice.invoice_number}</p>
                  <p className="text-muted-foreground">{formatDateTime(invoice.issued_at)}</p>
                </div>
                <div>
                  <p>{fullName(invoice.patient)}</p>
                  <p className="text-muted-foreground">{invoice.patient?.patient_number ?? "—"}</p>
                </div>
                <div className="capitalize">{invoice.status}</div>
                <div>{Number(invoice.total_amount ?? 0).toFixed(2)}</div>
                <div>{Number(invoice.balance_due ?? 0).toFixed(2)}</div>
                <div>
                  <Button asChild variant="outline">
                    <Link href={`/h/${hospitalSlug}/billing/invoices/${invoice.id}`}>Open</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
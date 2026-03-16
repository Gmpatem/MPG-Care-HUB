"use client";

import { createPayment } from "@/features/billing/actions/create-payment";
import { Button } from "@/components/ui/button";

export function PaymentEntryForm({
  hospitalSlug,
  invoices,
  defaultInvoiceId,
}: {
  hospitalSlug: string;
  invoices: any[];
  defaultInvoiceId?: string | null;
}) {
  return (
    <form action={createPayment} className="space-y-4 rounded-xl border p-5">
      <input type="hidden" name="hospital_slug" value={hospitalSlug} />

      <div>
        <h2 className="text-lg font-semibold">Record Payment</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Post a cashier payment against an issued or partially paid invoice.
        </p>
      </div>

      <label className="grid gap-2 text-sm">
        <span className="font-medium">Invoice</span>
        <select
          name="invoice_id"
          defaultValue={defaultInvoiceId ?? ""}
          className="h-11 rounded-md border bg-background px-3 text-sm"
        >
          <option value="">Select invoice</option>
          {invoices.map((invoice) => {
            const patientName = [
              invoice.patient?.first_name,
              invoice.patient?.middle_name,
              invoice.patient?.last_name,
            ].filter(Boolean).join(" ");

            return (
              <option key={invoice.id} value={invoice.id}>
                {invoice.invoice_number} · {patientName || "Unknown patient"} · Balance {Number(invoice.balance_due ?? 0).toFixed(2)}
              </option>
            );
          })}
        </select>
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm">
          <span className="font-medium">Amount</span>
          <input
            name="amount"
            type="number"
            min="0.01"
            step="0.01"
            className="h-11 rounded-md border bg-background px-3 text-sm"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Method</span>
          <select
            name="method"
            defaultValue="cash"
            className="h-11 rounded-md border bg-background px-3 text-sm"
          >
            <option value="cash">cash</option>
            <option value="mobile_money">mobile_money</option>
            <option value="bank_transfer">bank_transfer</option>
            <option value="card">card</option>
            <option value="other">other</option>
          </select>
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm">
          <span className="font-medium">Reference Number</span>
          <input
            name="reference_number"
            className="h-11 rounded-md border bg-background px-3 text-sm"
            placeholder="Optional transfer / card / mobile ref"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Receipt Number</span>
          <input
            name="receipt_number"
            className="h-11 rounded-md border bg-background px-3 text-sm"
            placeholder="Leave blank to auto-generate"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm">
        <span className="font-medium">Payer Name</span>
        <input
          name="payer_name"
          className="h-11 rounded-md border bg-background px-3 text-sm"
          placeholder="Optional payer name"
        />
      </label>

      <label className="grid gap-2 text-sm">
        <span className="font-medium">Notes</span>
        <textarea
          name="notes"
          rows={3}
          className="rounded-md border bg-background px-3 py-2 text-sm"
          placeholder="Optional cashier note"
        />
      </label>

      <Button type="submit">
        Record Payment
      </Button>
    </form>
  );
}
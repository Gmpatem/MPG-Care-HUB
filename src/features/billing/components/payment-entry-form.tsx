"use client";

import { CreditCard, Receipt, Wallet } from "lucide-react";

import { createPayment } from "@/features/billing/actions/create-payment";
import { WorkspaceSectionHeader } from "@/components/layout/workspace-section-header";
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
  const selectedInvoice =
    invoices.find((invoice) => invoice.id === defaultInvoiceId) ??
    invoices[0] ??
    null;

  return (
    <form action={createPayment} className="space-y-4 rounded-2xl border p-4 sm:p-5">
      <input type="hidden" name="hospital_slug" value={hospitalSlug} />

      <WorkspaceSectionHeader
        title="Record Payment"
        description="Post a cashier payment against an issued or partially paid invoice."
      />

      {selectedInvoice ? (
        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
            <div className="mb-2 inline-flex rounded-lg bg-background p-2 ring-1 ring-border">
              <Wallet className="h-4 w-4" />
            </div>
            <p className="font-medium text-foreground">Balance Due</p>
            <p className="mt-1">{Number(selectedInvoice.balance_due ?? 0).toFixed(2)}</p>
          </div>

          <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
            <div className="mb-2 inline-flex rounded-lg bg-background p-2 ring-1 ring-border">
              <CreditCard className="h-4 w-4" />
            </div>
            <p className="font-medium text-foreground">Step 1</p>
            <p className="mt-1">Enter the payment amount and method.</p>
          </div>

          <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
            <div className="mb-2 inline-flex rounded-lg bg-background p-2 ring-1 ring-border">
              <Receipt className="h-4 w-4" />
            </div>
            <p className="font-medium text-foreground">Step 2</p>
            <p className="mt-1">Save the payment, then recheck the remaining balance.</p>
          </div>
        </div>
      ) : null}

      <label className="grid gap-2 text-sm">
        <span className="font-medium">Invoice</span>
        <select
          name="invoice_id"
          defaultValue={defaultInvoiceId ?? ""}
          className="h-11 rounded-xl border bg-background px-3 text-sm"
        >
          <option value="">Select invoice</option>
          {invoices.map((invoice) => {
            const patientName = [
              invoice.patient?.first_name,
              invoice.patient?.middle_name,
              invoice.patient?.last_name,
            ]
              .filter(Boolean)
              .join(" ");

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
            className="h-11 rounded-xl border bg-background px-3 text-sm"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Method</span>
          <select
            name="method"
            defaultValue="cash"
            className="h-11 rounded-xl border bg-background px-3 text-sm"
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
            className="h-11 rounded-xl border bg-background px-3 text-sm"
            placeholder="Optional transfer / card / mobile ref"
          />
        </label>

        <label className="grid gap-2 text-sm">
          <span className="font-medium">Receipt Number</span>
          <input
            name="receipt_number"
            className="h-11 rounded-xl border bg-background px-3 text-sm"
            placeholder="Leave blank to auto-generate"
          />
        </label>
      </div>

      <label className="grid gap-2 text-sm">
        <span className="font-medium">Payer Name</span>
        <input
          name="payer_name"
          className="h-11 rounded-xl border bg-background px-3 text-sm"
          placeholder="Optional payer name"
        />
      </label>

      <label className="grid gap-2 text-sm">
        <span className="font-medium">Notes</span>
        <textarea
          name="notes"
          rows={3}
          className="rounded-xl border bg-background px-3 py-2 text-sm"
          placeholder="Optional cashier note"
        />
      </label>

      <Button type="submit">
        Record Payment
      </Button>
    </form>
  );
}

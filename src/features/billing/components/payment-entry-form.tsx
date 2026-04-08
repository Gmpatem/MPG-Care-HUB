"use client";

import { useActionState, useState } from "react";
import { CreditCard, Receipt, Wallet } from "lucide-react";

import { createPayment } from "@/features/billing/actions/create-payment";
import { WorkspaceSectionHeader } from "@/components/layout/workspace-section-header";
import {
  FormSection,
  FormGrid,
  FormField,
  FormActionsBar,
} from "@/components/forms/form-section";
import { SubmitButton } from "@/components/forms/submit-button";
import {
  ConfirmationModal,
  ConfirmationPanel,
} from "@/components/overlays";

export function PaymentEntryForm({
  hospitalSlug,
  invoices,
  defaultInvoiceId,
}: {
  hospitalSlug: string;
  invoices: Array<{
    id: string;
    invoice_number: string;
    balance_due: number;
    patient?: {
      first_name?: string | null;
      middle_name?: string | null;
      last_name?: string | null;
    } | null;
  }>;
  defaultInvoiceId?: string | null;
}) {
  const selectedInvoice =
    invoices.find((invoice) => invoice.id === defaultInvoiceId) ??
    invoices[0] ??
    null;

  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<FormData | null>(null);
  
  // Wrapper action that handles the form data confirmation flow
  async function handlePaymentAction(): Promise<{ success: boolean; error?: string }> {
    if (!pendingFormData) return { success: false, error: "No form data" };
    try {
      await createPayment(pendingFormData);
      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : "Payment failed" 
      };
    }
  }
  
  const [state, formAction, pending] = useActionState(handlePaymentAction, null);

  function handleSubmit(formData: FormData) {
    setPendingFormData(formData);
    setShowConfirm(true);
  }

  function handleConfirm() {
    formAction();
    setShowConfirm(false);
  }

  // Get form values for confirmation
  const amount = pendingFormData?.get("amount") as string;
  const method = pendingFormData?.get("method") as string;
  const reference = pendingFormData?.get("reference_number") as string;
  
  const methodLabels: Record<string, string> = {
    cash: "Cash",
    mobile_money: "Mobile Money",
    bank_transfer: "Bank Transfer",
    card: "Card",
    other: "Other",
  };

  const facts = [
    ...(selectedInvoice ? [
      { label: "Invoice", value: selectedInvoice.invoice_number, highlight: true },
      { label: "Balance Before", value: `Rs. ${Number(selectedInvoice.balance_due ?? 0).toFixed(2)}` },
    ] : []),
    ...(amount ? [{ label: "Payment Amount", value: `Rs. ${Number(amount).toFixed(2)}`, highlight: true }] : []),
    ...(method ? [{ label: "Method", value: methodLabels[method] || method }] : []),
    ...(reference ? [{ label: "Reference", value: reference }] : []),
  ];

  return (
    <>
      <form action={handleSubmit} className="space-y-5 rounded-2xl border p-4 sm:p-5">
        <input type="hidden" name="hospital_slug" value={hospitalSlug} />

        <WorkspaceSectionHeader
          title="Record Payment"
          description="Post a cashier payment against an issued or partially paid invoice."
        />

        {/* Invoice Summary Cards */}
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

        {/* Payment Details */}
        <FormSection title="Payment Details">
          <FormField label="Invoice" name="invoice_id" required>
            <select
              name="invoice_id"
              defaultValue={defaultInvoiceId ?? ""}
              required
              className="h-11 rounded-xl border bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
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
          </FormField>

          <FormGrid>
            <FormField label="Amount" name="amount" required>
              <input
                name="amount"
                type="number"
                min="0.01"
                step="0.01"
                required
                className="h-11 rounded-xl border bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              />
            </FormField>

            <FormField label="Method" name="method" required>
              <select
                name="method"
                defaultValue="cash"
                required
                className="h-11 rounded-xl border bg-background px-3 text-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="cash">Cash</option>
                <option value="mobile_money">Mobile Money</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="card">Card</option>
                <option value="other">Other</option>
              </select>
            </FormField>
          </FormGrid>
        </FormSection>

        {/* Reference Information */}
        <FormSection title="Reference Information" variant="subtle">
          <FormGrid>
            <FormField
              label="Reference Number"
              name="reference_number"
              optional
              helper="Optional transfer / card / mobile ref"
            >
              <input
                name="reference_number"
                className="h-11 rounded-xl border bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="e.g., TRX123456"
              />
            </FormField>

            <FormField
              label="Receipt Number"
              name="receipt_number"
              optional
              helper="Leave blank to auto-generate"
            >
              <input
                name="receipt_number"
                className="h-11 rounded-xl border bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
                placeholder="Auto-generated"
              />
            </FormField>
          </FormGrid>

          <FormField label="Payer Name" name="payer_name" optional>
            <input
              name="payer_name"
              className="h-11 rounded-xl border bg-background px-3 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Optional payer name"
            />
          </FormField>

          <FormField label="Notes" name="notes" optional>
            <textarea
              name="notes"
              rows={3}
              className="rounded-xl border bg-background px-3 py-2 text-sm outline-none ring-offset-background placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Optional cashier note"
            />
          </FormField>
        </FormSection>

        {state?.error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {state.error}
          </div>
        ) : null}

        <FormActionsBar>
          <SubmitButton pendingText="Recording payment...">
            Record Payment
          </SubmitButton>
        </FormActionsBar>
      </form>

      {/* Confirmation Dialog */}
      <ConfirmationModal
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="Confirm Payment?"
        description="This will record the payment and update the invoice balance."
        onConfirm={handleConfirm}
        confirmLabel="Record Payment"
        pending={pending}
      >
        <ConfirmationPanel
          title="Review Before Recording"
          severity="info"
          facts={facts}
        />
      </ConfirmationModal>
    </>
  );
}

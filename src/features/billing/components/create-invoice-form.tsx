"use client";

import { useState } from "react";
import { FileText, PlusCircle } from "lucide-react";

import { WorkspaceSectionHeader } from "@/components/layout/workspace-section-header";
import { InvoiceItemsInput, type InvoiceItemRow } from "@/features/billing/components/invoice-items-input";

type Props = {
  action: (formData: FormData) => void | Promise<void>;
  children?: React.ReactNode;
};

export function CreateInvoiceForm({ action, children }: Props) {
  const [items, setItems] = useState<InvoiceItemRow[]>([
    { description: "", quantity: 1, unit_price: 0 },
  ]);

  return (
    <form action={action} className="space-y-6 rounded-2xl border p-4 sm:p-5">
      <WorkspaceSectionHeader
        title="Create Invoice"
        description="Set the invoice context first, then add one or more charge lines before saving."
      />

      {children}

      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-muted p-2">
            <FileText className="h-4 w-4 text-muted-foreground" />
          </div>
          <WorkspaceSectionHeader
            title="Invoice Items"
            description="Add the charge lines that make up this invoice."
          />
        </div>

        <InvoiceItemsInput items={items} setItems={setItems} />
      </section>

      <div className="rounded-xl border bg-muted/30 p-4 text-sm text-muted-foreground">
        Review the patient, linked appointment or encounter, and line items before saving the invoice.
      </div>

      <button
        type="submit"
        className="inline-flex h-11 items-center rounded-xl bg-black px-4 text-sm font-medium text-white"
      >
        <PlusCircle className="mr-2 h-4 w-4" />
        Create Invoice
      </button>
    </form>
  );
}

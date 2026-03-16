"use client";

import { useState } from "react";
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
    <form action={action} className="max-w-4xl space-y-6 rounded-xl border p-6">
      {children}
      <InvoiceItemsInput items={items} setItems={setItems} />
      <button
        type="submit"
        className="inline-flex h-10 items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Create Invoice
      </button>
    </form>
  );
}

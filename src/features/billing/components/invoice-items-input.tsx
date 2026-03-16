"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type InvoiceItemRow = {
  description: string;
  quantity: number;
  unit_price: number;
};

type Props = {
  items: InvoiceItemRow[];
  setItems: React.Dispatch<React.SetStateAction<InvoiceItemRow[]>>;
};

export function InvoiceItemsInput({ items, setItems }: Props) {
  function updateItem(index: number, patch: Partial<InvoiceItemRow>) {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, ...patch } : item))
    );
  }

  function addItem() {
    setItems((prev) => [
      ...prev,
      { description: "", quantity: 1, unit_price: 0 },
    ]);
  }

  function removeItem(index: number) {
    setItems((prev) => {
      if (prev.length === 1) {
        return [{ description: "", quantity: 1, unit_price: 0 }];
      }
      return prev.filter((_, i) => i !== index);
    });
  }

  const grandTotal = items.reduce((sum, item) => {
    const qty = Number(item.quantity || 0);
    const price = Number(item.unit_price || 0);
    return sum + qty * price;
  }, 0);

  return (
    <div className="space-y-4 rounded-xl border p-4">
      <div className="space-y-1">
        <h3 className="text-base font-semibold">Invoice Items</h3>
        <p className="text-sm text-muted-foreground">
          Add each charge as a separate line item.
        </p>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => {
          const lineTotal =
            Number(item.quantity || 0) * Number(item.unit_price || 0);

          return (
            <div
              key={index}
              className="grid gap-3 rounded-lg border p-3 md:grid-cols-12"
            >
              <div className="md:col-span-5">
                <label className="mb-1 block text-sm font-medium">
                  Description
                </label>
                <Input
                  value={item.description}
                  onChange={(e) =>
                    updateItem(index, { description: e.target.value })
                  }
                  placeholder="Consultation"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">Qty</label>
                <Input
                  type="number"
                  min={1}
                  step={1}
                  value={item.quantity}
                  onChange={(e) =>
                    updateItem(index, {
                      quantity: Number(e.target.value || 0),
                    })
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">
                 Unit Price
                </label>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={item.unit_price}
                  onChange={(e) =>
                    updateItem(index, {
                      unit_price: Number(e.target.value || 0),
                    })
                  }
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium">Total</label>
                <Input value={lineTotal} readOnly />
              </div>

              <div className="flex items-end md:col-span-1">
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={() => removeItem(index)}
                >
                  Remove
                </Button>
              </div>

              <input type="hidden" name="item_description" value={item.description} readOnly />
              <input type="hidden" name="item_quantity" value={String(item.quantity)} readOnly />
              <input type="hidden" name="item_unit_price" value={String(item.unit_price)} readOnly />
            </div>
          );
        })}
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="secondary" onClick={addItem}>
          Add Item
        </Button>
      </div>

      <div className="rounded-lg bg-muted p-3 text-sm">
        <span className="font-medium">Grand Total:</span> {grandTotal}
      </div>
    </div>
  );
}


export function BillingSummaryCard({
  invoiceCount,
  totalAmount,
  amountPaid,
  balanceDue,
  cleared,
}: {
  invoiceCount: number;
  totalAmount: number;
  amountPaid: number;
  balanceDue: number;
  cleared: boolean;
}) {
  return (
    <div className="rounded-xl border p-4 space-y-2">
      <h3 className="font-semibold">Billing Summary</h3>

      <div className="grid grid-cols-2 gap-2 text-sm">
        <p>Invoices</p>
        <p>{invoiceCount}</p>

        <p>Total Billed</p>
        <p>{totalAmount.toFixed(2)}</p>

        <p>Amount Paid</p>
        <p>{amountPaid.toFixed(2)}</p>

        <p>Balance Due</p>
        <p>{balanceDue.toFixed(2)}</p>
      </div>

      <div className="pt-2">
        {cleared ? (
          <span className="px-2 py-1 text-xs rounded bg-emerald-100 text-emerald-700">
            Billing Cleared
          </span>
        ) : (
          <span className="px-2 py-1 text-xs rounded bg-amber-100 text-amber-700">
            Balance Due
          </span>
        )}
      </div>
    </div>
  );
}
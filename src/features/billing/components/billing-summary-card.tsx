import { CreditCard, ReceiptText, Wallet } from "lucide-react";

import { StatusBadge } from "@/components/layout/status-badge";
import { WorkspaceStatCard } from "@/components/layout/workspace-stat-card";

function formatAmount(value: number) {
  return value.toFixed(2);
}

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
    <section className="surface-panel p-4 sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">Billing Summary</h3>
          <p className="text-sm text-muted-foreground">
            Current invoice position for this patient admission.
          </p>
        </div>

        <StatusBadge
          label={cleared ? "Billing Cleared" : "Balance Due"}
          tone={cleared ? "success" : "warning"}
          className="px-2.5 py-1 font-medium"
        />
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <WorkspaceStatCard
          title="Total Billed"
          value={formatAmount(totalAmount)}
          description={`${invoiceCount} invoice${invoiceCount === 1 ? "" : "s"} recorded`}
          icon={<ReceiptText className="h-4 w-4" />}
        />

        <WorkspaceStatCard
          title="Amount Paid"
          value={formatAmount(amountPaid)}
          description="Payments already posted"
          icon={<Wallet className="h-4 w-4" />}
        />

        <WorkspaceStatCard
          title="Balance Due"
          value={formatAmount(balanceDue)}
          description={cleared ? "No outstanding amount remaining" : "Outstanding amount still unpaid"}
          icon={<CreditCard className="h-4 w-4" />}
          valueClassName={cleared ? undefined : "text-amber-700 dark:text-amber-400"}
        />
      </div>
    </section>
  );
}

import type { ReactNode } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type SummaryRowProps = {
  label: string;
  value: ReactNode;
  /** Make the row visually distinct for key data */
  highlight?: boolean;
  /** Optional secondary value or hint */
  secondary?: ReactNode;
  className?: string;
};

/**
 * SummaryRow - Single label/value pair for review UIs
 * 
 * Consistent treatment for:
 * - Patient info summaries
 * - Payment breakdowns
 * - Lab order summaries
 * - Discharge checklists
 * 
 * Example:
 * <SummaryRow label="Patient" value="John Doe" highlight />
 * <SummaryRow label="Total" value="Rs. 1,250.00" highlight />
 */
export function SummaryRow({
  label,
  value,
  highlight = false,
  secondary,
  className,
}: SummaryRowProps) {
  return (
    <div
      className={cn(
        "flex items-start justify-between gap-4 py-2",
        highlight && "rounded-lg bg-muted/50 px-3 py-2.5",
        className
      )}
    >
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="text-right">
        <span
          className={cn(
            "text-sm font-medium text-foreground",
            highlight && "font-semibold"
          )}
        >
          {value}
        </span>
        {secondary && (
          <div className="text-xs text-muted-foreground">{secondary}</div>
        )}
      </div>
    </div>
  );
}

export type SummaryRowGroupProps = {
  children: ReactNode;
  /** Visual separator between rows */
  dividers?: boolean;
  /** Compact mode for tight spaces */
  compact?: boolean;
  className?: string;
};

/**
 * SummaryRowGroup - Container for multiple summary rows
 * 
 * Provides consistent:
 * - Spacing between rows
 * - Optional dividers
 * - Sectioned presentation
 */
export function SummaryRowGroup({
  children,
  dividers = false,
  compact = false,
  className,
}: SummaryRowGroupProps) {
  return (
    <div
      className={cn(
        dividers && "divide-y",
        compact ? "space-y-1" : "space-y-0.5",
        className
      )}
    >
      {children}
    </div>
  );
}

export type SummaryBlockerProps = {
  message: string;
  /** Action to resolve the blocker */
  requiredAction?: string;
  className?: string;
};

/**
 * SummaryBlocker - Warning display for blocking conditions
 * 
 * Use for:
 * - Missing required fields
 * - Unpaid balances
 * - Pending approvals
 * - Unfinished checklists
 */
export function SummaryBlocker({
  message,
  requiredAction,
  className,
}: SummaryBlockerProps) {
  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30",
        className
      )}
    >
      <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
      <div>
        <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
          {message}
        </p>
        {requiredAction && (
          <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
            {requiredAction}
          </p>
        )}
      </div>
    </div>
  );
}

export type SummaryBlockerListProps = {
  blockers: Array<{ message: string; requiredAction?: string }>;
  className?: string;
};

/**
 * SummaryBlockerList - Multiple blocking conditions
 */
export function SummaryBlockerList({
  blockers,
  className,
}: SummaryBlockerListProps) {
  if (blockers.length === 0) return null;

  return (
    <div className={cn("space-y-2", className)}>
      {blockers.map((blocker, index) => (
        <SummaryBlocker
          key={index}
          message={blocker.message}
          requiredAction={blocker.requiredAction}
        />
      ))}
    </div>
  );
}

export type ConfirmationPanelProps = {
  title: string;
  children: ReactNode;
  /** Optional warning/alert content */
  alert?: ReactNode;
  /** Optional blockers preventing confirmation */
  blockers?: Array<{ message: string; requiredAction?: string }>;
  className?: string;
};

/**
 * ConfirmationPanel - Review before final action
 * 
 * Unified container for:
 * - Data summaries
 * - Warning messages
 * - Blocking conditions
 * - Final action placement
 * 
 * Example:
 * <ConfirmationPanel
 *   title="Review Transfer"
 *   alert={<Alert variant="warning">Patient is isolation</Alert>}
 *   blockers={[
 *     { message: "Bed not assigned", requiredAction: "Select target bed" }
 *   ]}
 * >
 *   <SummaryRowGroup>
 *     <SummaryRow label="From Ward" value="General" />
 *     <SummaryRow label="To Ward" value="ICU" highlight />
 *   </SummaryRowGroup>
 * </ConfirmationPanel>
 */
export function ConfirmationPanel({
  title,
  children,
  alert,
  blockers,
  className,
}: ConfirmationPanelProps) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-card p-4 shadow-sm",
        className
      )}
    >
      {/* Title */}
      <h4 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h4>

      {/* Alert */}
      {alert && <div className="mb-4">{alert}</div>}

      {/* Blockers */}
      {blockers && blockers.length > 0 && (
        <div className="mb-4">
          <SummaryBlockerList blockers={blockers} />
        </div>
      )}

      {/* Content */}
      {children}
    </div>
  );
}

export type DetailValueProps = {
  value: ReactNode;
  /** Smaller, secondary presentation */
  secondary?: ReactNode;
  /** Highlight for important values */
  highlight?: boolean;
  className?: string;
};

/**
 * DetailValue - Inline value display for tables/lists
 */
export function DetailValue({
  value,
  secondary,
  highlight = false,
  className,
}: DetailValueProps) {
  return (
    <div className={cn("text-right", className)}>
      <span
        className={cn(
          "text-sm",
          highlight ? "font-semibold text-foreground" : "text-foreground"
        )}
      >
        {value}
      </span>
      {secondary && <div className="text-xs text-muted-foreground">{secondary}</div>}
    </div>
  );
}

export type SummaryBadgeProps = {
  value: string | number;
  label?: string;
  /** Status-based coloring */
  status?: "neutral" | "success" | "warning" | "danger";
  className?: string;
};

/**
 * SummaryBadge - Compact stat display
 */
export function SummaryBadge({
  value,
  label,
  status = "neutral",
  className,
}: SummaryBadgeProps) {
  const statusStyles = {
    neutral: "bg-muted text-muted-foreground",
    success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300",
    warning: "bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300",
    danger: "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300",
  };

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className={cn(
          "rounded-md px-2 py-0.5 text-sm font-medium",
          statusStyles[status]
        )}
      >
        {value}
      </span>
      {label && <span className="text-sm text-muted-foreground">{label}</span>}
    </div>
  );
}

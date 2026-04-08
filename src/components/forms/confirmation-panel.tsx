import type { ReactNode } from "react";
import { AlertTriangle, CheckCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

export type ConfirmationPanelProps = {
  title: string;
  description?: string;
  children?: ReactNode;
  className?: string;
  /** Visual tone based on action type */
  tone?: "info" | "warning" | "danger" | "success";
  /** Optional icon override */
  icon?: ReactNode;
};

/**
 * ConfirmationPanel - Review/confirmation moment for consequential actions
 * 
 * Use for:
 * - Final discharge confirmation
 * - Dispensing completion review
 * - Payment recording confirmation
 * - Lab order completion
 * - Transfer confirmation
 * 
 * Example:
 * <ConfirmationPanel
 *   title="Ready to Finalize Discharge"
 *   description="Review the checklist status before confirming."
 *   tone="warning"
 * >
 *   <DischargeSummary />
 * </ConfirmationPanel>
 */
export function ConfirmationPanel({
  title,
  description,
  children,
  className,
  tone = "info",
  icon,
}: ConfirmationPanelProps) {
  const toneStyles = {
    info: "border-border bg-muted/40",
    warning: "border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30",
    danger: "border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30",
    success: "border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950/30",
  };

  const toneIcons = {
    info: <Info className="h-5 w-5 text-muted-foreground" />,
    warning: <AlertTriangle className="h-5 w-5 text-amber-600" />,
    danger: <AlertTriangle className="h-5 w-5 text-red-600" />,
    success: <CheckCircle className="h-5 w-5 text-emerald-600" />,
  };

  return (
    <div
      className={cn(
        "rounded-xl border p-4 sm:p-5",
        toneStyles[tone],
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">{icon ?? toneIcons[tone]}</div>
        <div className="min-w-0 flex-1 space-y-3">
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            {description && (
              <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {children && <div className="pt-1">{children}</div>}
        </div>
      </div>
    </div>
  );
}

export type KeyFactProps = {
  label: string;
  value: ReactNode;
  className?: string;
};

/**
 * KeyFact - Single fact line for confirmation summaries
 */
export function KeyFact({ label, value, className }: KeyFactProps) {
  return (
    <div className={cn("flex items-center justify-between gap-4", className)}>
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="font-medium text-foreground">{value}</span>
    </div>
  );
}

export type KeyFactsListProps = {
  facts: Array<{ label: string; value: ReactNode }>;
  className?: string;
};

/**
 * KeyFactsList - Summary of key facts before confirmation
 */
export function KeyFactsList({ facts, className }: KeyFactsListProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {facts.map((fact, index) => (
        <KeyFact key={index} label={fact.label} value={fact.value} />
      ))}
    </div>
  );
}

export type BlockerItem = {
  label: string;
  resolved?: boolean;
};

export type BlockersListProps = {
  blockers: BlockerItem[];
  className?: string;
};

/**
 * BlockersList - Shows what must be resolved before proceeding
 * 
 * Use for:
 * - Discharge checklist incomplete items
 * - Prerequisites not met
 * - Required fields missing
 */
export function BlockersList({ blockers, className }: BlockersListProps) {
  const unresolvedCount = blockers.filter((b) => !b.resolved).length;

  if (unresolvedCount === 0) return null;

  return (
    <div
      className={cn(
        "rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30",
        className
      )}
    >
      <p className="font-medium text-amber-800 dark:text-amber-300">
        {unresolvedCount} item{unresolvedCount !== 1 ? "s" : ""} blocking completion
      </p>
      <ul className="mt-2 space-y-1">
        {blockers
          .filter((b) => !b.resolved)
          .map((blocker, index) => (
            <li
              key={index}
              className="flex items-center gap-2 text-sm text-amber-700 dark:text-amber-400"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              {blocker.label}
            </li>
          ))}
      </ul>
    </div>
  );
}

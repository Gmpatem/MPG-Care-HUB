"use client";

import type { ReactNode } from "react";
import { AlertTriangle, AlertCircle, Info, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ConfirmationSeverity = "info" | "warning" | "danger" | "success";

export type ConfirmationPanelProps = {
  /** Main title of the confirmation */
  title: string;
  /** Brief description of what will happen */
  description?: string;
  /** Severity level affects visual treatment */
  severity?: ConfirmationSeverity;
  /** Key facts to display (label/value pairs) */
  facts?: Array<{
    label: string;
    value: ReactNode;
    /** Highlight this fact for emphasis */
    highlight?: boolean;
  }>;
  /** Additional custom content */
  children?: ReactNode;
  /** Blockers that prevent confirmation */
  blockers?: Array<{
    message: string;
    requiredAction?: string;
  }>;
  /** Additional warning/info message */
  alert?: ReactNode;
  className?: string;
};

const severityIcons: Record<ConfirmationSeverity, typeof AlertTriangle> = {
  info: Info,
  warning: AlertTriangle,
  danger: AlertCircle,
  success: CheckCircle2,
};

const severityStyles: Record<ConfirmationSeverity, string> = {
  info: "border-blue-200 bg-blue-50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200",
  warning:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-200",
  danger:
    "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-200",
};

const severityIconColors: Record<ConfirmationSeverity, string> = {
  info: "text-blue-600",
  warning: "text-amber-600",
  danger: "text-red-600",
  success: "text-emerald-600",
};

/**
 * ConfirmationPanel - Structured content for confirmation dialogs
 *
 * Provides consistent presentation for:
 * - Action title and description
 * - Key facts summary
 * - Blocker warnings
 * - Severity-based visual treatment
 *
 * Use inside ConfirmationModal for rich confirmations.
 *
 * Example:
 * <ConfirmationModal ...>
 *   <ConfirmationPanel
 *     title="Finalize Discharge"
 *     description="This will complete the admission and release the bed."
 *     severity="warning"
 *     facts={[
 *       { label: "Patient", value: "John Doe", highlight: true },
 *       { label: "Bed", value: "A-101" },
 *       { label: "Admission Date", value: "2024-01-15" },
 *     ]}
 *     blockers={[
 *       { message: "Outstanding balance", requiredAction: "Process payment first" }
 *     ]}
 *   />
 * </ConfirmationModal>
 */
export function ConfirmationPanel({
  title,
  description,
  severity = "info",
  facts,
  children,
  blockers,
  alert,
  className,
}: ConfirmationPanelProps) {
  const Icon = severityIcons[severity];

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header with severity indicator */}
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
            severityStyles[severity]
          )}
        >
          <Icon className={cn("h-5 w-5", severityIconColors[severity])} />
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <h3 className="font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>

      {/* Custom alert */}
      {alert && <div className="rounded-lg border p-3 text-sm">{alert}</div>}

      {/* Blockers */}
      {blockers && blockers.length > 0 && (
        <div className="space-y-2">
          {blockers.map((blocker, index) => (
            <div
              key={index}
              className="rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-900 dark:bg-amber-950/30"
            >
              <div className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                <div>
                  <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
                    {blocker.message}
                  </p>
                  {blocker.requiredAction && (
                    <p className="mt-1 text-xs text-amber-700 dark:text-amber-300">
                      {blocker.requiredAction}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Facts summary */}
      {facts && facts.length > 0 && (
        <div className="rounded-lg border bg-muted/30 p-3">
          <dl className="space-y-2">
            {facts.map((fact, index) => (
              <div
                key={index}
                className={cn(
                  "flex items-start justify-between gap-4",
                  fact.highlight && "rounded-md bg-background p-2"
                )}
              >
                <dt className="text-sm text-muted-foreground">{fact.label}</dt>
                <dd
                  className={cn(
                    "text-right text-sm",
                    fact.highlight
                      ? "font-semibold text-foreground"
                      : "text-foreground"
                  )}
                >
                  {fact.value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}

      {/* Custom content */}
      {children}
    </div>
  );
}

export type CompactConfirmationProps = {
  /** The action being confirmed */
  action: string;
  /** What is being acted upon */
  target: string;
  /** Brief consequence statement */
  consequence?: string;
  severity?: ConfirmationSeverity;
  className?: string;
};

/**
 * CompactConfirmation - Minimal confirmation for simple actions
 *
 * When you just need:
 * - "Delete [item]?"
 * - "Archive [record]?"
 * - "Complete [task]?"
 *
 * Example:
 * <ConfirmationModal ...>
 *   <CompactConfirmation
 *     action="Delete"
 *     target="Department: Cardiology"
 *     consequence="This cannot be undone."
 *     severity="danger"
 *   />
 * </ConfirmationModal>
 */
export function CompactConfirmation({
  action,
  target,
  consequence,
  severity = "info",
  className,
}: CompactConfirmationProps) {
  const Icon = severityIcons[severity];

  return (
    <div className={cn("flex items-start gap-3", className)}>
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-full",
          severityStyles[severity]
        )}
      >
        <Icon className={cn("h-5 w-5", severityIconColors[severity])} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground">
          {action} <span className="text-muted-foreground">{target}</span>?
        </p>
        {consequence && (
          <p className="mt-1 text-sm text-muted-foreground">{consequence}</p>
        )}
      </div>
    </div>
  );
}

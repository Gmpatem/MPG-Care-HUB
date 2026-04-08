import { cn } from "@/lib/utils";
import { StatusBadge, StatusTone } from "@/components/layout/status-badge";
import { ReadinessSignal, TaskStateCategory } from "@/lib/ui/task-state";
import { Progress } from "@/components/ui/progress";

export type TaskReadinessSummaryProps = {
  signal: ReadinessSignal;
  /** Optional title override */
  title?: string;
  /** Whether to show progress bar */
  showProgress?: boolean;
  /** Whether to show detail text */
  showDetail?: boolean;
  /** Compact mode for tight spaces */
  compact?: boolean;
  className?: string;
};

/**
 * TaskReadinessSummary - Display task state with context
 * 
 * Use on detail pages to show:
 * - Current task state (ready, blocked, pending, etc.)
 * - Progress indication
 * - Action guidance
 * 
 * This is for page-level readiness communication, not row-level.
 * For row-level, use TaskStateBadge or StatusBadge.
 */
export function TaskReadinessSummary({
  signal,
  title,
  showProgress = true,
  showDetail = true,
  compact = false,
  className,
}: TaskReadinessSummaryProps) {
  const displayTitle = title ?? getDefaultTitle(signal.category);

  if (compact) {
    return (
      <div className={cn("flex items-center gap-3", className)}>
        <StatusBadge
          label={signal.label}
          tone={signal.tone}
          dot
        />
        {showDetail && signal.detail && (
          <span className="text-sm text-muted-foreground">{signal.detail}</span>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border p-4",
        signal.isBlocked && "border-rose-200 bg-rose-50/50 dark:border-rose-900 dark:bg-rose-950/20",
        signal.isComplete && "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20",
        !signal.isBlocked && !signal.isComplete && "border-border bg-card",
        className
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            {displayTitle}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <StatusBadge
              label={signal.label}
              tone={signal.tone}
              dot
            />
          </div>
          {showDetail && signal.detail && (
            <p className="mt-2 text-sm text-muted-foreground">
              {signal.detail}
            </p>
          )}
        </div>
        
        {signal.progressText && (
          <div className="text-right">
            <span className="text-sm font-medium">{signal.progressText}</span>
          </div>
        )}
      </div>

      {showProgress && signal.progress !== undefined && signal.progress < 1 && (
        <div className="mt-3">
          <Progress
            value={signal.progress * 100}
            className={cn(
              "h-2",
              signal.isBlocked && "bg-rose-200",
              signal.category === "in_progress" && "bg-blue-200",
              signal.category === "partial" && "bg-amber-200"
            )}
          />
        </div>
      )}
    </div>
  );
}

function getDefaultTitle(category: TaskStateCategory): string {
  switch (category) {
    case "ready":
      return "Ready to proceed";
    case "blocked":
      return "Blocked";
    case "pending":
      return "Waiting";
    case "in_progress":
      return "In progress";
    case "partial":
      return "Partially complete";
    case "completed":
      return "Completed";
    default:
      return "Status";
  }
}

/**
 * Compact readiness row for list items
 */
export function TaskReadinessRow({
  signal,
  className,
}: {
  signal: ReadinessSignal;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <StatusBadge
        label={signal.label}
        tone={signal.tone}
        compact
        dot
      />
      {signal.progressText && (
        <span className="text-xs text-muted-foreground">
          {signal.progressText}
        </span>
      )}
    </div>
  );
}

/**
 * Blocked state alert with guidance
 */
export function BlockedStateAlert({
  reason,
  guidance,
  className,
}: {
  reason: string;
  guidance?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-rose-200 bg-rose-50/50 p-4 dark:border-rose-900 dark:bg-rose-950/20",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 h-2 w-2 rounded-full bg-rose-500" />
        <div>
          <p className="font-medium text-rose-700 dark:text-rose-300">
            Blocked: {reason}
          </p>
          {guidance && (
            <p className="mt-1 text-sm text-rose-600 dark:text-rose-400">
              {guidance}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Ready state indicator with optional action hint
 */
export function ReadyStateIndicator({
  label = "Ready",
  hint,
  className,
}: {
  label?: string;
  hint?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 dark:border-emerald-900 dark:bg-emerald-950/20",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5 h-2 w-2 rounded-full bg-emerald-500" />
        <div>
          <p className="font-medium text-emerald-700 dark:text-emerald-300">
            {label}
          </p>
          {hint && (
            <p className="mt-1 text-sm text-emerald-600 dark:text-emerald-400">
              {hint}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

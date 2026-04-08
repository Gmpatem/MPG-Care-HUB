import { cn } from "@/lib/utils";
import { TaskStateCategory } from "@/lib/ui/task-state";

export type StatusTone =
  | "neutral"
  | "info"
  | "success"
  | "warning"
  | "danger";

export type StatusBadgeProps = {
  label: string;
  tone?: StatusTone;
  className?: string;
  /** Compact size for dense UIs */
  compact?: boolean;
  /** Optional dot indicator */
  dot?: boolean;
  /** Icon before label */
  icon?: React.ReactNode;
};

const toneClasses: Record<StatusTone, string> = {
  neutral: "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800/70 dark:text-slate-200 dark:ring-slate-700",
  info: "bg-blue-100 text-blue-700 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-200 dark:ring-blue-800",
  success: "bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-200 dark:ring-emerald-800",
  warning: "bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-200 dark:ring-amber-800",
  danger: "bg-rose-100 text-rose-700 ring-rose-200 dark:bg-rose-900/30 dark:text-rose-200 dark:ring-rose-800",
};

const dotClasses: Record<StatusTone, string> = {
  neutral: "bg-slate-400",
  info: "bg-blue-500",
  success: "bg-emerald-500",
  warning: "bg-amber-500",
  danger: "bg-rose-500",
};

/**
 * StatusBadge - Consistent status display across all workspaces
 * 
 * Use for:
 * - Queue item statuses
 * - Workflow stage indicators
 * - Task completion states
 * - Blocking/pending signals
 */
export function StatusBadge({
  label,
  tone = "neutral",
  className,
  compact = false,
  dot = false,
  icon,
}: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full font-medium ring-1",
        compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs",
        toneClasses[tone],
        className
      )}
    >
      {dot && (
        <span className={cn("mr-1.5 h-1.5 w-1.5 rounded-full", dotClasses[tone])} />
      )}
      {icon && <span className="mr-1">{icon}</span>}
      {label}
    </span>
  );
}

/**
 * TaskStateBadge - Status badge that maps to task state categories
 */
export function TaskStateBadge({
  category,
  label,
  className,
  compact = false,
  showDot = true,
}: {
  category: TaskStateCategory;
  label: string;
  className?: string;
  compact?: boolean;
  showDot?: boolean;
}) {
  const tone = taskStateToTone(category);
  
  return (
    <StatusBadge
      label={label}
      tone={tone}
      className={className}
      compact={compact}
      dot={showDot}
    />
  );
}

/**
 * Map task state category to visual tone
 */
export function taskStateToTone(category: TaskStateCategory): StatusTone {
  switch (category) {
    case "ready":
      return "success";
    case "completed":
      return "success";
    case "in_progress":
      return "info";
    case "partial":
      return "warning";
    case "blocked":
      return "danger";
    case "pending":
    default:
      return "neutral";
  }
}

/**
 * Get a readable label for a task state category
 */
export function getTaskStateLabel(category: TaskStateCategory): string {
  switch (category) {
    case "ready":
      return "Ready";
    case "pending":
      return "Pending";
    case "in_progress":
      return "In Progress";
    case "blocked":
      return "Blocked";
    case "partial":
      return "Partial";
    case "completed":
      return "Completed";
    default:
      return "Unknown";
  }
}

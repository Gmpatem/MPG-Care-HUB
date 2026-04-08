import { AlertCircle, AlertTriangle, CheckCircle2, Info, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export type FeedbackTone = "error" | "success" | "info" | "warning";

export type InlineFeedbackProps = {
  message: string;
  tone?: FeedbackTone;
  className?: string;
  /** Optional title for more structured feedback */
  title?: string;
  /** Make the feedback more compact for dense UIs */
  compact?: boolean;
  /** Optional custom icon override */
  icon?: LucideIcon;
};

const toneStyles: Record<FeedbackTone, string> = {
  error:
    "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300",
  success:
    "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/30 dark:text-emerald-300",
  info:
    "border-border bg-muted/40 text-muted-foreground",
  warning:
    "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300",
};

const toneIcons: Record<FeedbackTone, LucideIcon> = {
  error: AlertCircle,
  success: CheckCircle2,
  info: Info,
  warning: AlertTriangle,
};

const toneIconColors: Record<FeedbackTone, string> = {
  error: "text-red-600",
  success: "text-emerald-600",
  info: "text-muted-foreground",
  warning: "text-amber-600",
};

/**
 * InlineFeedback - Compact feedback for forms, panels, and task surfaces
 * 
 * Use for:
 * - Success confirmations after form submission
 * - Error messages from server actions
 * - Warning about blocked or partial states
 * - Informational context
 * 
 * For page-level feedback, use RouteFeedbackBar.
 * For transient notifications, use toasts via app-toast.ts.
 */
export function InlineFeedback({
  message,
  tone = "info",
  className,
  title,
  compact = false,
  icon: CustomIcon,
}: InlineFeedbackProps) {
  const Icon = CustomIcon ?? toneIcons[tone];

  if (compact) {
    return (
      <div
        className={cn(
          "flex items-start gap-2 rounded-lg border px-3 py-2 text-xs",
          toneStyles[tone],
          className
        )}
      >
        <Icon className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", toneIconColors[tone])} />
        <div className="min-w-0 flex-1">
          {title ? <p className="font-medium">{title}</p> : null}
          <p className={title ? "mt-0.5" : ""}>{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex items-start gap-2 rounded-xl border px-4 py-3 text-sm",
        toneStyles[tone],
        className
      )}
    >
      <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", toneIconColors[tone])} />
      <div className="min-w-0 flex-1">
        {title ? <p className="font-medium">{title}</p> : null}
        <p className={title ? "mt-1 leading-5" : "leading-6"}>{message}</p>
      </div>
    </div>
  );
}

/**
 * InlineSuccess - Convenience wrapper for success messages
 */
export function InlineSuccess({ 
  message, 
  className,
  compact,
}: Omit<InlineFeedbackProps, "tone">) {
  return (
    <InlineFeedback 
      tone="success" 
      message={message} 
      className={className}
      compact={compact}
    />
  );
}

/**
 * InlineError - Convenience wrapper for error messages
 */
export function InlineError({ 
  message, 
  className,
  compact,
}: Omit<InlineFeedbackProps, "tone">) {
  return (
    <InlineFeedback 
      tone="error" 
      message={message} 
      className={className}
      compact={compact}
    />
  );
}

/**
 * InlineWarning - Convenience wrapper for warning messages
 */
export function InlineWarning({ 
  message, 
  className,
  title,
  compact,
}: Omit<InlineFeedbackProps, "tone">) {
  return (
    <InlineFeedback 
      tone="warning" 
      message={message} 
      title={title}
      className={className}
      compact={compact}
    />
  );
}

/**
 * InlineInfo - Convenience wrapper for info messages
 */
export function InlineInfo({ 
  message, 
  className,
  compact,
}: Omit<InlineFeedbackProps, "tone">) {
  return (
    <InlineFeedback 
      tone="info" 
      message={message} 
      className={className}
      compact={compact}
    />
  );
}

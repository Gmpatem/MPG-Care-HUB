import type { ReactNode } from "react";
import { Check, AlertCircle, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

export type WorkflowStepStatus = "completed" | "current" | "upcoming" | "blocked";

export type WorkflowStepCardProps = {
  step: string;
  title: string;
  description: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
  /** Step status - controls visual treatment */
  status?: WorkflowStepStatus;
  /** Optional status message (e.g., "Checklist incomplete") */
  statusMessage?: string;
  /** Compact mode for dense UIs */
  compact?: boolean;
};

/**
 * WorkflowStepCard - Step display for operational workflows
 * 
 * Supports:
 * - Completed steps (with checkmark)
 * - Current step (highlighted)
 * - Upcoming steps (muted)
 * - Blocked steps (warning treatment)
 * 
 * Use for:
 * - Admissions workflow
 * - Discharge progression
 * - Dispensing steps
 * - Lab result workflow
 * - Onboarding flows
 * 
 * Example:
 * <WorkflowStepCard
 *   step="Step 1"
 *   title="Review Admission Request"
 *   description="Verify patient and doctor details"
 *   status="completed"
 * />
 * 
 * <WorkflowStepCard
 *   step="Step 2"
 *   title="Assign Ward and Bed"
 *   description="Select available ward and bed"
 *   status="current"
 *   action={<BedSelector />}
 * />
 */
export function WorkflowStepCard({
  step,
  title,
  description,
  icon,
  action,
  className,
  status = "upcoming",
  statusMessage,
  compact = false,
}: WorkflowStepCardProps) {
  const isCompleted = status === "completed";
  const isCurrent = status === "current";
  const isUpcoming = status === "upcoming";
  const isBlocked = status === "blocked";

  const containerStyles = {
    completed:
      "border-emerald-200 bg-emerald-50/50 dark:border-emerald-900 dark:bg-emerald-950/20",
    current:
      "border-primary bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(248,250,252,0.98))] shadow-md dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.8),rgba(15,23,42,0.95))]",
    upcoming: "border-border/70 bg-background/50",
    blocked:
      "border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20",
  };

  const stepIndicatorStyles = {
    completed:
      "bg-emerald-500 text-white ring-emerald-200 dark:ring-emerald-900",
    current: "bg-primary text-primary-foreground ring-primary/30",
    upcoming: "bg-muted text-muted-foreground ring-border",
    blocked: "bg-amber-500 text-white ring-amber-200 dark:ring-amber-900",
  };

  const stepNumber = step.replace(/^step\s*/i, "");

  return (
    <div
      className={cn(
        "rounded-2xl border p-4 transition-all",
        containerStyles[status],
        isCurrent && "shadow-[0_10px_24px_rgba(15,23,42,0.08)]",
        compact && "p-3",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {/* Step indicator */}
        {icon ? (
          <div
            className={cn(
              "mt-0.5 flex shrink-0 items-center justify-center rounded-xl ring-2",
              stepIndicatorStyles[status],
              compact ? "h-9 w-9" : "h-10 w-10"
            )}
          >
            {icon}
          </div>
        ) : (
          <div
            className={cn(
              "mt-0.5 flex shrink-0 items-center justify-center rounded-xl ring-2",
              stepIndicatorStyles[status],
              compact ? "h-9 w-9" : "h-10 w-10"
            )}
          >
            {isCompleted ? (
              <Check className={cn("h-5 w-5", compact && "h-4 w-4")} />
            ) : isBlocked ? (
              <AlertCircle className={cn("h-5 w-5", compact && "h-4 w-4")} />
            ) : (
              <span
                className={cn(
                  "text-xs font-semibold uppercase tracking-[0.14em]",
                  isUpcoming && "text-muted-foreground"
                )}
              >
                {stepNumber}
              </span>
            )}
          </div>
        )}

        {/* Content */}
        <div className="min-w-0 flex-1 space-y-1.5">
          {/* Step label */}
          <p
            className={cn(
              "text-[11px] font-semibold uppercase tracking-[0.18em]",
              isCompleted && "text-emerald-600 dark:text-emerald-400",
              isCurrent && "text-primary",
              isUpcoming && "text-muted-foreground",
              isBlocked && "text-amber-600 dark:text-amber-400"
            )}
          >
            {isCompleted ? "Completed" : step}
          </p>

          {/* Title */}
          <p
            className={cn(
              "font-semibold text-foreground",
              compact ? "text-sm" : "text-base",
              isUpcoming && "text-muted-foreground"
            )}
          >
            {title}
          </p>

          {/* Description */}
          <p
            className={cn(
              "leading-6 text-muted-foreground",
              compact ? "text-xs" : "text-sm",
              isUpcoming && "opacity-70"
            )}
          >
            {description}
          </p>

          {/* Status message */}
          {statusMessage && (
            <p
              className={cn(
                "text-sm",
                isBlocked
                  ? "text-amber-700 dark:text-amber-400"
                  : "text-muted-foreground"
              )}
            >
              {statusMessage}
            </p>
          )}

          {/* Action area */}
          {action && isCurrent && (
            <div className={cn("pt-2", compact && "pt-1")}>{action}</div>
          )}
        </div>
      </div>
    </div>
  );
}

export type WorkflowStepListProps = {
  steps: Array<{
    id: string;
    step: string;
    title: string;
    description: string;
    icon?: ReactNode;
    action?: ReactNode;
    statusMessage?: string;
  }>;
  currentStepId: string;
  className?: string;
  compact?: boolean;
};

/**
 * WorkflowStepList - Vertical list of workflow steps
 * 
 * Automatically calculates status based on current step
 */
export function WorkflowStepList({
  steps,
  currentStepId,
  className,
  compact = false,
}: WorkflowStepListProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStepId);

  return (
    <div className={cn("space-y-3", className)}>
      {steps.map((step, index) => {
        let status: WorkflowStepStatus = "upcoming";
        if (index < currentIndex) status = "completed";
        else if (index === currentIndex) status = "current";

        return (
          <WorkflowStepCard
            key={step.id}
            step={step.step}
            title={step.title}
            description={step.description}
            icon={step.icon}
            action={step.action}
            status={status}
            statusMessage={step.statusMessage}
            compact={compact}
          />
        );
      })}
    </div>
  );
}

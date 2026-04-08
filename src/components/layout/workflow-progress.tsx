import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type WorkflowStep = {
  id: string;
  label: string;
  description?: string;
};

export type WorkflowProgressProps = {
  steps: WorkflowStep[];
  currentStep: string;
  className?: string;
  /** Compact mode for tight spaces */
  compact?: boolean;
  /** Show step numbers */
  showNumbers?: boolean;
};

/**
 * WorkflowProgress - Step indicator for multi-step workflows
 * 
 * Shows:
 * - Completed steps (with checkmark)
 * - Current step (highlighted)
 * - Upcoming steps (muted)
 * 
 * Use for:
 * - Admissions intake
 * - Discharge flows
 * - Staged dispensing
 * - Multi-step setup flows
 * 
 * Example:
 * <WorkflowProgress
 *   steps={[
 *     { id: "review", label: "Review Request" },
 *     { id: "assign", label: "Assign Bed" },
 *     { id: "confirm", label: "Confirm Admission" },
 *   ]}
 *   currentStep="assign"
 * />
 */
export function WorkflowProgress({
  steps,
  currentStep,
  className,
  compact = false,
  showNumbers = true,
}: WorkflowProgressProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <nav
      aria-label="Progress"
      className={cn("w-full", className)}
    >
      <ol
        className={cn(
          "flex items-start",
          compact ? "gap-2" : "gap-4"
        )}
      >
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isCurrent = index === currentIndex;
          const isUpcoming = index > currentIndex;

          return (
            <li key={step.id} className="relative flex-1">
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div
                  className={cn(
                    "absolute top-4 left-1/2 h-0.5 w-full -translate-y-1/2",
                    isCompleted ? "bg-emerald-500" : "bg-muted"
                  )}
                  aria-hidden="true"
                />
              )}

              <div className="relative flex flex-col items-center">
                {/* Step indicator */}
                <div
                  className={cn(
                    "flex items-center justify-center rounded-full border-2 font-medium transition-colors",
                    compact ? "h-8 w-8 text-xs" : "h-9 w-9 text-sm",
                    isCompleted &&
                      "border-emerald-500 bg-emerald-500 text-white",
                    isCurrent &&
                      "border-primary bg-background text-foreground ring-2 ring-primary/20",
                    isUpcoming &&
                      "border-muted bg-background text-muted-foreground"
                  )}
                >
                  {isCompleted ? (
                    <Check className={cn("h-4 w-4", compact && "h-3.5 w-3.5")} />
                  ) : (
                    showNumbers && index + 1
                  )}
                </div>

                {/* Step label */}
                <div className="mt-2 text-center">
                  <p
                    className={cn(
                      "font-medium",
                      compact ? "text-xs" : "text-sm",
                      isUpcoming ? "text-muted-foreground" : "text-foreground"
                    )}
                  >
                    {step.label}
                  </p>
                  {step.description && !compact && (
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export type WorkflowProgressCompactProps = {
  steps: WorkflowStep[];
  currentStep: string;
  className?: string;
};

/**
 * WorkflowProgressCompact - Minimal step indicator for dense UIs
 * 
 * Shows: current step / total steps with visual progress
 */
export function WorkflowProgressCompact({
  steps,
  currentStep,
  className,
}: WorkflowProgressCompactProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);
  const progress = ((currentIndex + 1) / steps.length) * 100;

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-foreground">
          {steps[currentIndex]?.label}
        </span>
        <span className="text-muted-foreground">
          Step {currentIndex + 1} of {steps.length}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted">
        <div
          className="h-full rounded-full bg-primary transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export type BlockedStepProps = {
  title?: string;
  message: string;
  className?: string;
};

/**
 * BlockedStep - Shows when a workflow step cannot proceed
 * 
 * Use for:
 * - Checklist incomplete
 * - Missing prerequisites
 * - Clearance required
 */
export function BlockedStep({
  title = "Cannot Proceed",
  message,
  className,
}: BlockedStepProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300",
        className
      )}
    >
      <p className="font-medium">{title}</p>
      <p className="mt-1 text-sm">{message}</p>
    </div>
  );
}

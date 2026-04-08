import type { ReactNode } from "react";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type FlowActionsBarProps = {
  children: ReactNode;
  className?: string;
  /** Show border for visual separation */
  bordered?: boolean;
  /** Compact mode for tight spaces */
  compact?: boolean;
};

/**
 * FlowActionsBar - Action area for staged workflow steps
 * 
 * Provides consistent:
 * - Continue/Confirm button placement
 * - Back/Cancel button placement
 * - Visual separation from step content
 * - Responsive behavior
 * 
 * Use with:
 * - Staged intake flows
 * - Multi-step dispensing
 * - Discharge progression
 * - Lab result completion
 * 
 * Example:
 * <FlowActionsBar>
 *   <FlowBackButton onClick={prevStep}>Back</FlowBackButton>
 *   <FlowContinueButton>Continue to Confirmation</FlowContinueButton>
 * </FlowActionsBar>
 */
export function FlowActionsBar({
  children,
  className,
  bordered = true,
  compact = false,
}: FlowActionsBarProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3",
        bordered && "border-t pt-4",
        compact && "gap-2 pt-3",
        className
      )}
    >
      {children}
    </div>
  );
}

export type FlowContinueButtonProps = {
  children?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  /** Final step - changes label and tone */
  final?: boolean;
  /** Optional custom label */
  label?: string;
};

/**
 * FlowContinueButton - Primary progression action in staged flows
 * 
 * Adapts label based on context:
 * - Default: "Continue"
 * - Final: "Confirm" / "Complete"
 * - Loading: Shows spinner
 */
export function FlowContinueButton({
  children,
  onClick,
  disabled = false,
  loading = false,
  className,
  final = false,
  label,
}: FlowContinueButtonProps) {
  const defaultLabel = final ? "Confirm" : "Continue";

  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn("gap-1", className)}
    >
      {loading ? (
        <>
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          {final ? "Completing..." : "Continuing..."}
        </>
      ) : (
        <>
          {label ?? children ?? defaultLabel}
          {!final && <ChevronRight className="h-4 w-4" />}
        </>
      )}
    </Button>
  );
}

export type FlowBackButtonProps = {
  children?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  /** Variant - subtle for secondary action */
  variant?: "ghost" | "outline";
};

/**
 * FlowBackButton - Secondary back action in staged flows
 * 
 * Visual treatment appropriate for secondary navigation
 */
export function FlowBackButton({
  children,
  onClick,
  disabled = false,
  className,
  variant = "ghost",
}: FlowBackButtonProps) {
  return (
    <Button
      variant={variant}
      onClick={onClick}
      disabled={disabled}
      className={cn("gap-1", className)}
    >
      <ArrowLeft className="h-4 w-4" />
      {children ?? "Back"}
    </Button>
  );
}

export type FlowCancelButtonProps = {
  children?: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

/**
 * FlowCancelButton - Cancel/abort action in staged flows
 * 
 * Quiet treatment for cancellation
 */
export function FlowCancelButton({
  children,
  onClick,
  disabled = false,
  className,
}: FlowCancelButtonProps) {
  return (
    <Button
      variant="ghost"
      onClick={onClick}
      disabled={disabled}
      className={cn("text-muted-foreground hover:text-foreground", className)}
    >
      {children ?? "Cancel"}
    </Button>
  );
}

export type FlowFinalActionProps = {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  /** Destructive action tone */
  destructive?: boolean;
};

/**
 * FlowFinalAction - Irreversible or consequential final action
 * 
 * Clear visual emphasis for:
 * - Final discharge
 * - Irreversible dispensing
 * - Payment recording
 * - Lab order completion
 */
export function FlowFinalAction({
  children,
  onClick,
  disabled = false,
  loading = false,
  className,
  destructive = false,
}: FlowFinalActionProps) {
  return (
    <Button
      variant={destructive ? "destructive" : "default"}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(className)}
    >
      {loading && (
        <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
      )}
      {children}
    </Button>
  );
}

export type StepIndicatorProps = {
  current: number;
  total: number;
  className?: string;
};

/**
 * StepIndicator - Simple "Step X of Y" text indicator
 */
export function StepIndicator({ current, total, className }: StepIndicatorProps) {
  return (
    <span className={cn("text-sm text-muted-foreground", className)}>
      Step {current} of {total}
    </span>
  );
}

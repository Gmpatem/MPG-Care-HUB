"use client";

import { AlertCircle, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type RetryPanelProps = {
  /** Main title describing what failed */
  title?: string;
  /** Description of what went wrong */
  description?: string;
  /** Retry action handler */
  onRetry?: () => void;
  /** Retry button text */
  retryLabel?: string;
  /** Optional alternative action (e.g., "Go back") */
  secondaryAction?: React.ReactNode;
  /** Visual variant */
  variant?: "full" | "compact" | "inline";
  /** Whether retry is currently in progress */
  isRetrying?: boolean;
  className?: string;
};

/**
 * RetryPanel - Clear retry affordance for failed data fetching
 * 
 * Use for:
 * - Failed page data loading
 * - Failed list/queue loading
 * - Failed detail page loading
 * - Section-level failures on compound pages
 * 
 * Features:
 * - Clear explanation of what failed
 * - Prominent retry button
 * - Calm, operational copy
 * - Compact variant for section-level failures
 * 
 * Example:
 * <RetryPanel
 *   title="Could not load patient queue"
 *   description="The connection timed out. Your data is safe."
 *   onRetry={() => refetch()}
 * />
 */
export function RetryPanel({
  title = "Could not load data",
  description = "Something went wrong while loading. Please try again.",
  onRetry,
  retryLabel = "Try Again",
  secondaryAction,
  variant = "full",
  isRetrying = false,
  className,
}: RetryPanelProps) {
  // Compact variant for section-level failures
  if (variant === "inline") {
    return (
      <div
        className={cn(
          "flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm dark:border-amber-900 dark:bg-amber-950/30",
          className
        )}
      >
        <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
        <span className="flex-1 text-amber-800 dark:text-amber-200">
          {description}
        </span>
        {onRetry && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onRetry}
            disabled={isRetrying}
            className="h-auto px-2 py-1 text-amber-700 hover:bg-amber-100 hover:text-amber-800 dark:text-amber-300 dark:hover:bg-amber-900/50"
          >
            {isRetrying ? (
              <RefreshCw className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
            )}
            {retryLabel}
          </Button>
        )}
      </div>
    );
  }

  // Compact variant for smaller spaces
  if (variant === "compact") {
    return (
      <div
        className={cn(
          "rounded-xl border border-border/80 bg-card p-4 shadow-sm",
          className
        )}
      >
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-900/30">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium">{title}</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {onRetry && (
                <Button
                  type="button"
                  size="sm"
                  onClick={onRetry}
                  disabled={isRetrying}
                >
                  {isRetrying ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <RefreshCw className="mr-2 h-4 w-4" />
                  )}
                  {retryLabel}
                </Button>
              )}
              {secondaryAction}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Full variant for page-level failures
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/80 bg-muted/20 p-8 text-center sm:p-12",
        className
      )}
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100 dark:bg-amber-900/30">
        <AlertCircle className="h-7 w-7 text-amber-600 dark:text-amber-400" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">{title}</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        {description}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {onRetry && (
          <Button
            type="button"
            onClick={onRetry}
            disabled={isRetrying}
          >
            {isRetrying ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            {retryLabel}
          </Button>
        )}
        {secondaryAction}
      </div>
    </div>
  );
}

/**
 * FailedQueueRetry - Specialized retry for queue loading failures
 */
export type FailedQueueRetryProps = {
  queueName?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
};

export function FailedQueueRetry({
  queueName = "queue",
  onRetry,
  isRetrying,
  className,
}: FailedQueueRetryProps) {
  return (
    <RetryPanel
      title={`Could not load ${queueName}`}
      description="The connection is slow or unavailable. Your data is safe. Please try again."
      onRetry={onRetry}
      retryLabel="Retry"
      isRetrying={isRetrying}
      className={className}
    />
  );
}

/**
 * FailedDetailRetry - Specialized retry for detail page loading failures
 */
export type FailedDetailRetryProps = {
  itemName?: string;
  onRetry?: () => void;
  onBack?: () => void;
  backLabel?: string;
  isRetrying?: boolean;
  className?: string;
};

export function FailedDetailRetry({
  itemName = "details",
  onRetry,
  onBack,
  backLabel = "Go Back",
  isRetrying,
  className,
}: FailedDetailRetryProps) {
  return (
    <RetryPanel
      title={`Could not load ${itemName}`}
      description="We couldn't retrieve this information right now. Please check your connection and try again."
      onRetry={onRetry}
      retryLabel="Try Again"
      isRetrying={isRetrying}
      secondaryAction={
        onBack ? (
          <Button type="button" variant="outline" onClick={onBack}>
            {backLabel}
          </Button>
        ) : undefined
      }
      className={className}
    />
  );
}

/**
 * SectionRetry - Inline retry for secondary section failures
 * 
 * Use when a non-critical section fails but the main content loaded
 */
export type SectionRetryProps = {
  description?: string;
  onRetry?: () => void;
  isRetrying?: boolean;
  className?: string;
};

export function SectionRetry({
  description = "Could not load this section",
  onRetry,
  isRetrying,
  className,
}: SectionRetryProps) {
  return (
    <RetryPanel
      variant="inline"
      description={description}
      onRetry={onRetry}
      retryLabel="Retry"
      isRetrying={isRetrying}
      className={className}
    />
  );
}

"use client";

import { useEffect, useState } from "react";
import { Loader2, WifiOff } from "lucide-react";
import { cn } from "@/lib/utils";

export type LoadingState = "loading" | "slow" | "offline" | "error";

export type LoadingStatePanelProps = {
  /** Current loading state */
  state?: LoadingState;
  /** What is being loaded (e.g., "patient queue", "lab orders") */
  subject?: string;
  /** Threshold in ms before showing slow state (default: 3000) */
  slowThreshold?: number;
  /** Threshold in ms before showing offline concern (default: 10000) */
  offlineThreshold?: number;
  /** Whether to show the skeleton UI */
  showSkeleton?: boolean;
  /** Custom skeleton component */
  skeleton?: React.ReactNode;
  /** Callback when retry is requested */
  onRetry?: () => void;
  className?: string;
};

/**
 * LoadingStatePanel - Adaptive loading panel with state escalation
 * 
 * Use for:
 * - Page-level loading with clear progress indication
 * - List/queue loading with slow escalation
 * - Detail page loading
 * 
 * Features:
 * - Starts with simple "Loading..."
 * - Escalates to "Still loading..." after threshold
 * - Can show offline concern after extended delay
 * - Maintains layout stability
 * - Clear, calm copy throughout
 * 
 * Example:
 * <LoadingStatePanel
 *   subject="patient queue"
 *   showSkeleton={<QueueSkeleton />}
 * />
 */
export function LoadingStatePanel({
  state,
  subject = "data",
  slowThreshold = 3000,
  offlineThreshold = 10000,
  showSkeleton = true,
  skeleton,
  onRetry,
  className,
}: LoadingStatePanelProps) {
  const [loadingState, setLoadingState] = useState<LoadingState>(state || "loading");
  const [elapsed, setElapsed] = useState(0);

  // Auto-escalate if state is not controlled
  useEffect(() => {
    if (state) {
      setLoadingState(state);
      return;
    }

    const startTime = Date.now();
    
    const interval = window.setInterval(() => {
      const elapsedMs = Date.now() - startTime;
      setElapsed(elapsedMs);

      if (elapsedMs > offlineThreshold && navigator.onLine === false) {
        setLoadingState("offline");
      } else if (elapsedMs > slowThreshold) {
        setLoadingState("slow");
      }
    }, 500);

    return () => window.clearInterval(interval);
  }, [state, slowThreshold, offlineThreshold]);

  const messages = {
    loading: `Loading ${subject}...`,
    slow: `Still loading ${subject}. Network may be slow...`,
    offline: `Unable to load ${subject}. Please check your connection.`,
    error: `Could not load ${subject}.`,
  };

  const icons = {
    loading: <Loader2 className="h-5 w-5 animate-spin text-primary" />,
    slow: <Loader2 className="h-5 w-5 animate-spin text-amber-500" />,
    offline: <WifiOff className="h-5 w-5 text-red-500" />,
    error: <WifiOff className="h-5 w-5 text-red-500" />,
  };

  return (
    <div
      className={cn(
        "space-y-4",
        className
      )}
    >
      {/* Status indicator */}
      <div
        className={cn(
          "flex items-center gap-3 rounded-xl border px-4 py-3",
          loadingState === "loading" && "border-border bg-muted/30",
          loadingState === "slow" && "border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20",
          (loadingState === "offline" || loadingState === "error") && "border-red-200 bg-red-50/50 dark:border-red-900 dark:bg-red-950/20"
        )}
      >
        {icons[loadingState]}
        <div className="flex-1">
          <p
            className={cn(
              "text-sm font-medium",
              loadingState === "loading" && "text-foreground",
              loadingState === "slow" && "text-amber-700 dark:text-amber-300",
              (loadingState === "offline" || loadingState === "error") && "text-red-700 dark:text-red-300"
            )}
          >
            {messages[loadingState]}
          </p>
          {loadingState === "slow" && (
            <p className="text-xs text-muted-foreground">
              Taking longer than usual. Please wait...
            </p>
          )}
          {(loadingState === "offline" || loadingState === "error") && onRetry && (
            <button
              type="button"
              onClick={onRetry}
              className="mt-1 text-sm font-medium text-red-700 underline-offset-2 hover:underline dark:text-red-300"
            >
              Try again
            </button>
          )}
        </div>
      </div>

      {/* Skeleton placeholder */}
      {showSkeleton && (
        <div className="opacity-50">
          {skeleton || <DefaultSkeleton />}
        </div>
      )}
    </div>
  );
}

function DefaultSkeleton() {
  return (
    <div className="space-y-3">
      <div className="h-16 rounded-xl border border-border/60 bg-muted/50" />
      <div className="h-16 rounded-xl border border-border/60 bg-muted/50" />
      <div className="h-16 rounded-xl border border-border/60 bg-muted/50" />
    </div>
  );
}

/**
 * SectionLoadingState - Loading state for secondary page sections
 * 
 * Use when a section of a page is loading independently
 */
export type SectionLoadingStateProps = {
  subject?: string;
  /** Compact mode for tight spaces */
  compact?: boolean;
  className?: string;
};

export function SectionLoadingState({
  subject,
  compact = false,
  className,
}: SectionLoadingStateProps) {
  if (compact) {
    return (
      <div className={cn("flex items-center gap-2 py-2 text-sm text-muted-foreground", className)}>
        <Loader2 className="h-4 w-4 animate-spin" />
        {subject ? `Loading ${subject}...` : "Loading..."}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 py-8",
        className
      )}
    >
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      <p className="mt-3 text-sm text-muted-foreground">
        {subject ? `Loading ${subject}...` : "Loading..."}
      </p>
    </div>
  );
}

/**
 * SkeletonList - Stable skeleton for list loading
 * 
 * Maintains consistent height to prevent layout shift
 */
export type SkeletonListProps = {
  rows?: number;
  rowHeight?: number;
  className?: string;
};

export function SkeletonList({
  rows = 3,
  rowHeight = 64,
  className,
}: SkeletonListProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="rounded-xl border border-border/60 bg-muted/40"
          style={{ height: rowHeight }}
        />
      ))}
    </div>
  );
}

/**
 * DelayedLoadingSpinner - Shows only after a delay to prevent flash
 * 
 * Use for inline loading indicators to prevent jarring flashes
 */
export type DelayedLoadingSpinnerProps = {
  /** Delay in ms before showing (default: 300) */
  delay?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
};

export function DelayedLoadingSpinner({
  delay = 300,
  size = "md",
  className,
}: DelayedLoadingSpinnerProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setShow(true), delay);
    return () => window.clearTimeout(timer);
  }, [delay]);

  if (!show) return null;

  const sizes = {
    sm: "h-4 w-4",
    md: "h-5 w-5",
    lg: "h-6 w-6",
  };

  return (
    <Loader2 className={cn("animate-spin text-muted-foreground", sizes[size], className)} />
  );
}

/**
 * useLoadingState - Hook for managing loading state with escalation
 * 
 * Returns current state and time-based escalation
 */
export function useLoadingState(
  isLoading: boolean,
  isError: boolean,
  options?: {
    slowThreshold?: number;
    offlineThreshold?: number;
  }
) {
  const { slowThreshold = 3000, offlineThreshold = 10000 } = options || {};
  const [state, setState] = useState<LoadingState>(isError ? "error" : "loading");

  useEffect(() => {
    if (!isLoading) {
      setState(isError ? "error" : "loading");
      return;
    }

    if (isError) {
      setState("error");
      return;
    }

    setState("loading");
    const startTime = Date.now();

    const interval = window.setInterval(() => {
      const elapsed = Date.now() - startTime;

      if (elapsed > offlineThreshold && !navigator.onLine) {
        setState("offline");
      } else if (elapsed > slowThreshold) {
        setState("slow");
      }
    }, 500);

    return () => window.clearInterval(interval);
  }, [isLoading, isError, slowThreshold, offlineThreshold]);

  return state;
}

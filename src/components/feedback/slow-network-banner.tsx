"use client";

import { useEffect, useState } from "react";
import { WifiOff, AlertTriangle, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type SlowNetworkBannerProps = {
  /** Whether the network is currently slow */
  isSlow?: boolean;
  /** Whether the connection appears to be offline */
  isOffline?: boolean;
  /** Custom message override */
  message?: string;
  /** Whether to show the loading spinner */
  showSpinner?: boolean;
  /** Callback when user clicks to retry/check connection */
  onCheck?: () => void;
  className?: string;
};

/**
 * SlowNetworkBanner - Compact banner for slow/degraded network conditions
 * 
 * Use for:
 * - Indicating slow loading in progress
 * - Warning about degraded connection
 * - Informing users about offline state
 * 
 * Features:
 * - Subtle but visible indication
 * - Calm, non-alarming copy
 * - Optional retry/check action
 * - Auto-dismiss when condition clears
 * 
 * Example:
 * <SlowNetworkBanner isSlow={loadingTime > 3000} />
 * <SlowNetworkBanner isOffline={!navigator.onLine} />
 */
export function SlowNetworkBanner({
  isSlow,
  isOffline,
  message,
  showSpinner = true,
  onCheck,
  className,
}: SlowNetworkBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isSlow || isOffline) {
      setVisible(true);
    } else {
      // Delay hiding to prevent flickering
      const timer = window.setTimeout(() => setVisible(false), 500);
      return () => window.clearTimeout(timer);
    }
  }, [isSlow, isOffline]);

  if (!visible) return null;

  const isOfflineState = isOffline;
  const isSlowState = isSlow && !isOffline;

  const defaultMessage = isOfflineState
    ? "You appear to be offline. Changes may not save until you reconnect."
    : "Connection is slow. Still loading...";

  const displayMessage = message || defaultMessage;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border px-3 py-2 text-sm",
        isOfflineState
          ? "border-red-200 bg-red-50 text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300"
          : "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300",
        className
      )}
    >
      {showSpinner && isSlowState ? (
        <Loader2 className="h-4 w-4 shrink-0 animate-spin" />
      ) : (
        <WifiOff className="h-4 w-4 shrink-0" />
      )}
      <span className="flex-1">{displayMessage}</span>
      {onCheck && (
        <button
          type="button"
          onClick={onCheck}
          className="shrink-0 font-medium underline-offset-2 hover:underline"
        >
          Check
        </button>
      )}
    </div>
  );
}

/**
 * SlowNetworkHint - Minimal hint for slow loading contexts
 * 
 * Use inline within loading states or near slow operations
 */
export type SlowNetworkHintProps = {
  /** Loading duration in ms - show after this threshold */
  loadingDuration?: number;
  /** Threshold in ms before showing (default: 3000) */
  threshold?: number;
  className?: string;
};

export function SlowNetworkHint({
  loadingDuration,
  threshold = 3000,
  className,
}: SlowNetworkHintProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (loadingDuration === undefined) {
      // If no duration provided, show after threshold
      const timer = window.setTimeout(() => setShow(true), threshold);
      return () => window.clearTimeout(timer);
    }
    setShow(loadingDuration > threshold);
  }, [loadingDuration, threshold]);

  if (!show) return null;

  return (
    <p
      className={cn(
        "flex items-center gap-1.5 text-xs text-muted-foreground",
        className
      )}
    >
      <Loader2 className="h-3 w-3 animate-spin" />
      Still loading. Network may be slow.
    </p>
  );
}

/**
 * ConnectionStatus - Small status indicator for connection state
 * 
 * Use in headers, sidebars, or action bars to show connection health
 */
export type ConnectionStatusProps = {
  /** Force a specific state (otherwise auto-detected) */
  state?: "online" | "slow" | "offline";
  /** Size variant */
  size?: "sm" | "md";
  className?: string;
};

export function ConnectionStatus({
  state,
  size = "sm",
  className,
}: ConnectionStatusProps) {
  const [detectedState, setDetectedState] = useState<"online" | "slow" | "offline">("online");
  const effectiveState = state || detectedState;

  useEffect(() => {
    if (state) return; // Don't auto-detect if state is controlled

    const checkConnection = () => {
      if (!navigator.onLine) {
        setDetectedState("offline");
      } else {
        // Could add more sophisticated detection here
        setDetectedState("online");
      }
    };

    checkConnection();
    window.addEventListener("online", checkConnection);
    window.addEventListener("offline", checkConnection);

    return () => {
      window.removeEventListener("online", checkConnection);
      window.removeEventListener("offline", checkConnection);
    };
  }, [state]);

  const styles = {
    online: "bg-emerald-500",
    slow: "bg-amber-500",
    offline: "bg-red-500",
  };

  const sizes = {
    sm: "h-2 w-2",
    md: "h-2.5 w-2.5",
  };

  return (
    <span
      className={cn(
        "inline-block rounded-full",
        sizes[size],
        styles[effectiveState],
        className
      )}
      title={`Connection: ${effectiveState}`}
    />
  );
}

/**
 * OfflineBanner - Prominent banner for when connection is lost
 * 
 * Use at page level when offline state is detected
 */
export type OfflineBannerProps = {
  /** Whether to show the banner */
  isOffline?: boolean;
  /** Custom message */
  message?: string;
  /** When the last successful sync occurred */
  lastSyncAt?: Date;
  className?: string;
};

export function OfflineBanner({
  isOffline,
  message = "You are currently offline. Changes will sync when you reconnect.",
  lastSyncAt,
  className,
}: OfflineBannerProps) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOffline) {
      setVisible(true);
    } else {
      const timer = window.setTimeout(() => setVisible(false), 1000);
      return () => window.clearTimeout(timer);
    }
  }, [isOffline]);

  if (!visible) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-3 border-b border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-300",
        className
      )}
    >
      <WifiOff className="h-5 w-5 shrink-0" />
      <div className="flex-1">
        <p className="font-medium">{message}</p>
        {lastSyncAt && (
          <p className="mt-0.5 text-xs opacity-80">
            Last synced: {lastSyncAt.toLocaleTimeString()}
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * DataStaleBanner - Warns when displayed data may be stale
 * 
 * Use when data failed to refresh but cached/old data is still shown
 */
export type DataStaleBannerProps = {
  /** Whether to show the banner */
  isStale?: boolean;
  /** Description of what data is stale */
  dataDescription?: string;
  /** When the data was last successfully fetched */
  lastUpdatedAt?: Date;
  onRefresh?: () => void;
  className?: string;
};

export function DataStaleBanner({
  isStale,
  dataDescription = "This data",
  lastUpdatedAt,
  onRefresh,
  className,
}: DataStaleBannerProps) {
  if (!isStale) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300",
        className
      )}
    >
      <AlertTriangle className="h-4 w-4 shrink-0" />
      <span className="flex-1">
        {dataDescription} may be outdated
        {lastUpdatedAt && (
          <span className="opacity-80">
            {" "}
            (last updated {lastUpdatedAt.toLocaleTimeString()})
          </span>
        )}
      </span>
      {onRefresh && (
        <button
          type="button"
          onClick={onRefresh}
          className="shrink-0 font-medium underline-offset-2 hover:underline"
        >
          Refresh
        </button>
      )}
    </div>
  );
}

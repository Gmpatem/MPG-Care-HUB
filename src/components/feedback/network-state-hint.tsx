"use client";

import { useEffect, useState } from "react";
import { Wifi, WifiOff, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type NetworkState = "online" | "offline" | "slow" | "recovering";

export type NetworkStateHintProps = {
  /** Current network state (auto-detected if not provided) */
  state?: NetworkState;
  /** Compact inline style vs larger panel */
  variant?: "inline" | "panel" | "dot";
  /** Whether to show a reconnecting state */
  showReconnecting?: boolean;
  className?: string;
};

/**
 * NetworkStateHint - Subtle hint about current network connectivity
 * 
 * Use for:
 * - Inline network status in forms
 * - Contextual hints near save actions
 * - Status indicators in headers/sidebars
 * 
 * Features:
 * - Auto-detects online/offline state
 * - Shows recovering state when coming back online
 * - Minimal visual footprint
 * 
 * Example:
 * <NetworkStateHint variant="inline" />
 * <NetworkStateHint state="slow" variant="panel" />
 */
export function NetworkStateHint({
  state: controlledState,
  variant = "inline",
  showReconnecting = true,
  className,
}: NetworkStateHintProps) {
  const [detectedState, setDetectedState] = useState<NetworkState>("online");
  const [wasOffline, setWasOffline] = useState(false);

  const state = controlledState || detectedState;

  useEffect(() => {
    if (controlledState) return;

    const handleOnline = () => {
      if (wasOffline && showReconnecting) {
        setDetectedState("recovering");
        setTimeout(() => setDetectedState("online"), 2000);
      } else {
        setDetectedState("online");
      }
      setWasOffline(false);
    };

    const handleOffline = () => {
      setDetectedState("offline");
      setWasOffline(true);
    };

    // Initial check
    if (!navigator.onLine) {
      handleOffline();
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [controlledState, wasOffline, showReconnecting]);

  // Dot variant - minimal indicator
  if (variant === "dot") {
    const dotColors = {
      online: "bg-emerald-500",
      recovering: "bg-amber-400 animate-pulse",
      slow: "bg-amber-500",
      offline: "bg-red-500",
    };

    return (
      <span
        className={cn(
          "inline-block h-2 w-2 rounded-full",
          dotColors[state],
          className
        )}
        title={`Network: ${state}`}
      />
    );
  }

  // Inline variant - text with icon
  if (variant === "inline") {
    const inlineStyles = {
      online: { icon: CheckCircle2, class: "text-emerald-600", text: "Online" },
      recovering: { icon: Wifi, class: "text-amber-500 animate-pulse", text: "Reconnecting..." },
      slow: { icon: AlertCircle, class: "text-amber-500", text: "Slow connection" },
      offline: { icon: WifiOff, class: "text-red-500", text: "Offline" },
    };

    const { icon: Icon, class: iconClass, text } = inlineStyles[state];

    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-xs",
          iconClass,
          className
        )}
      >
        <Icon className="h-3.5 w-3.5" />
        {text}
      </span>
    );
  }

  // Panel variant - more prominent for important contexts
  const panelStyles = {
    online: {
      border: "border-emerald-200",
      bg: "bg-emerald-50",
      text: "text-emerald-700",
      icon: CheckCircle2,
      iconClass: "text-emerald-500",
      title: "Connected",
      description: "Your changes will save normally.",
    },
    recovering: {
      border: "border-amber-200",
      bg: "bg-amber-50",
      text: "text-amber-700",
      icon: Wifi,
      iconClass: "text-amber-500 animate-pulse",
      title: "Reconnecting...",
      description: "Connection restored. Syncing...",
    },
    slow: {
      border: "border-amber-200",
      bg: "bg-amber-50",
      text: "text-amber-700",
      icon: AlertCircle,
      iconClass: "text-amber-500",
      title: "Slow Connection",
      description: "Saves may take longer than usual.",
    },
    offline: {
      border: "border-red-200",
      bg: "bg-red-50",
      text: "text-red-700",
      icon: WifiOff,
      iconClass: "text-red-500",
      title: "Offline",
      description: "Changes cannot be saved until you reconnect.",
    },
  };

  const style = panelStyles[state];
  const Icon = style.icon;

  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border px-4 py-3",
        style.border,
        style.bg,
        className
      )}
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", style.iconClass)} />
      <div>
        <p className={cn("font-medium", style.text)}>{style.title}</p>
        <p className={cn("text-sm opacity-90", style.text)}>{style.description}</p>
      </div>
    </div>
  );
}

/**
 * SaveStateHint - Contextual hint for save operations
 * 
 * Shows appropriate messaging based on network state during saves
 */
export type SaveStateHintProps = {
  /** Current save state */
  saveState: "idle" | "pending" | "success" | "error";
  /** Current network state */
  networkState?: NetworkState;
  /** Whether to show network hints during pending */
  showNetworkHint?: boolean;
  className?: string;
};

export function SaveStateHint({
  saveState,
  networkState = "online",
  showNetworkHint = true,
  className,
}: SaveStateHintProps) {
  if (saveState === "idle") return null;

  const hints = {
    pending: {
      text: networkState === "slow" 
        ? "Saving... Connection is slow."
        : "Saving...",
      class: "text-muted-foreground",
    },
    success: {
      text: "Saved successfully",
      class: "text-emerald-600",
    },
    error: {
      text: networkState === "offline"
        ? "Could not save. You appear to be offline."
        : "Could not save. Please try again.",
      class: "text-red-600",
    },
  };

  const hint = hints[saveState];

  return (
    <span
      className={cn(
        "text-sm",
        hint.class,
        className
      )}
    >
      {hint.text}
    </span>
  );
}

/**
 * PendingSaveIndicator - Shows pending save state with network awareness
 * 
 * Use in action bars near save/submit buttons
 */
export type PendingSaveIndicatorProps = {
  isPending: boolean;
  networkState?: NetworkState;
  className?: string;
};

export function PendingSaveIndicator({
  isPending,
  networkState = "online",
  className,
}: PendingSaveIndicatorProps) {
  if (!isPending) return null;

  return (
    <div
      className={cn(
        "flex items-center gap-2 text-sm",
        networkState === "slow" ? "text-amber-600" : "text-muted-foreground",
        className
      )}
    >
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-current" />
      </span>
      {networkState === "slow" ? "Saving... (slow connection)" : "Saving..."}
    </div>
  );
}

/**
 * useNetworkState - Hook for tracking network state
 * 
 * Returns current state and provides callbacks for state changes
 */
export function useNetworkState() {
  const [state, setState] = useState<NetworkState>("online");
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      if (wasOffline) {
        setState("recovering");
        setTimeout(() => setState("online"), 2000);
      } else {
        setState("online");
      }
      setWasOffline(false);
    };

    const handleOffline = () => {
      setState("offline");
      setWasOffline(true);
    };

    // Initial check
    if (!navigator.onLine) {
      handleOffline();
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [wasOffline]);

  return {
    state,
    isOnline: state === "online" || state === "recovering",
    isOffline: state === "offline",
    isRecovering: state === "recovering",
  };
}

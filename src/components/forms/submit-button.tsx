"use client";

import { useFormStatus } from "react-dom";
import { Loader2, WifiOff, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type SubmitButtonProps = {
  children: React.ReactNode;
  /** Text shown while pending (default: "Saving...") */
  pendingText?: string;
  className?: string;
  /** Visual variant (default: "default") */
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  /** Button size (default: "default") */
  size?: "default" | "sm" | "lg" | "icon";
  /** Make button full width */
  fullWidth?: boolean;
  /** Show loading icon while pending */
  showLoadingIcon?: boolean;
  /** Disabled state (independent of pending) */
  disabled?: boolean;
  /** Optional icon to show before text */
  icon?: React.ReactNode;
  /** Optional icon to show when pending */
  pendingIcon?: React.ReactNode;
  /** Network state for contextual messaging */
  networkState?: "online" | "slow" | "offline";
  /** Show network-aware hint below button */
  showNetworkHint?: boolean;
};

/**
 * SubmitButton - Standardized submit button with pending state
 * 
 * Automatically integrates with React 19 form actions to show:
 * - Loading state while form is submitting
 * - Disabled state during submission
 * - Customizable pending text and icons
 * - Network-aware messaging for slow/offline states
 * 
 * Example:
 * <SubmitButton>Save Patient</SubmitButton>
 * <SubmitButton pendingText="Creating invoice..." variant="secondary">Create Invoice</SubmitButton>
 * <SubmitButton fullWidth showLoadingIcon icon={<SaveIcon />}>Save Changes</SubmitButton>
 */
export function SubmitButton({
  children,
  pendingText = "Saving...",
  className,
  variant = "default",
  size = "default",
  fullWidth = false,
  showLoadingIcon = true,
  disabled = false,
  icon,
  pendingIcon,
  networkState = "online",
  showNetworkHint = false,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  // Network-aware pending text
  const getPendingText = () => {
    if (pendingText !== "Saving...") return pendingText;
    if (networkState === "slow") return "Saving... (slow connection)";
    if (networkState === "offline") return "Waiting for connection...";
    return pendingText;
  };

  return (
    <div className={cn(fullWidth && "w-full")}>
      <Button
        type="submit"
        disabled={isDisabled}
        variant={variant}
        size={size}
        className={cn(
          fullWidth && "w-full",
          // Visual indication for offline state
          networkState === "offline" && !pending && "border-amber-300 bg-amber-50 text-amber-700 hover:bg-amber-100",
          className
        )}
      >
        {pending && showLoadingIcon ? (
          <>
            {pendingIcon ?? <Loader2 className={cn("mr-2 h-4 w-4", networkState === "slow" && "text-amber-500")} />}
            {getPendingText()}
          </>
        ) : pending ? (
          getPendingText()
        ) : networkState === "offline" ? (
          <>
            <WifiOff className="mr-2 h-4 w-4" />
            {children}
          </>
        ) : (
          <>
            {icon && <span className="mr-2">{icon}</span>}
            {children}
          </>
        )}
      </Button>
      
      {/* Network hint for pending state */}
      {showNetworkHint && pending && networkState === "slow" && (
        <p className="mt-1.5 text-xs text-amber-600">
          Connection is slow. Please don&apos;t close this page.
        </p>
      )}
    </div>
  );
}

/**
 * CompactSubmitButton - Smaller submit button for dense forms
 * 
 * Use for:
 * - Inline forms
 * - Table row actions
 * - Dense admin interfaces
 */
export function CompactSubmitButton({
  children,
  pendingText = "...",
  className,
  disabled = false,
  networkState = "online",
}: Omit<SubmitButtonProps, "size" | "variant" | "showLoadingIcon">) {
  return (
    <SubmitButton
      size="sm"
      pendingText={pendingText}
      className={className}
      disabled={disabled}
      networkState={networkState}
    >
      {children}
    </SubmitButton>
  );
}

/**
 * DestructiveSubmitButton - For delete/remove actions
 * 
 * Use for:
 * - Delete confirmations
 * - Remove actions
 * - Irreversible operations
 */
export function DestructiveSubmitButton({
  children,
  pendingText = "Removing...",
  className,
  disabled = false,
  networkState = "online",
}: Omit<SubmitButtonProps, "variant" | "showLoadingIcon">) {
  return (
    <SubmitButton
      variant="destructive"
      pendingText={pendingText}
      className={className}
      disabled={disabled}
      networkState={networkState}
      showLoadingIcon
    >
      {children}
    </SubmitButton>
  );
}

/**
 * AsyncActionButton - Generic async action button with loading states
 * 
 * Use outside of forms for async operations
 */
export type AsyncActionButtonProps = {
  children: React.ReactNode;
  onClick: () => void | Promise<void>;
  isLoading?: boolean;
  loadingText?: string;
  variant?: "default" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "lg";
  disabled?: boolean;
  className?: string;
  networkState?: "online" | "slow" | "offline";
};

export function AsyncActionButton({
  children,
  onClick,
  isLoading = false,
  loadingText = "Working...",
  variant = "default",
  size = "default",
  disabled = false,
  className,
  networkState = "online",
}: AsyncActionButtonProps) {
  const isDisabled = isLoading || disabled;

  const getLoadingText = () => {
    if (networkState === "slow") return `${loadingText} (slow)`;
    return loadingText;
  };

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      disabled={isDisabled}
      onClick={onClick}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className={cn("mr-2 h-4 w-4 animate-spin", networkState === "slow" && "text-amber-500")} />
          {getLoadingText()}
        </>
      ) : networkState === "offline" ? (
        <>
          <WifiOff className="mr-2 h-4 w-4" />
          {children}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

/**
 * RetrySubmitButton - Button that shows retry state after failure
 * 
 * Use when form submission failed and can be retried
 */
export type RetrySubmitButtonProps = {
  children: React.ReactNode;
  onRetry: () => void;
  isRetrying?: boolean;
  error?: string;
  variant?: "default" | "secondary" | "outline";
  size?: "default" | "sm" | "lg";
  className?: string;
};

export function RetrySubmitButton({
  children,
  onRetry,
  isRetrying = false,
  error,
  variant = "outline",
  size = "default",
  className,
}: RetrySubmitButtonProps) {
  return (
    <div className={className}>
      {error && (
        <div className="mb-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}
      <Button
        type="button"
        variant={variant}
        size={size}
        onClick={onRetry}
        disabled={isRetrying}
        className="w-full"
      >
        {isRetrying ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Retrying...
          </>
        ) : (
          <>
            <Loader2 className="mr-2 h-4 w-4" />
            {children}
          </>
        )}
      </Button>
    </div>
  );
}

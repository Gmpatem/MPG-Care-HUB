"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";
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
};

/**
 * SubmitButton - Standardized submit button with pending state
 * 
 * Automatically integrates with React 19 form actions to show:
 * - Loading state while form is submitting
 * - Disabled state during submission
 * - Customizable pending text and icons
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
  showLoadingIcon = false,
  disabled = false,
  icon,
  pendingIcon,
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  const isDisabled = pending || disabled;

  return (
    <Button
      type="submit"
      disabled={isDisabled}
      variant={variant}
      size={size}
      className={cn(fullWidth && "w-full", className)}
    >
      {pending && showLoadingIcon ? (
        <>
          {pendingIcon ?? <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {pendingText}
        </>
      ) : pending ? (
        pendingText
      ) : (
        <>
          {icon && <span className="mr-2">{icon}</span>}
          {children}
        </>
      )}
    </Button>
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
}: Omit<SubmitButtonProps, "size" | "variant">) {
  return (
    <SubmitButton
      size="sm"
      pendingText={pendingText}
      className={className}
      disabled={disabled}
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
}: Omit<SubmitButtonProps, "variant">) {
  return (
    <SubmitButton
      variant="destructive"
      pendingText={pendingText}
      className={className}
      disabled={disabled}
    >
      {children}
    </SubmitButton>
  );
}

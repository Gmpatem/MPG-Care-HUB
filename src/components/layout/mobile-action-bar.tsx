"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * MobileActionBar - Sticky bottom action bar for mobile workflows
 * 
 * Use for:
 * - Primary action placement within thumb reach on mobile
 * - Form submit actions that should stay visible
 * - Workflow continuation actions
 * 
 * Features:
 * - Sticky positioning on mobile (bottom of viewport)
 * - Safe area inset support for notched devices
 * - Visual separation with backdrop blur
 * - Automatic desktop hiding (inline rendering only)
 * 
 * Example:
 * <MobileActionBar
 *   primaryAction={<Button>Save</Button>}
 *   secondaryAction={<Button variant="outline">Cancel</Button>}
 * />
 */

export type MobileActionBarProps = {
  /** Primary action - rendered prominently (e.g., Submit, Continue, Save) */
  primaryAction: ReactNode;
  /** Secondary action - rendered with less emphasis (e.g., Cancel, Back) */
  secondaryAction?: ReactNode;
  /** Additional context or hint text */
  hint?: string;
  /** Force show on desktop (default: mobile only) */
  showOnDesktop?: boolean;
  /** Position variant */
  position?: "fixed" | "sticky";
  className?: string;
};

export function MobileActionBar({
  primaryAction,
  secondaryAction,
  hint,
  showOnDesktop = false,
  position = "fixed",
  className,
}: MobileActionBarProps) {
  return (
    <div
      className={cn(
        // Container positioning
        position === "fixed" && "fixed inset-x-0 bottom-0 z-40",
        position === "sticky" && "sticky bottom-0 z-40",
        
        // Visual styling
        "border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        
        // Safe area support for notched devices
        "pb-[env(safe-area-inset-bottom)]",
        
        // Responsive visibility
        !showOnDesktop && "lg:hidden",
        
        className
      )}
    >
      <div className="flex items-center gap-3 px-4 py-3">
        {secondaryAction && (
          <div className="shrink-0">{secondaryAction}</div>
        )}
        <div className="min-w-0 flex-1">{primaryAction}</div>
      </div>
      {hint && (
        <p className="px-4 pb-2 text-center text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}

/**
 * MobileActionButton - Action button optimized for mobile thumb reach
 * 
 * Use for:
 * - Primary actions that need to be easily tappable
 * - Quick actions in mobile-optimized workflows
 * 
 * Features:
 * - Larger touch target (min 48px)
 * - Full-width on mobile for easy reach
 * - Visual prominence
 */
export type MobileActionButtonProps = {
  children: ReactNode;
  variant?: "primary" | "secondary" | "outline";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
};

export function MobileActionButton({
  children,
  variant = "primary",
  onClick,
  disabled,
  className,
}: MobileActionButtonProps) {
  const variantStyles = {
    primary: "bg-primary text-primary-foreground hover:bg-primary/90",
    secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
    outline: "border-border bg-background hover:bg-muted",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(
        // Touch target sizing
        "min-h-12 w-full",
        
        // Visual styling
        "inline-flex items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium",
        "transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        
        // Disabled state
        "disabled:pointer-events-none disabled:opacity-50",
        
        // Variant styling
        variantStyles[variant],
        
        className
      )}
    >
      {children}
    </button>
  );
}

/**
 * MobilePageActions - Inline action wrapper for mobile page layouts
 * 
 * Use for:
 * - Actions that should appear at the bottom of mobile pages
 * - Form submission areas
 * - Workflow navigation (Continue / Back)
 * 
 * Unlike MobileActionBar, this does not stick to viewport - it flows
 * with the page content.
 */
export type MobilePageActionsProps = {
  children: ReactNode;
  className?: string;
};

export function MobilePageActions({
  children,
  className,
}: MobilePageActionsProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-3 sm:flex-row",
        "mt-6 pt-6 border-t lg:hidden",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * MobileBackToQueue - Quick navigation back to main queue/list
 * 
 * Common pattern across workspace pages for returning to main work view
 */
export type MobileBackToQueueProps = {
  href: string;
  label?: string;
  className?: string;
};

export function MobileBackToQueue({
  href,
  label = "Back to queue",
  className,
}: MobileBackToQueueProps) {
  return (
    <a
      href={href}
      className={cn(
        "inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground",
        "lg:hidden",
        className
      )}
    >
      <svg
        className="h-4 w-4"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M10 19l-7-7m0 0l7-7m-7 7h18"
        />
      </svg>
      {label}
    </a>
  );
}

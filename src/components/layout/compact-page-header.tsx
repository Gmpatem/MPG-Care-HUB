"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * CompactPageHeader - Mobile-optimized page header
 * 
 * Use for:
 * - Detail pages on mobile
 * - Form pages where vertical space matters
 * - Nested/child pages
 * 
 * Features:
 * - Reduced padding and typography on mobile
 * - Back link support
 * - Minimal metadata display
 * - Actions placed for thumb reach
 * 
 * Unlike WorkspacePageHeader which is full-featured, this prioritizes
 * space efficiency for mobile workflows.
 */

export type CompactPageHeaderProps = {
  /** Page title - main identifier */
  title: ReactNode;
  /** Optional subtitle/context */
  subtitle?: ReactNode;
  /** Eyebrow label above title */
  eyebrow?: string;
  /** Back navigation link */
  backLink?: {
    href: string;
    label?: string;
  };
  /** Primary action - bottom placement on mobile */
  primaryAction?: ReactNode;
  /** Secondary action */
  secondaryAction?: ReactNode;
  /** Status/badge display */
  status?: ReactNode;
  /** Additional metadata (patient number, dates, etc) */
  meta?: ReactNode;
  className?: string;
};

export function CompactPageHeader({
  title,
  subtitle,
  eyebrow,
  backLink,
  primaryAction,
  secondaryAction,
  status,
  meta,
  className,
}: CompactPageHeaderProps) {
  return (
    <div
      className={cn(
        // Container with responsive padding
        "space-y-3 py-3 lg:py-6",
        
        // Border on mobile for visual separation
        "border-b lg:border-0",
        
        className
      )}
    >
      {/* Back link */}
      {backLink && (
        <a
          href={backLink.href}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
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
          {backLink.label || "Back"}
        </a>
      )}

      {/* Main header content */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-1">
          {eyebrow && (
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {eyebrow}
            </span>
          )}
          <h1 className="text-lg lg:text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
        
        {/* Status badge - shown inline on mobile */}
        {status && <div className="shrink-0">{status}</div>}
      </div>

      {/* Metadata row */}
      {meta && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
          {meta}
        </div>
      )}

      {/* Actions - stacked on mobile for thumb reach */}
      {(primaryAction || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-2 pt-2 lg:hidden">
          {secondaryAction && (
            <div className="order-2 sm:order-1">{secondaryAction}</div>
          )}
          {primaryAction && (
            <div className="order-1 sm:order-2 flex-1">{primaryAction}</div>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * MobileDetailHeader - Specialized header for detail pages
 * 
 * Optimized for patient/item detail views with status and key info
 */
export type MobileDetailHeaderProps = {
  /** Main identifier (name, number, etc) */
  title: string;
  /** Secondary identifier */
  subtitle?: string;
  /** Status display */
  status?: ReactNode;
  /** Key metadata items */
  metaItems?: Array<{
    label: string;
    value: ReactNode;
  }>;
  /** Back link */
  backLink?: {
    href: string;
    label?: string;
  };
  /** Primary action */
  primaryAction?: ReactNode;
  className?: string;
};

export function MobileDetailHeader({
  title,
  subtitle,
  status,
  metaItems,
  backLink,
  primaryAction,
  className,
}: MobileDetailHeaderProps) {
  return (
    <div
      className={cn(
        "space-y-3 py-3 border-b lg:hidden",
        className
      )}
    >
      {backLink && (
        <a
          href={backLink.href}
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
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
          {backLink.label || "Back"}
        </a>
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-semibold truncate">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}
        </div>
        {status && <div className="shrink-0">{status}</div>}
      </div>

      {metaItems && metaItems.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs">
          {metaItems.map((item, i) => (
            <div key={i} className="flex items-center gap-1">
              <span className="text-muted-foreground">{item.label}:</span>
              <span className="font-medium">{item.value}</span>
            </div>
          ))}
        </div>
      )}

      {primaryAction && (
        <div className="pt-1">{primaryAction}</div>
      )}
    </div>
  );
}

/**
 * MobileFormHeader - Header optimized for form pages
 * 
 * Minimal header to maximize form content visibility
 */
export type MobileFormHeaderProps = {
  title: string;
  description?: string;
  /** Current step for multi-step forms */
  step?: {
    current: number;
    total: number;
    label?: string;
  };
  /** Back navigation */
  backLink?: {
    href: string;
    label?: string;
  };
  className?: string;
};

export function MobileFormHeader({
  title,
  description,
  step,
  backLink,
  className,
}: MobileFormHeaderProps) {
  return (
    <div
      className={cn(
        "space-y-2 py-3 border-b lg:hidden",
        className
      )}
    >
      {/* Step indicator */}
      {step && (
        <div className="flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            Step {step.current} of {step.total}
          </span>
          {step.label && (
            <span className="font-medium">{step.label}</span>
          )}
        </div>
      )}

      {/* Progress bar */}
      {step && (
        <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary transition-all"
            style={{ width: `${(step.current / step.total) * 100}%` }}
          />
        </div>
      )}

      {/* Header content */}
      <div className="flex items-center gap-2">
        {backLink && (
          <a
            href={backLink.href}
            className="flex items-center justify-center w-8 h-8 -ml-2 rounded-full hover:bg-muted transition-colors"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </a>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-semibold">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * MobileWorkspaceHeader - Compressed workspace home page header
 * 
 * Reduced vertical footprint for workspace dashboard pages
 */
export type MobileWorkspaceHeaderProps = {
  title: string;
  description?: string;
  /** Quick stats to show below title */
  quickStats?: Array<{
    label: string;
    value: ReactNode;
  }>;
  className?: string;
};

export function MobileWorkspaceHeader({
  title,
  description,
  quickStats,
  className,
}: MobileWorkspaceHeaderProps) {
  return (
    <div
      className={cn(
        "space-y-2 py-3 border-b lg:hidden lg:border-0",
        className
      )}
    >
      <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
      {description && (
        <p className="text-sm text-muted-foreground line-clamp-2">
          {description}
        </p>
      )}
      
      {quickStats && quickStats.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 pt-1">
          {quickStats.map((stat, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs">
              <span className="text-muted-foreground">{stat.label}:</span>
              <span className="font-semibold">{stat.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

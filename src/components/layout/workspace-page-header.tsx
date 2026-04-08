import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { WorkspaceBreadcrumbs, BackLink, type BreadcrumbItem } from "./workspace-breadcrumbs";

export type WorkspacePageHeaderProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  /** Compact contextual meta (patient number, status badge, etc.) */
  meta?: ReactNode;
  /** Breadcrumb items for hierarchical navigation */
  breadcrumbs?: BreadcrumbItem[];
  /** Simple back link - use breadcrumbs OR backLink, not both */
  backLink?: {
    href: string;
    label?: string;
  };
  /** Primary action - rendered most prominently */
  primaryAction?: ReactNode;
  /** Secondary actions - rendered with outline style */
  secondaryActions?: ReactNode;
  /** Legacy actions slot - supports both single action and array */
  actions?: ReactNode;
  className?: string;
  /** Compact mode for detail pages with less vertical padding */
  compact?: boolean;
  /** Mobile-optimized layout - reduces padding and font sizes */
  mobileOptimized?: boolean;
};

/**
 * Unified workspace page header with consistent identity, navigation, and action hierarchy.
 * 
 * Mobile Optimizations (Pack L1):
 * - Reduced padding and typography on mobile
 * - Actions repositioned for thumb reach (bottom on mobile)
 * - Stacked layout for better mobile scanning
 * - Optional hero mesh styling can be disabled for dense mobile views
 * 
 * Usage patterns:
 * 
 * 1. Workspace Home (e.g., /h/[slug]/doctor):
 *    - eyebrow: "Clinical Workspace"
 *    - title: "Doctor Workspace"
 *    - description: "..."
 *    - primaryAction + secondaryActions
 * 
 * 2. Detail Page with back link (e.g., lab order detail):
 *    - backLink: { href: "/h/[slug]/lab", label: "Back to Lab" }
 *    - title: "Patient Name"
 *    - eyebrow: "Lab Order"
 *    - meta: <Badge>status</Badge>
 *    - compact: true
 * 
 * 3. Detail Page with breadcrumbs (e.g., nested admin pages):
 *    - breadcrumbs: [{ label: "Admin", href: "..." }, { label: "Settings" }]
 *    - title: "..."
 */
export function WorkspacePageHeader({
  eyebrow,
  title,
  description,
  meta,
  breadcrumbs,
  backLink,
  primaryAction,
  secondaryActions,
  actions,
  className,
  compact = false,
  mobileOptimized = true,
}: WorkspacePageHeaderProps) {
  // Normalize legacy actions into new hierarchy if new props not provided
  const hasNewActionSystem = primaryAction !== undefined || secondaryActions !== undefined;
  const hasActions = actions || primaryAction || secondaryActions;
  
  return (
    <section
      className={cn(
        "hero-mesh rounded-[1.6rem] p-[1px] shadow-[0_18px_55px_rgba(11,42,74,0.08)]",
        className
      )}
    >
      <div
        className={cn(
          "rounded-[1.52rem] bg-white/92 dark:bg-[#101c2c]/88",
          // Mobile compression: less padding on mobile
          compact ? "p-4 sm:p-5" : "p-4 sm:p-5 lg:p-6",
          mobileOptimized && "lg:p-6"
        )}
      >
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          {/* Left: Identity */}
          <div className={cn(
            "min-w-0 flex-1",
            // Mobile: tighter spacing
            mobileOptimized ? "space-y-2 lg:space-y-3" : "space-y-3"
          )}>
            {/* Navigation */}
            {backLink && (
              <BackLink href={backLink.href} label={backLink.label ?? "Back"} />
            )}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <WorkspaceBreadcrumbs items={breadcrumbs} showHome={false} />
            )}

            {/* Title Block */}
            <div className="space-y-1.5 lg:space-y-2">
              {eyebrow ? (
                <p className={cn(
                  "font-medium uppercase tracking-wider text-muted-foreground",
                  // Mobile: smaller eyebrow
                  mobileOptimized ? "text-[10px] lg:text-xs" : "text-xs"
                )}>
                  {eyebrow}
                </p>
              ) : null}

              <h1
                className={cn(
                  "font-semibold tracking-tight text-foreground",
                  compact
                    ? "text-xl lg:text-2xl"
                    : mobileOptimized
                      ? "text-xl lg:text-[1.8rem] lg:tracking-[-0.03em]"
                      : "text-[1.8rem] sm:text-[2.1rem] tracking-[-0.03em]"
                )}
              >
                {title}
              </h1>

              {description ? (
                <p
                  className={cn(
                    "max-w-3xl text-muted-foreground",
                    // Mobile: smaller, tighter description
                    mobileOptimized
                      ? "text-sm leading-6 lg:text-[15px] lg:leading-7"
                      : compact
                        ? "text-sm leading-6"
                        : "text-sm leading-7 sm:text-[15px]"
                  )}
                >
                  {description}
                </p>
              ) : null}
              
              {meta ? (
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {meta}
                </div>
              ) : null}
            </div>
          </div>

          {/* Right: Actions - Desktop only (inline) */}
          {hasActions ? (
            <div
              className={cn(
                // Mobile: full width, stacked for thumb reach
                "flex flex-col sm:flex-row gap-2 xl:shrink-0",
                // Mobile: actions at bottom
                mobileOptimized ? "w-full sm:w-auto xl:max-w-[42rem] xl:justify-end" : "flex-wrap items-center gap-2",
                compact ? "" : "xl:max-w-[42rem] xl:justify-end"
              )}
            >
              {hasNewActionSystem ? (
                <>
                  {/* Mobile: secondary action above primary for thumb reach */}
                  <div className={cn(
                    "order-2 sm:order-1",
                    mobileOptimized && "w-full sm:w-auto"
                  )}>
                    {secondaryActions}
                  </div>
                  <div className={cn(
                    "order-1 sm:order-2",
                    mobileOptimized && "w-full sm:w-auto"
                  )}>
                    {primaryAction}
                  </div>
                </>
              ) : (
                actions
              )}
            </div>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/**
 * WorkspacePageHeaderMobileActions - Mobile-specific action placement
 * 
 * Use this when you want actions to appear in a sticky bar at the bottom
 * on mobile, rather than in the header. This improves thumb reachability.
 * 
 * Place this component at the bottom of your page content.
 */
export type WorkspacePageHeaderMobileActionsProps = {
  primaryAction?: ReactNode;
  secondaryAction?: ReactNode;
  className?: string;
};

export function WorkspacePageHeaderMobileActions({
  primaryAction,
  secondaryAction,
  className,
}: WorkspacePageHeaderMobileActionsProps) {
  if (!primaryAction && !secondaryAction) return null;

  return (
    <div
      className={cn(
        // Mobile: sticky bottom bar
        "fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80",
        // Safe area support
        "pb-[env(safe-area-inset-bottom)]",
        // Desktop: hide (actions are in header)
        "lg:hidden",
        className
      )}
    >
      <div className="flex items-center gap-2 px-4 py-3">
        {secondaryAction && (
          <div className="shrink-0">{secondaryAction}</div>
        )}
        {primaryAction && (
          <div className="min-w-0 flex-1">{primaryAction}</div>
        )}
      </div>
    </div>
  );
}

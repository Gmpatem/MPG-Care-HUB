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
};

/**
 * Unified workspace page header with consistent identity, navigation, and action hierarchy.
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
}: WorkspacePageHeaderProps) {
  // Normalize legacy actions into new hierarchy if new props not provided
  const hasNewActionSystem = primaryAction !== undefined || secondaryActions !== undefined;
  
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
          compact ? "p-4 sm:p-5" : "p-5 sm:p-6"
        )}
      >
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
          {/* Left: Identity */}
          <div className="min-w-0 flex-1 space-y-3">
            {/* Navigation */}
            {backLink && (
              <BackLink href={backLink.href} label={backLink.label ?? "Back"} />
            )}
            {breadcrumbs && breadcrumbs.length > 0 && (
              <WorkspaceBreadcrumbs items={breadcrumbs} showHome={false} />
            )}

            {/* Title Block */}
            <div className="space-y-2">
              {eyebrow ? (
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {eyebrow}
                </p>
              ) : null}

              <h1
                className={cn(
                  "font-semibold tracking-tight text-foreground",
                  compact
                    ? "text-xl sm:text-2xl"
                    : "text-[1.8rem] sm:text-[2.1rem] tracking-[-0.03em]"
                )}
              >
                {title}
              </h1>

              {description ? (
                <p
                  className={cn(
                    "max-w-3xl text-muted-foreground",
                    compact
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

          {/* Right: Actions */}
          {(actions || primaryAction || secondaryActions) ? (
            <div
              className={cn(
                "flex flex-wrap items-center gap-2 xl:shrink-0",
                compact ? "" : "xl:max-w-[42rem] xl:justify-end"
              )}
            >
              {hasNewActionSystem ? (
                <>
                  {secondaryActions}
                  {primaryAction}
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

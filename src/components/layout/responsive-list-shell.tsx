"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * ResponsiveListShell - Adaptive list layout that transforms for mobile
 * 
 * Desktop: Table view with headers
 * Mobile: Card-based stacked list
 * 
 * Use for:
 * - Queue lists
 * - Patient lists
 * - Order/invoice lists
 * - Any data that would be tabular on desktop
 * 
 * Features:
 * - Automatic mobile card layout
 * - Consistent action placement
 * - Optimized touch targets
 * - Progressive disclosure on mobile
 * 
 * Example:
 * <ResponsiveListShell
 *   headers={["Name", "Status", "Actions"]}
 *   mobileCard={(item) => <MobileCard item={item} />}
 *   desktopRow={(item) => <DesktopRow item={item} />}
 *   items={data}
 * />
 */

export type ResponsiveListShellProps<T> = {
  items: T[];
  /** Desktop table headers */
  headers?: ReactNode[];
  /** Render function for desktop table rows */
  renderDesktopRow: (item: T, index: number) => ReactNode;
  /** Render function for mobile cards */
  renderMobileCard: (item: T, index: number) => ReactNode;
  /** Empty state content */
  emptyState?: ReactNode;
  className?: string;
  /** Table container className (desktop only) */
  tableClassName?: string;
  /** Card list container className (mobile only) */
  cardListClassName?: string;
};

export function ResponsiveListShell<T>({
  items,
  headers,
  renderDesktopRow,
  renderMobileCard,
  emptyState,
  className,
  tableClassName,
  cardListClassName,
}: ResponsiveListShellProps<T>) {
  if (items.length === 0 && emptyState) {
    return <>{emptyState}</>;
  }

  return (
    <div className={className}>
      {/* Mobile: Card list */}
      <div className={cn("space-y-3 lg:hidden", cardListClassName)}>
        {items.map((item, index) => renderMobileCard(item, index))}
      </div>

      {/* Desktop: Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className={cn("w-full caption-bottom text-sm", tableClassName)}>
          {headers && (
            <thead className="border-b">
              <tr>
                {headers.map((header, i) => (
                  <th
                    key={i}
                    className="h-10 px-2 text-left align-middle font-medium whitespace-nowrap text-muted-foreground"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="[&_tr:last-child]:border-0">
            {items.map((item, index) => renderDesktopRow(item, index))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * MobileListCard - Standard card component for mobile list items
 * 
 * Use for consistent mobile list item styling across the app
 */
export type MobileListCardProps = {
  /** Main title/identifier */
  title: ReactNode;
  /** Secondary info (subtitle) */
  subtitle?: ReactNode;
  /** Status badge or metadata */
  status?: ReactNode;
  /** Additional metadata rows */
  meta?: ReactNode;
  /** Primary action button/link */
  action?: ReactNode;
  /** Secondary actions (overflow, etc) */
  secondaryAction?: ReactNode;
  /** Click handler for the whole card */
  onClick?: () => void;
  className?: string;
};

export function MobileListCard({
  title,
  subtitle,
  status,
  meta,
  action,
  secondaryAction,
  onClick,
  className,
}: MobileListCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        // Container
        "rounded-xl border bg-card p-4 shadow-sm",
        
        // Interactive states
        onClick && "cursor-pointer hover:border-primary/30 hover:shadow-md transition-all active:scale-[0.99]",
        
        className
      )}
    >
      {/* Header: Title + Status */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h3 className="font-medium text-foreground truncate">{title}</h3>
          {subtitle && (
            <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>
          )}
        </div>
        {status && <div className="shrink-0">{status}</div>}
      </div>

      {/* Meta content */}
      {meta && <div className="mt-2">{meta}</div>}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-2 mt-3 pt-3 border-t">
          {secondaryAction && (
            <div className="shrink-0">{secondaryAction}</div>
          )}
          {action && <div className="flex-1 min-w-0">{action}</div>}
        </div>
      )}
    </div>
  );
}

/**
 * MobileQueueCard - Specialized card for queue items
 * 
 * Optimized for patient/work queue display with status and priority
 */
export type MobileQueueCardProps = {
  /** Patient/Item name */
  name: string;
  /** ID or identifier */
  identifier?: string;
  /** Queue number or position */
  queueNumber?: string;
  /** Current status */
  status?: ReactNode;
  /** Priority indicator */
  priority?: "low" | "normal" | "high" | "urgent";
  /** Wait time or duration */
  waitTime?: string;
  /** Assigned person */
  assignedTo?: string;
  /** Type/category */
  type?: string;
  /** Primary action */
  action?: ReactNode;
  /** Click handler */
  onClick?: () => void;
  className?: string;
};

export function MobileQueueCard({
  name,
  identifier,
  queueNumber,
  status,
  priority,
  waitTime,
  assignedTo,
  type,
  action,
  onClick,
  className,
}: MobileQueueCardProps) {
  const priorityStyles = {
    low: "",
    normal: "",
    high: "border-l-amber-400 border-l-4",
    urgent: "border-l-red-500 border-l-4",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl border bg-card p-4 shadow-sm",
        priorityStyles[priority || "normal"],
        onClick && "cursor-pointer hover:shadow-md transition-all active:scale-[0.99]",
        className
      )}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{name}</span>
            {queueNumber && (
              <span className="shrink-0 text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                #{queueNumber}
              </span>
            )}
          </div>
          {(identifier || type) && (
            <p className="text-sm text-muted-foreground mt-0.5">
              {[identifier, type].filter(Boolean).join(" · ")}
            </p>
          )}
        </div>
        {status && <div className="shrink-0">{status}</div>}
      </div>

      {/* Details row */}
      {(waitTime || assignedTo) && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
          {waitTime && <span>Waiting: {waitTime}</span>}
          {assignedTo && <span>Assigned: {assignedTo}</span>}
        </div>
      )}

      {/* Action */}
      {action && (
        <div className="mt-3 pt-3 border-t">
          {action}
        </div>
      )}
    </div>
  );
}

/**
 * ResponsiveTableContainer - Container that handles table overflow on mobile
 * 
 * Wraps tables to provide horizontal scrolling with visual affordance
 */
export type ResponsiveTableContainerProps = {
  children: ReactNode;
  className?: string;
};

export function ResponsiveTableContainer({
  children,
  className,
}: ResponsiveTableContainerProps) {
  return (
    <div
      className={cn(
        // Container with overflow
        "relative overflow-x-auto rounded-lg border lg:border-0",
        
        // Visual affordance for scrollable content
        "scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent",
        
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * MobileEmptyState - Empty state optimized for mobile screens
 * 
 * Smaller, more compact empty state for mobile list views
 */
export type MobileEmptyStateProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  icon?: ReactNode;
  className?: string;
};

export function MobileEmptyState({
  title,
  description,
  action,
  icon,
  className,
}: MobileEmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-6 lg:hidden",
        className
      )}
    >
      {icon && (
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-muted-foreground mb-3">
          {icon}
        </div>
      )}
      <h3 className="text-base font-medium">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

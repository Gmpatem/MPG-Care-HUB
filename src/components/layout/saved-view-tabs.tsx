"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type SavedView = {
  id: string;
  label: string;
  count?: number;
};

export type SavedViewTabsProps = {
  /** Available views */
  views: SavedView[];
  /** Currently selected view */
  activeView: string;
  /** Callback when view changes */
  onViewChange: (viewId: string) => void;
  /** Variant style */
  variant?: "default" | "pills" | "underline";
  /** Show counts on tabs */
  showCounts?: boolean;
  className?: string;
};

/**
 * SavedViewTabs - Quick view preset selector for operational lists
 * 
 * Use for:
 * - Common filter presets (All / Waiting / In Progress / Completed)
 * - Status-based views (Open / Paid / Overdue)
 * - Workflow stage views (Pending / Ready / Blocked)
 * - Personal saved views
 * 
 * Pattern:
 * - Click a tab to apply a preset filter set
 * - Active tab is highlighted
 * - Counts optional but helpful
 * 
 * Examples:
 * - All | Waiting today | Priority
 * - All | Unpaid | Partial | Paid
 * - All | Pending | Ready for review | Completed
 */
export function SavedViewTabs({
  views,
  activeView,
  onViewChange,
  variant = "default",
  showCounts = true,
  className,
}: SavedViewTabsProps) {
  if (views.length === 0) return null;

  if (variant === "pills") {
    return (
      <div className={cn("flex flex-wrap gap-2", className)}>
        {views.map((view) => {
          const isActive = view.id === activeView;
          return (
            <button
              key={view.id}
              onClick={() => onViewChange(view.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}
            >
              {view.label}
              {showCounts && view.count != null && (
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-xs",
                    isActive
                      ? "bg-primary-foreground/20 text-primary-foreground"
                      : "bg-background text-muted-foreground"
                  )}
                >
                  {view.count}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  if (variant === "underline") {
    return (
      <div className={cn("border-b", className)}>
        <div className="flex gap-1">
          {views.map((view) => {
            const isActive = view.id === activeView;
            return (
              <button
                key={view.id}
                onClick={() => onViewChange(view.id)}
                className={cn(
                  "relative inline-flex items-center gap-2 px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                {view.label}
                {showCounts && view.count != null && (
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs">
                    {view.count}
                  </span>
                )}
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  }

  // Default: button group style
  return (
    <div
      className={cn(
        "inline-flex flex-wrap gap-1 rounded-lg border bg-muted/50 p-1",
        className
      )}
    >
      {views.map((view) => {
        const isActive = view.id === activeView;
        return (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={cn(
              "inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
              isActive
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            {view.label}
            {showCounts && view.count != null && (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-xs",
                  isActive
                    ? "bg-muted text-muted-foreground"
                    : "bg-background text-muted-foreground"
                )}
              >
                {view.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/**
 * QuickFilterChips - Compact filter chips for active filters
 */
export function QuickFilterChips({
  filters,
  onRemove,
  className,
}: {
  filters: Array<{
    id: string;
    label: string;
  }>;
  onRemove?: (id: string) => void;
  className?: string;
}) {
  if (filters.length === 0) return null;

  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {filters.map((filter) => (
        <span
          key={filter.id}
          className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs"
        >
          {filter.label}
          {onRemove && (
            <button
              onClick={() => onRemove(filter.id)}
              className="rounded-full p-0.5 hover:bg-background"
            >
              <svg
                className="h-3 w-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </span>
      ))}
    </div>
  );
}

/**
 * FilterBadge - Single filter indicator with remove action
 */
export function FilterBadge({
  label,
  onRemove,
  className,
}: {
  label: string;
  onRemove?: () => void;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary",
        className
      )}
    >
      {label}
      {onRemove && (
        <button
          onClick={onRemove}
          className="rounded-full p-0.5 hover:bg-primary/20"
        >
          <svg
            className="h-3 w-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}
    </span>
  );
}

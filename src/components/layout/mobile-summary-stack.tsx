"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * MobileSummaryStack - Compressed summary display for mobile viewports
 * 
 * Use for:
 * - Workspace page KPI summaries on narrow screens
 * - Patient context summaries
 * - Queue status summaries
 * 
 * Features:
 * - Horizontal scrolling on mobile for many items
 * - Compact card format
 * - Stacked layout when space is constrained
 * - Automatic desktop conversion to grid
 * 
 * Example:
 * <MobileSummaryStack>
 *   <SummaryPill label="Waiting" value={5} tone="warning" />
 *   <SummaryPill label="Ready" value={3} tone="success" />
 * </MobileSummaryStack>
 */

export type MobileSummaryStackProps = {
  children: ReactNode;
  className?: string;
  /** Scroll horizontally on mobile vs stack vertically */
  scrollable?: boolean;
};

export function MobileSummaryStack({
  children,
  className,
  scrollable = true,
}: MobileSummaryStackProps) {
  return (
    <div
      className={cn(
        // Mobile: horizontal scroll or vertical stack
        scrollable && "flex gap-2 overflow-x-auto pb-2 scrollbar-hide",
        !scrollable && "grid gap-2",
        
        // Desktop: hide this container (use KpiSummaryStrip instead)
        "lg:hidden",
        
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * SummaryPill - Compact summary item for mobile stacks
 * 
 * Use for:
 * - Quick status indicators
 * - Count summaries
 * - Status badges with values
 */
export type SummaryPillProps = {
  label: string;
  value: ReactNode;
  /** Visual emphasis based on status */
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
  /** Optional icon */
  icon?: ReactNode;
  /** Click handler */
  onClick?: () => void;
  className?: string;
};

export function SummaryPill({
  label,
  value,
  tone = "neutral",
  icon,
  onClick,
  className,
}: SummaryPillProps) {
  const toneStyles = {
    neutral: "bg-muted/50 text-muted-foreground border-border/50",
    info: "bg-blue-50/80 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800",
    success: "bg-emerald-50/80 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800",
    warning: "bg-amber-50/80 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-300 dark:border-amber-800",
    danger: "bg-red-50/80 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800",
  };

  return (
    <div
      onClick={onClick}
      className={cn(
        // Layout
        "flex items-center gap-2 px-3 py-2 rounded-xl border shrink-0",
        
        // Visual styling
        toneStyles[tone],
        
        // Interactive
        onClick && "cursor-pointer hover:opacity-80 active:scale-[0.98] transition-all",
        
        className
      )}
    >
      {icon && <span className="shrink-0 opacity-70">{icon}</span>}
      <div className="min-w-0">
        <span className="block text-lg font-semibold leading-none">{value}</span>
        <span className="block text-xs opacity-80 mt-0.5">{label}</span>
      </div>
    </div>
  );
}

/**
 * CompactStatRow - Horizontal stat row for mobile
 * 
 * Use for:
 * - Patient header stats
 * - Quick context rows
 * - Metadata summaries
 */
export type CompactStatRowProps = {
  items: Array<{
    label: string;
    value: ReactNode;
  }>;
  className?: string;
};

export function CompactStatRow({ items, className }: CompactStatRowProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap gap-x-4 gap-y-1 text-sm lg:hidden",
        className
      )}
    >
      {items.map((item, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="text-muted-foreground text-xs">{item.label}:</span>
          <span className="font-medium">{item.value}</span>
        </div>
      ))}
    </div>
  );
}

/**
 * MobileContextHeader - Compressed header for mobile detail pages
 * 
 * Use for:
 * - Patient detail page headers
 * - Queue item detail headers
 * - Form page headers
 * 
 * Features:
 * - Reduced vertical padding
 * - Smaller typography
 * - Essential info only
 */
export type MobileContextHeaderProps = {
  title: ReactNode;
  subtitle?: ReactNode;
  meta?: ReactNode;
  action?: ReactNode;
  className?: string;
};

export function MobileContextHeader({
  title,
  subtitle,
  meta,
  action,
  className,
}: MobileContextHeaderProps) {
  return (
    <div
      className={cn(
        "space-y-2 py-3 border-b lg:hidden",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg font-semibold truncate">{title}</h1>
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {meta && <div className="flex flex-wrap gap-2">{meta}</div>}
    </div>
  );
}

/**
 * MobileQuickFilters - Compressed filter bar for mobile
 * 
 * Use for:
 * - Queue filters on mobile
 * - List view filters
 * - Quick category toggles
 */
export type MobileQuickFiltersProps = {
  options: Array<{
    label: string;
    value: string;
    count?: number;
  }>;
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function MobileQuickFilters({
  options,
  value,
  onChange,
  className,
}: MobileQuickFiltersProps) {
  return (
    <div
      className={cn(
        "flex gap-1 overflow-x-auto pb-2 scrollbar-hide lg:hidden",
        className
      )}
    >
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "shrink-0 px-3 py-1.5 rounded-full text-sm font-medium transition-colors",
            value === option.value
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/80"
          )}
        >
          {option.label}
          {option.count !== undefined && option.count > 0 && (
            <span className={cn(
              "ml-1.5 text-xs",
              value === option.value ? "text-primary-foreground/80" : "text-muted-foreground/70"
            )}>
              {option.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

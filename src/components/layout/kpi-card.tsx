"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { ArrowRight, TrendingDown, TrendingUp, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/**
 * KpiCard - Enhanced KPI card with interpretation and action guidance
 * 
 * Use for:
 * - Dashboard summary strips
 * - Workspace home page KPIs
 * - Operational metrics with context
 * 
 * Provides:
 * - Clear value display
 * - Interpretive description
 * - Optional status tone (good/bad/warning/neutral)
 * - Optional trend indicator
 * - Optional action link
 * 
 * Example:
 * <KpiCard
 *   title="Patients Waiting"
 *   value={12}
 *   description="3 emergency, 9 routine"
 *   tone="warning"
 *   action={{ label: "View Queue", href: "/queue" }}
 * />
 */

export type KpiTone = "neutral" | "info" | "success" | "warning" | "danger" | "highlight";

export type KpiAction = {
  label: string;
  href: string;
  external?: boolean;
};

export type KpiCardProps = {
  title: string;
  value: ReactNode;
  /** Short interpretation of what the number means */
  description?: string;
  /** Longer context for complex metrics */
  context?: string;
  icon?: ReactNode;
  /** Visual emphasis based on operational meaning */
  tone?: KpiTone;
  /** Trend direction for change-over-time metrics */
  trend?: "up" | "down" | "flat";
  /** Description of what the trend means */
  trendLabel?: string;
  /** Optional action to take from this metric */
  action?: KpiAction;
  /** Compact mode for dense layouts */
  compact?: boolean;
  className?: string;
  /** Make the whole card clickable */
  href?: string;
};

const toneStyles: Record<KpiTone, string> = {
  neutral: "border-border/70 bg-card",
  info: "border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-900/20",
  success: "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-900/20",
  warning: "border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-900/20",
  danger: "border-red-200 bg-red-50/50 dark:border-red-800 dark:bg-red-900/20",
  highlight: "border-primary/30 bg-primary/5",
};

const toneIconStyles: Record<KpiTone, string> = {
  neutral: "bg-muted text-muted-foreground",
  info: "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400",
  success: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400",
  warning: "bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400",
  danger: "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400",
  highlight: "bg-primary/10 text-primary",
};

const toneValueStyles: Record<KpiTone, string> = {
  neutral: "",
  info: "text-blue-700 dark:text-blue-300",
  success: "text-emerald-700 dark:text-emerald-300",
  warning: "text-amber-700 dark:text-amber-300",
  danger: "text-red-700 dark:text-red-300",
  highlight: "text-primary",
};

function TrendIndicator({ 
  trend, 
  label 
}: { 
  trend: "up" | "down" | "flat"; 
  label?: string;
}) {
  const icons = {
    up: TrendingUp,
    down: TrendingDown,
    flat: Minus,
  };
  const Icon = icons[trend];
  
  const styles = {
    up: "text-emerald-600 dark:text-emerald-400",
    down: "text-red-600 dark:text-red-400",
    flat: "text-muted-foreground",
  };

  return (
    <span className={cn("inline-flex items-center gap-1 text-xs", styles[trend])}>
      <Icon className="h-3 w-3" />
      {label}
    </span>
  );
}

export function KpiCard({
  title,
  value,
  description,
  context,
  icon,
  tone = "neutral",
  trend,
  trendLabel,
  action,
  compact = false,
  className,
  href,
}: KpiCardProps) {
  const content = (
    <div
      className={cn(
        "group rounded-[1.35rem] border px-5 py-4 shadow-[0_10px_28px_rgba(13,27,42,0.035)] transition-all",
        "hover:-translate-y-[1px] hover:shadow-[0_14px_34px_rgba(13,27,42,0.06)]",
        toneStyles[tone],
        href && "cursor-pointer",
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2">
          {/* Title row */}
          <div className="flex items-center gap-2">
            <p className={cn(
              "font-medium text-muted-foreground",
              compact ? "text-xs uppercase tracking-wider" : "text-[13px]"
            )}>
              {title}
            </p>
            {trend && <TrendIndicator trend={trend} label={trendLabel} />}
          </div>

          {/* Value */}
          <div
            className={cn(
              "font-semibold leading-none tracking-[-0.04em]",
              compact ? "text-xl" : "text-[2rem]",
              toneValueStyles[tone]
            )}
          >
            {value}
          </div>
        </div>

        {/* Icon */}
        {icon ? (
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ring-1 ring-border/70",
              toneIconStyles[tone]
            )}
          >
            {icon}
          </div>
        ) : null}
      </div>

      {/* Description */}
      {description && (
        <p className="mt-3 text-sm leading-5 text-muted-foreground">
          {description}
        </p>
      )}

      {/* Extended context */}
      {context && !compact && (
        <p className="mt-1 text-xs leading-4 text-muted-foreground/70">
          {context}
        </p>
      )}

      {/* Action */}
      {action && (
        <div className="mt-3">
          {href ? (
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-sm"
              asChild
            >
              <Link href={action.href}>
                {action.label}
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          ) : (
            <Button
              variant="ghost"
              size="sm"
              className="h-auto px-0 text-sm"
              asChild
            >
              <Link href={action.href}>
                {action.label}
                <ArrowRight className="ml-1 h-3 w-3" />
              </Link>
            </Button>
          )}
        </div>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="block">
        {content}
      </Link>
    );
  }

  return content;
}

/**
 * KpiSummaryStrip - Standardized summary strip for workspace dashboards
 * 
 * Standard placement: Immediately after page header
 * Use for: Primary operational KPIs that deserve first attention
 * 
 * Implements consistent priority:
 * - First-tier: Waiting, pending, blocked, urgent, ready-to-act
 * - Second-tier: Throughput, completion, outcomes
 * - Third-tier: Informational context (totals, setup)
 */
export type KpiSummaryStripProps = {
  children: ReactNode;
  className?: string;
  /** 2, 3, or 4 columns (responsive) */
  columns?: 2 | 3 | 4;
  /** Tighter spacing for denser layouts */
  compact?: boolean;
};

export function KpiSummaryStrip({
  children,
  className,
  columns = 4,
  compact = false,
}: KpiSummaryStripProps) {
  const columnClasses = {
    2: "sm:grid-cols-2",
    3: "sm:grid-cols-2 lg:grid-cols-3",
    4: "sm:grid-cols-2 xl:grid-cols-4",
  };

  return (
    <section
      className={cn(
        "grid gap-3",
        columnClasses[columns],
        compact && "gap-2",
        className
      )}
    >
      {children}
    </section>
  );
}

/**
 * KpiMetricGroup - Group related KPIs with a title
 * 
 * Use for: Secondary metric groupings, sectional summaries
 */
export type KpiMetricGroupProps = {
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function KpiMetricGroup({
  title,
  description,
  children,
  className,
}: KpiMetricGroupProps) {
  return (
    <div className={cn("space-y-3", className)}>
      {(title || description) && (
        <div>
          {title && (
            <h3 className="text-sm font-medium text-foreground">{title}</h3>
          )}
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        {children}
      </div>
    </div>
  );
}

/**
 * EmptyKpiState - Consistent empty/zero state for KPIs
 * 
 * Use when: Metric is zero, no active work, or low activity
 */
export type EmptyKpiStateProps = {
  title: string;
  message: string;
  icon?: ReactNode;
  className?: string;
};

export function EmptyKpiState({
  title,
  message,
  icon,
  className,
}: EmptyKpiStateProps) {
  return (
    <div
      className={cn(
        "rounded-[1.35rem] border border-border/70 bg-muted/30 px-5 py-4",
        className
      )}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
            {icon}
          </div>
        )}
        <div className="space-y-1">
          <p className="text-[13px] font-medium text-muted-foreground">{title}</p>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>
    </div>
  );
}

export default KpiCard;

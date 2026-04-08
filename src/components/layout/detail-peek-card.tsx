"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusBadge, StatusTone } from "@/components/layout/status-badge";
import { TaskReadinessRow } from "@/components/layout/task-readiness-summary";
import { ReadinessSignal } from "@/lib/ui/task-state";

export type PeekMetaItem = {
  label?: string;
  value: React.ReactNode;
  /** Hide this item in compact view */
  secondary?: boolean;
  /** Highlight this item for emphasis */
  highlight?: boolean;
};

export type DetailPeekCardProps = {
  /** Unique identifier */
  id: string;
  /** Primary title/name */
  title: string;
  /** Subtitle or secondary identifier */
  subtitle?: string;
  /** href for clickable title (opens full page) */
  href?: string;
  /** Status badge */
  status?: {
    label: string;
    tone: StatusTone;
  };
  /** Readiness signal (alternative to status) */
  readiness?: ReadinessSignal;
  /** Additional badges */
  badges?: Array<{
    label: string;
    tone?: StatusTone;
  }>;
  /** Metadata items - primary shown always, secondary shown when expanded */
  meta?: PeekMetaItem[];
  /** Expanded content (shown when peek is expanded) */
  children?: React.ReactNode;
  /** Primary action */
  primaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /** Secondary action */
  secondaryAction?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
  /** Full page link label (defaults to "View details") */
  fullPageLabel?: string;
  /** Whether to show expand/collapse control */
  expandable?: boolean;
  /** External control for expanded state */
  expanded?: boolean;
  /** Callback when expanded state changes */
  onExpandedChange?: (expanded: boolean) => void;
  /** Compact mode for dense lists */
  compact?: boolean;
  className?: string;
};

/**
 * DetailPeekCard - Expandable detail card with progressive disclosure
 *
 * Use for:
 * - Queue items with expandable detail
 * - List items where users need to peek before opening full page
 * - Summary cards that reveal more context on demand
 * - Anywhere users need "a little more info" without route change
 *
 * Features:
 * - Always-visible primary metadata
 * - Expandable secondary detail
 * - Clear "Open full page" escape hatch
 * - Consistent show more/less controls
 *
 * Example:
 * <DetailPeekCard
 *   id={order.id}
 *   title={patientName}
 *   subtitle={patientNumber}
 *   href={`/h/${slug}/lab/orders/${order.id}`}
 *   status={{ label: "ordered", tone: "info" }}
 *   meta={[
 *     { label: "Doctor", value: order.doctor },
 *     { label: "Items", value: "3 tests" },
 *     { label: "Priority", value: order.priority, secondary: true },
 *     { label: "Notes", value: order.notes, secondary: true },
 *   ]}
 *   expandable
 * >
 *   <LabOrderPeekDetail order={order} />
 * </DetailPeekCard>
 */
export function DetailPeekCard({
  id: _id,
  title,
  subtitle,
  href,
  status,
  readiness,
  badges = [],
  meta = [],
  children,
  primaryAction,
  secondaryAction,
  fullPageLabel = "View details",
  expandable = false,
  expanded: controlledExpanded,
  onExpandedChange,
  compact = false,
  className,
}: DetailPeekCardProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = controlledExpanded ?? internalExpanded;
  const setIsExpanded = onExpandedChange ?? setInternalExpanded;

  const primaryMeta = meta.filter((item) => !item.secondary);
  const secondaryMeta = meta.filter((item) => item.secondary);
  const hasSecondaryMeta = secondaryMeta.length > 0;
  const hasExpandedContent = children || hasSecondaryMeta;
  const canExpand = expandable && hasExpandedContent;

  const toggleExpanded = () => setIsExpanded(!isExpanded);

  if (compact) {
    return (
      <div
        className={cn(
          "rounded-xl border bg-background p-3 transition-colors",
          isExpanded
            ? "border-primary/50 bg-primary/5"
            : "border-border/70 hover:border-primary/50 hover:bg-muted/30",
          className
        )}
      >
        {/* Compact Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              {href ? (
                <Link
                  href={href}
                  className="truncate font-medium text-foreground hover:text-primary"
                >
                  {title}
                </Link>
              ) : (
                <span className="truncate font-medium text-foreground">{title}</span>
              )}
              {status && <StatusBadge label={status.label} tone={status.tone} compact dot />}
              {readiness && <TaskReadinessRow signal={readiness} />}
            </div>
            {subtitle && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>
            )}
          </div>
          {canExpand && (
            <Button
              variant="ghost"
              size="sm"
              className="h-7 px-2"
              onClick={toggleExpanded}
            >
              {isExpanded ? "Less" : "More"}
              <ChevronDown
                className={cn("ml-1 h-3.5 w-3.5 transition-transform", isExpanded && "rotate-180")}
              />
            </Button>
          )}
        </div>

        {/* Compact Expanded Content */}
        {isExpanded && (
          <div className="mt-3 border-t pt-3">
            {hasSecondaryMeta && (
              <div className="mb-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                {secondaryMeta.map((item, index) => (
                  <p key={index}>
                    {item.label ? `${item.label}: ` : null}
                    {item.value}
                  </p>
                ))}
              </div>
            )}
            {children}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border bg-background p-4 transition-colors",
        isExpanded
          ? "border-primary/50 bg-primary/5"
          : "border-border/70 hover:border-primary/50 hover:bg-muted/30",
        className
      )}
    >
      {/* Header Row */}
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        {/* Identity */}
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {href ? (
              <Link
                href={href}
                className="text-base font-semibold text-foreground hover:text-primary"
              >
                {title}
              </Link>
            ) : (
              <span className="text-base font-semibold text-foreground">{title}</span>
            )}

            {status && (
              <StatusBadge
                label={status.label}
                tone={status.tone}
                className="px-2.5 py-1 capitalize font-medium"
              />
            )}

            {readiness && <TaskReadinessRow signal={readiness} />}

            {badges.map((badge, index) => (
              <StatusBadge
                key={index}
                label={badge.label}
                tone={badge.tone ?? "neutral"}
                className="px-2.5 py-1 font-medium"
              />
            ))}
          </div>

          {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}

          {/* Primary Meta (always visible) */}
          {primaryMeta.length > 0 && (
            <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
              {primaryMeta.map((item, index) => (
                <p key={index}>
                  {item.label ? `${item.label}: ` : null}
                  {item.value}
                </p>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {canExpand && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleExpanded}
              className="text-muted-foreground"
            >
              {isExpanded ? "Show less" : "Show more"}
              <ChevronDown
                className={cn("ml-1 h-4 w-4 transition-transform", isExpanded && "rotate-180")}
              />
            </Button>
          )}

          {secondaryAction && (
            <Button
              variant="outline"
              size="sm"
              asChild={!!secondaryAction.href}
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.href ? (
                <Link href={secondaryAction.href}>{secondaryAction.label}</Link>
              ) : (
                secondaryAction.label
              )}
            </Button>
          )}

          {primaryAction && (
            <Button size="sm" asChild={!!primaryAction.href} onClick={primaryAction.onClick}>
              {primaryAction.href ? (
                <Link href={primaryAction.href} className="gap-1">
                  {primaryAction.label}
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                primaryAction.label
              )}
            </Button>
          )}

          {href && !primaryAction && (
            <Button variant="outline" size="sm" asChild>
              <Link href={href} className="gap-1">
                {fullPageLabel}
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && hasExpandedContent && (
        <div className="mt-4 border-t pt-4">
          {/* Secondary Meta */}
          {hasSecondaryMeta && (
            <div className="mb-4 grid gap-3 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
              {secondaryMeta.map((item, index) => (
                <div key={index} className="rounded-lg border bg-background/70 p-3">
                  {item.label && (
                    <p className="text-xs font-medium text-muted-foreground">{item.label}</p>
                  )}
                  <p className="mt-0.5 font-medium text-foreground">{item.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* Custom Expanded Content */}
          {children}
        </div>
      )}
    </div>
  );
}

/**
 * QuickPeek - Minimal inline peek for small contexts
 *
 * Use when:
 * - Space is very limited
 * - Only 1-2 facts need to be revealed
 * - The context is secondary to the main content
 *
 * Example:
 * <QuickPeek label="Patient details" peek={`${age}y · ${gender}`} />
 */
export function QuickPeek({
  label,
  peek,
  href,
  className,
}: {
  label: string;
  peek: React.ReactNode;
  href?: string;
  className?: string;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className={cn("inline-flex items-center gap-2", className)}>
      <span className="text-sm text-muted-foreground">{label}:</span>
      {isExpanded ? (
        <span className="text-sm text-foreground">{peek}</span>
      ) : (
        <Button
          variant="link"
          size="sm"
          className="h-auto p-0 text-sm"
          onClick={() => setIsExpanded(true)}
        >
          Show
        </Button>
      )}
      {href && isExpanded && (
        <Link
          href={href}
          className="inline-flex items-center gap-0.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <ExternalLink className="h-3 w-3" />
          Open
        </Link>
      )}
    </div>
  );
}

"use client";

import Link from "next/link";
import { AlertCircle, AlertTriangle, CheckCircle2, Info, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type AlertTone = "info" | "warning" | "danger" | "success";

export type AttentionItem = {
  id: string;
  title: string;
  description?: string;
  tone?: AlertTone;
  href?: string;
  actionLabel?: string;
  onAction?: () => void;
  /** Timestamp if relevant */
  timestamp?: string;
  /** Optional metadata for display */
  meta?: string;
};

export type AttentionPanelProps = {
  title?: string;
  description?: string;
  items: AttentionItem[];
  /** Max items to show before "show more" */
  maxItems?: number;
  /** Empty state message */
  emptyMessage?: string;
  /** Empty state description */
  emptyDescription?: string;
  /** Allow dismissing individual alerts */
  dismissible?: boolean;
  /** Callback when item is dismissed */
  onDismiss?: (id: string) => void;
  className?: string;
};

const toneIcons = {
  info: Info,
  warning: AlertTriangle,
  danger: AlertCircle,
  success: CheckCircle2,
};

const toneStyles: Record<AlertTone, string> = {
  info: "border-blue-200 bg-blue-50/50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/20 dark:text-blue-200",
  warning: "border-amber-200 bg-amber-50/50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-200",
  danger: "border-red-200 bg-red-50/50 text-red-800 dark:border-red-900 dark:bg-red-950/20 dark:text-red-200",
  success: "border-emerald-200 bg-emerald-50/50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-200",
};

const toneIconColors: Record<AlertTone, string> = {
  info: "text-blue-600",
  warning: "text-amber-600",
  danger: "text-red-600",
  success: "text-emerald-600",
};

/**
 * AttentionPanel - Unified "needs attention" alert display
 *
 * Use for:
 * - Pending lab work
 * - Discharge blockers
 * - Unpaid invoices
 * - Queue items waiting too long
 * - Missing setup/config blockers
 * - Items ready to act on
 *
 * This answers: what needs attention, why it matters, what the next action is.
 *
 * Example:
 * <AttentionPanel
 *   title="Needs Attention"
 *   items={[
 *     {
 *       id: "1",
 *       title: "3 lab orders pending results",
 *       description: "Orders have been waiting for over 2 hours",
 *       tone: "warning",
 *       href: "/h/slug/lab/orders",
 *       actionLabel: "View Lab Queue",
 *     },
 *   ]}
 * />
 */
export function AttentionPanel({
  title = "Needs Attention",
  description,
  items,
  maxItems = 5,
  emptyMessage = "No urgent items right now",
  emptyDescription = "Everything is on track. New alerts will appear here when attention is needed.",
  dismissible = false,
  onDismiss,
  className,
}: AttentionPanelProps) {
  const displayItems = items.slice(0, maxItems);
  const hasMore = items.length > maxItems;

  if (items.length === 0) {
    return (
      <div className={cn("rounded-xl border border-border/70 bg-background p-5", className)}>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <h3 className="font-medium text-foreground">{title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{emptyMessage}</p>
            {emptyDescription && (
              <p className="mt-1 text-xs text-muted-foreground/70">{emptyDescription}</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border border-border/70 bg-background", className)}>
      <div className="border-b border-border/50 px-5 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">{title}</h3>
            {description && (
              <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
          {items.length > 0 && (
            <span className="rounded-full bg-muted px-2.5 py-1 text-xs font-medium">
              {items.length}
            </span>
          )}
        </div>
      </div>

      <div className="divide-y divide-border/50">
        {displayItems.map((item) => (
          <AttentionItemRow
            key={item.id}
            item={item}
            dismissible={dismissible}
            onDismiss={onDismiss}
          />
        ))}
      </div>

      {hasMore && (
        <div className="border-t border-border/50 px-5 py-3">
          <p className="text-xs text-muted-foreground">
            +{items.length - maxItems} more items need attention
          </p>
        </div>
      )}
    </div>
  );
}

function AttentionItemRow({
  item,
  dismissible,
  onDismiss,
}: {
  item: AttentionItem;
  dismissible?: boolean;
  onDismiss?: (id: string) => void;
}) {
  const tone = item.tone ?? "info";
  const Icon = toneIcons[tone];

  const content = (
    <div className="flex items-start gap-3 p-4">
      <div className={cn("mt-0.5 shrink-0", toneIconColors[tone])}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium text-foreground">{item.title}</p>
        {item.description && (
          <p className="mt-0.5 text-sm text-muted-foreground">{item.description}</p>
        )}
        {item.meta && (
          <p className="mt-1 text-xs text-muted-foreground">{item.meta}</p>
        )}
        {item.timestamp && (
          <p className="mt-1 text-xs text-muted-foreground">
            {new Date(item.timestamp).toLocaleString()}
          </p>
        )}

        {/* Action */}
        {(item.href || item.onAction) && (
          <div className="mt-2">
            {item.href ? (
              <Button asChild variant="outline" size="sm">
                <Link href={item.href}>{item.actionLabel ?? "View"}</Link>
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={item.onAction}>
                {item.actionLabel ?? "Action"}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Dismiss button */}
      {dismissible && onDismiss && (
        <button
          onClick={() => onDismiss(item.id)}
          className="shrink-0 rounded-md p-1 text-muted-foreground opacity-60 transition-opacity hover:opacity-100"
          aria-label="Dismiss alert"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );

  if (item.href) {
    return (
      <Link
        href={item.href}
        className="block transition-colors hover:bg-muted/30"
      >
        {content}
      </Link>
    );
  }

  return <div className={cn("transition-colors", item.onAction && "hover:bg-muted/30")}>{content}</div>;
}

/**
 * CompactAlert - Single alert card for inline use
 */
export function CompactAlert({
  title,
  description,
  tone = "info",
  href,
  actionLabel,
}: {
  title: string;
  description?: string;
  tone?: AlertTone;
  href?: string;
  actionLabel?: string;
}) {
  const Icon = toneIcons[tone];

  const content = (
    <div className={cn("rounded-lg border p-3", toneStyles[tone])}>
      <div className="flex items-start gap-2">
        <Icon className={cn("mt-0.5 h-4 w-4 shrink-0", toneIconColors[tone])} />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium">{title}</p>
          {description && (
            <p className="mt-0.5 text-xs opacity-90">{description}</p>
          )}
          {href && actionLabel && (
            <p className="mt-1.5 text-xs font-medium underline underline-offset-2">
              {actionLabel}
            </p>
          )}
        </div>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href} className="block">{content}</Link>;
  }

  return content;
}

/**
 * BlockerAlert - Specific alert for workflow blockers
 */
export function BlockerAlert({
  title,
  description,
  href,
  actionLabel = "Resolve",
}: {
  title: string;
  description?: string;
  href?: string;
  actionLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:border-red-900 dark:bg-red-950/20">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="font-medium text-red-900 dark:text-red-200">{title}</h4>
          {description && (
            <p className="mt-1 text-sm text-red-700 dark:text-red-300">{description}</p>
          )}
          {href && (
            <div className="mt-3">
              <Button asChild size="sm" variant="outline" className="border-red-300 bg-white hover:bg-red-50 dark:bg-red-950 dark:hover:bg-red-900">
                <Link href={href}>{actionLabel}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

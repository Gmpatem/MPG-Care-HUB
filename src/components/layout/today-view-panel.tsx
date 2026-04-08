"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Play,
  Ban,
  ArrowRight,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type TodayItemTone = "urgent" | "ready" | "waiting" | "blocked" | "completed" | "neutral";

export type TodayItem = {
  id: string;
  title: string;
  description?: string;
  tone?: TodayItemTone;
  href?: string;
  actionLabel?: string;
  count?: number;
  meta?: string;
};

export type TodayViewPanelProps = {
  title?: string;
  description?: string;
  /** Items needing immediate action */
  urgentItems?: TodayItem[];
  /** Items ready for action but not urgent */
  readyItems?: TodayItem[];
  /** Items waiting/pending normally */
  waitingItems?: TodayItem[];
  /** Items blocked from progress */
  blockedItems?: TodayItem[];
  /** Items completed today */
  completedToday?: number;
  completedLabel?: string;
  /** Overall empty state message when no items */
  emptyMessage?: string;
  emptyDescription?: string;
  className?: string;
};

const toneIcons: Record<TodayItemTone, typeof AlertCircle> = {
  urgent: AlertCircle,
  ready: Play,
  waiting: Clock,
  blocked: Ban,
  completed: CheckCircle2,
  neutral: Clock,
};

const toneStyles: Record<TodayItemTone, string> = {
  urgent: "border-red-200 bg-red-50/50 text-red-800 dark:border-red-900 dark:bg-red-950/20 dark:text-red-200",
  ready: "border-emerald-200 bg-emerald-50/50 text-emerald-800 dark:border-emerald-900 dark:bg-emerald-950/20 dark:text-emerald-200",
  waiting: "border-blue-200 bg-blue-50/50 text-blue-800 dark:border-blue-900 dark:bg-blue-950/20 dark:text-blue-200",
  blocked: "border-amber-200 bg-amber-50/50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/20 dark:text-amber-200",
  completed: "border-emerald-200 bg-emerald-50/30 text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/10 dark:text-emerald-300",
  neutral: "border-border/70 bg-muted/30 text-muted-foreground",
};

const toneIconColors: Record<TodayItemTone, string> = {
  urgent: "text-red-600",
  ready: "text-emerald-600",
  waiting: "text-blue-600",
  blocked: "text-amber-600",
  completed: "text-emerald-600",
  neutral: "text-muted-foreground",
};

function TodayItemRow({ item }: { item: TodayItem }) {
  const tone = item.tone ?? "neutral";
  const Icon = toneIcons[tone];
  const displayCount = item.count !== undefined ? item.count : null;

  const content = (
    <div className="flex items-start gap-3 p-3">
      <div className={cn("mt-0.5 shrink-0", toneIconColors[tone])}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground">{item.title}</p>
          {displayCount !== null && (
            <span className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              tone === "urgent" && "bg-red-100 text-red-700",
              tone === "ready" && "bg-emerald-100 text-emerald-700",
              tone === "waiting" && "bg-blue-100 text-blue-700",
              tone === "blocked" && "bg-amber-100 text-amber-700",
              tone === "completed" && "bg-emerald-100 text-emerald-700",
              tone === "neutral" && "bg-muted text-muted-foreground"
            )}>
              {displayCount}
            </span>
          )}
        </div>
        {item.description && (
          <p className="mt-0.5 text-xs text-muted-foreground">{item.description}</p>
        )}
        {item.meta && (
          <p className="mt-1 text-xs text-muted-foreground/70">{item.meta}</p>
        )}
      </div>
      {item.href && (
        <Button asChild variant="ghost" size="sm" className="h-auto shrink-0 px-2 py-1 text-xs">
          <Link href={item.href}>
            {item.actionLabel ?? "Open"}
            <ArrowRight className="ml-1 h-3 w-3" />
          </Link>
        </Button>
      )}
    </div>
  );

  if (item.href) {
    return (
      <Link href={item.href} className="block rounded-lg transition-colors hover:bg-muted/50">
        {content}
      </Link>
    );
  }

  return <div className="rounded-lg">{content}</div>;
}

function TodaySection({
  title,
  items,
  tone,
  emptyText,
}: {
  title: string;
  items: TodayItem[];
  tone: TodayItemTone;
  emptyText?: string;
}) {
  if (items.length === 0 && !emptyText) return null;

  const Icon = toneIcons[tone];

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 px-1">
        <Icon className={cn("h-3.5 w-3.5", toneIconColors[tone])} />
        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </h4>
        {items.length > 0 && (
          <span className="rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium">
            {items.length}
          </span>
        )}
      </div>
      
      {items.length > 0 ? (
        <div className="space-y-1">
          {items.map((item) => (
            <TodayItemRow key={item.id} item={item} />
          ))}
        </div>
      ) : emptyText ? (
        <p className="px-1 text-xs text-muted-foreground/70">{emptyText}</p>
      ) : null}
    </div>
  );
}

/**
 * TodayViewPanel - Unified "what needs attention today" display
 *
 * Use for:
 * - Workspace home pages "Start Here Today" area
 * - Operational prioritization
 * - Today-focused workflow launch
 *
 * Groups items by operational state:
 * - Urgent: Needs immediate action
 * - Ready: Fully actionable now
 * - Waiting: In queue/pending normally
 * - Blocked: Cannot proceed yet
 * - Completed: Finished today (context only)
 *
 * This answers: what should I do first, what is waiting, what is blocked.
 */
export function TodayViewPanel({
  title = "Today",
  description = "What needs your attention now",
  urgentItems = [],
  readyItems = [],
  waitingItems = [],
  blockedItems = [],
  completedToday,
  completedLabel = "completed today",
  emptyMessage = "All caught up",
  emptyDescription = "No items need your attention right now. Check back later for new work.",
  className,
}: TodayViewPanelProps) {
  const totalActive = urgentItems.length + readyItems.length + waitingItems.length + blockedItems.length;
  const hasWork = totalActive > 0;

  return (
    <div className={cn("rounded-xl border border-border/70 bg-card", className)}>
      {/* Header */}
      <div className="border-b border-border/50 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{title}</h3>
              <p className="text-xs text-muted-foreground">{description}</p>
            </div>
          </div>
          
          {completedToday !== undefined && completedToday > 0 && (
            <div className="text-right">
              <p className="text-lg font-semibold text-emerald-600">{completedToday}</p>
              <p className="text-xs text-muted-foreground">{completedLabel}</p>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {!hasWork ? (
          <div className="flex items-start gap-3 py-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
              <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="font-medium text-foreground">{emptyMessage}</p>
              <p className="mt-1 text-sm text-muted-foreground">{emptyDescription}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <TodaySection
              title="Needs Action Now"
              items={urgentItems}
              tone="urgent"
            />
            
            <TodaySection
              title="Ready to Work On"
              items={readyItems}
              tone="ready"
            />
            
            <TodaySection
              title="Waiting"
              items={waitingItems}
              tone="waiting"
              emptyText="Nothing currently waiting"
            />
            
            <TodaySection
              title="Blocked"
              items={blockedItems}
              tone="blocked"
              emptyText="Nothing currently blocked"
            />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * CompactTodayBadge - Small today indicator for headers or sidebars
 */
export function CompactTodayBadge({
  count,
  label,
  tone = "neutral",
}: {
  count: number;
  label: string;
  tone?: TodayItemTone;
}) {
  return (
    <div className={cn(
      "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm",
      toneStyles[tone]
    )}>
      <span className="font-semibold">{count}</span>
      <span>{label}</span>
    </div>
  );
}

/**
 * TodaySummaryStrip - Horizontal today summary for compact layouts
 */
export type TodaySummaryStripProps = {
  items: {
    label: string;
    count: number;
    tone?: TodayItemTone;
    href?: string;
  }[];
  className?: string;
};

export function TodaySummaryStrip({ items, className }: TodaySummaryStripProps) {
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {items.map((item, i) => (
        <CompactTodayBadge
          key={i}
          count={item.count}
          label={item.label}
          tone={item.tone}
        />
      ))}
    </div>
  );
}

export default TodayViewPanel;

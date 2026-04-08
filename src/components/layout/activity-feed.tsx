"use client";

import Link from "next/link";
import { 
  Clock, 
  FileText, 
  FlaskConical, 
  Pill, 
  CreditCard, 
  UserPlus,
  CheckCircle2,
  AlertCircle,
  User,
  BedDouble,
  MoreHorizontal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type ActivityType = 
  | "patient"
  | "encounter"
  | "lab"
  | "prescription"
  | "payment"
  | "admission"
  | "discharge"
  | "invoice"
  | "generic";

export type ActivityItem = {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  actor?: string;
  timestamp: string;
  href?: string;
  actionLabel?: string;
  /** Optional status indicator */
  status?: "completed" | "pending" | "failed";
};

export type ActivityFeedProps = {
  title?: string;
  description?: string;
  items: ActivityItem[];
  /** Max items to show */
  maxItems?: number;
  /** Show "view all" link */
  viewAllHref?: string;
  viewAllLabel?: string;
  /** Empty state message */
  emptyMessage?: string;
  emptyDescription?: string;
  className?: string;
  /** Compact mode for side panels */
  compact?: boolean;
};

const typeIcons: Record<ActivityType, typeof FileText> = {
  patient: UserPlus,
  encounter: FileText,
  lab: FlaskConical,
  prescription: Pill,
  payment: CreditCard,
  admission: BedDouble,
  discharge: CheckCircle2,
  invoice: FileText,
  generic: Clock,
};

const typeColors: Record<ActivityType, string> = {
  patient: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  encounter: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  lab: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  prescription: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  payment: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  admission: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300",
  discharge: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  invoice: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300",
  generic: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

function formatRelativeTime(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString();
}

/**
 * ActivityFeed - Unified recent activity display
 *
 * Use for:
 * - Recent check-ins
 * - Recent encounter/lab/prescription updates
 * - Recent payments
 * - Recent admissions/transfers/discharge actions
 * - Recent setup/config changes
 *
 * This answers: what happened recently, different from alerts (what needs you).
 *
 * Example:
 * <ActivityFeed
 *   title="Recent Activity"
 *   items={[
 *     {
 *       id: "1",
 *       type: "lab",
 *       title: "Lab results entered",
 *       description: "CBC for Patient John Doe",
 *       actor: "Dr. Smith",
 *       timestamp: "2024-01-15T10:30:00Z",
 *       href: "/h/slug/lab/orders/123",
 *     },
 *   ]}
 * />
 */
export function ActivityFeed({
  title = "Recent Activity",
  description,
  items,
  maxItems = 10,
  viewAllHref,
  viewAllLabel = "View all activity",
  emptyMessage = "No recent activity",
  emptyDescription = "Activity will appear here as users perform actions across the hospital workspace.",
  className,
  compact = false,
}: ActivityFeedProps) {
  const displayItems = items.slice(0, maxItems);

  if (items.length === 0) {
    return (
      <div className={cn("rounded-xl border border-border/70 bg-background p-5", className)}>
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <Clock className="h-5 w-5 text-muted-foreground" />
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
          {viewAllHref && (
            <Button asChild variant="ghost" size="sm">
              <Link href={viewAllHref}>{viewAllLabel}</Link>
            </Button>
          )}
        </div>
      </div>

      <div className={cn("divide-y divide-border/50", compact && "max-h-[400px] overflow-y-auto")}>
        {displayItems.map((item) => (
          <ActivityItemRow key={item.id} item={item} compact={compact} />
        ))}
      </div>
    </div>
  );
}

function ActivityItemRow({
  item,
  compact,
}: {
  item: ActivityItem;
  compact?: boolean;
}) {
  const Icon = typeIcons[item.type];

  const content = (
    <div className="flex items-start gap-3 p-4">
      <div className={cn(
        "flex shrink-0 items-center justify-center rounded-lg",
        compact ? "h-8 w-8" : "h-10 w-10",
        typeColors[item.type]
      )}>
        <Icon className={cn(compact ? "h-4 w-4" : "h-5 w-5")} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className={cn("font-medium text-foreground", compact && "text-sm")}>
            {item.title}
          </p>
          <span className="shrink-0 text-xs text-muted-foreground">
            {formatRelativeTime(item.timestamp)}
          </span>
        </div>
        {item.description && (
          <p className={cn("text-muted-foreground", compact ? "text-xs" : "text-sm")}>
            {item.description}
          </p>
        )}
        {item.actor && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            by {item.actor}
          </p>
        )}
        {item.status && (
          <div className="mt-1.5">
            <ActivityStatusBadge status={item.status} />
          </div>
        )}
        {item.href && item.actionLabel && !compact && (
          <div className="mt-2">
            <Button asChild variant="link" size="sm" className="h-auto p-0">
              <Link href={item.href}>{item.actionLabel}</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  if (item.href) {
    return (
      <Link href={item.href} className="block transition-colors hover:bg-muted/30">
        {content}
      </Link>
    );
  }

  return <div className="transition-colors hover:bg-muted/30">{content}</div>;
}

function ActivityStatusBadge({ status }: { status: ActivityItem["status"] }) {
  const styles = {
    completed: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
    pending: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    failed: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  };

  const labels = {
    completed: "Completed",
    pending: "Pending",
    failed: "Failed",
  };

  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", styles[status!])}>
      {labels[status!]}
    </span>
  );
}

/**
 * CompactActivity - Minimal activity list for tight spaces
 */
export function CompactActivity({
  items,
  maxItems = 5,
  emptyMessage = "No recent activity",
}: {
  items: ActivityItem[];
  maxItems?: number;
  emptyMessage?: string;
}) {
  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">{emptyMessage}</p>
    );
  }

  const displayItems = items.slice(0, maxItems);

  return (
    <div className="space-y-2">
      {displayItems.map((item) => {
        const Icon = typeIcons[item.type];
        return (
          <div key={item.id} className="flex items-center gap-2 text-sm">
            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="flex-1 truncate">{item.title}</span>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(item.timestamp)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * ActivityTimeline - Vertical timeline view for detail pages
 */
export function ActivityTimeline({
  items,
  emptyMessage = "No activity recorded yet",
}: {
  items: ActivityItem[];
  emptyMessage?: string;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="relative space-y-0">
      {/* Timeline line */}
      <div className="absolute left-4 top-4 bottom-4 w-px bg-border" />

      {items.map((item, index) => {
        const Icon = typeIcons[item.type];
        return (
          <div key={item.id} className="relative flex gap-4 pb-6 last:pb-0">
            {/* Timeline dot */}
            <div className={cn(
              "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 border-background",
              typeColors[item.type]
            )}>
              <Icon className="h-3.5 w-3.5" />
            </div>

            {/* Content */}
            <div className="min-w-0 flex-1 pt-0.5">
              {item.href ? (
                <Link href={item.href} className="group block">
                  <p className="font-medium text-foreground group-hover:text-primary">
                    {item.title}
                  </p>
                </Link>
              ) : (
                <p className="font-medium text-foreground">{item.title}</p>
              )}
              {item.description && (
                <p className="text-sm text-muted-foreground">{item.description}</p>
              )}
              <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                {item.actor && <span>{item.actor}</span>}
                <span>·</span>
                <span>{formatRelativeTime(item.timestamp)}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

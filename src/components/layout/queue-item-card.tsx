import Link from "next/link";
import { cn } from "@/lib/utils";
import { StatusBadge, StatusTone } from "@/components/layout/status-badge";
import { RowActions, RowActionsProps } from "@/components/layout/row-actions";
import { TaskReadinessRow } from "@/components/layout/task-readiness-summary";
import { ReadinessSignal } from "@/lib/ui/task-state";

export type QueueItemMetaItem = {
  label?: string;
  value: React.ReactNode;
};

export type QueueItemCardProps = {
  /** Unique identifier */
  id: string;
  /** Primary title/name */
  title: string;
  /** Subtitle or secondary identifier */
  subtitle?: string;
  /** href for clickable title */
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
  /** Metadata grid items */
  meta?: QueueItemMetaItem[];
  /** Row actions */
  actions?: RowActionsProps;
  /** Click handler for the card (if not using href) */
  onClick?: () => void;
  /** Selection state */
  isSelected?: boolean;
  /** Compact mode for dense lists */
  compact?: boolean;
  /** Additional content below meta (e.g., handoff hints) */
  children?: React.ReactNode;
  className?: string;
};

/**
 * QueueItemCard - Consistent card-based row for operational queues and lists
 * 
 * Structure:
 * - Header: Title + Status/Readiness + Badges
 * - Meta: Grid of metadata items
 * - Actions: Row-level action buttons
 * 
 * Use for:
 * - Doctor queue items
 * - Lab order lists
 * - Pharmacy prescriptions
 * - Billing invoices
 * - Ward admissions
 * - Front desk queues
 * 
 * Mobile-friendly: Stacks vertically on small screens
 */
export function QueueItemCard({
  id,
  title,
  subtitle,
  href,
  status,
  readiness,
  badges = [],
  meta = [],
  actions,
  onClick,
  isSelected = false,
  compact = false,
  children,
  className,
}: QueueItemCardProps) {
  // Filter out empty meta items
  const validMeta = meta.filter((item) => item.value != null && item.value !== "" && item.value !== "—");

  if (compact) {
    return (
      <div
        className={cn(
          "rounded-xl border bg-background p-3 transition-colors",
          isSelected
            ? "border-primary bg-primary/5 ring-1 ring-primary"
            : "border-border/70 hover:border-primary/50 hover:bg-muted/30",
          className
        )}
      >
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
              {status && (
                <StatusBadge
                  label={status.label}
                  tone={status.tone}
                  compact
                  dot
                />
              )}
              {readiness && <TaskReadinessRow signal={readiness} />}
            </div>
            {subtitle && (
              <p className="mt-0.5 truncate text-xs text-muted-foreground">
                {subtitle}
              </p>
            )}
          </div>
          {actions && <RowActions {...actions} size="sm" />}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "rounded-2xl border bg-background p-4 transition-colors",
        isSelected
          ? "border-primary bg-primary/5 ring-1 ring-primary"
          : "border-border/70 hover:border-primary/50 hover:bg-muted/30",
        (href || onClick) && "cursor-pointer",
        className
      )}
    >
      <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
        {/* Left: Identity + Metadata */}
        <div className="min-w-0 flex-1 space-y-3">
          {/* Header: Title + Status/Badges */}
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

          {/* Subtitle */}
          {subtitle && (
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          )}

          {/* Metadata Grid */}
          {validMeta.length > 0 && (
            <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-2 xl:grid-cols-4">
              {validMeta.map((item, index) => (
                <p key={index}>
                  {item.label ? `${item.label}: ` : null}
                  {item.value}
                </p>
              ))}
            </div>
          )}
          
          {/* Additional content (e.g., handoff hints) */}
          {children}
        </div>

        {/* Right: Actions */}
        {actions && (
          <div className="flex-shrink-0">
            <RowActions {...actions} size="sm" />
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * CompactQueueItem - Minimal queue item for side panels and dense lists
 */
export function CompactQueueItem({
  title,
  subtitle,
  href,
  status,
  isSelected = false,
  onClick,
  className,
}: {
  title: string;
  subtitle?: string;
  href?: string;
  status?: {
    label: string;
    tone: StatusTone;
  };
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}) {
  const content = (
    <>
      <div className="flex items-center gap-2">
        <span className="truncate font-medium text-foreground">{title}</span>
        {status && (
          <StatusBadge label={status.label} tone={status.tone} compact dot />
        )}
      </div>
      {subtitle && (
        <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>
      )}
    </>
  );

  const baseClasses = cn(
    "w-full rounded-xl border p-3 text-left transition-all",
    isSelected
      ? "border-primary bg-primary/5 ring-1 ring-primary"
      : "border-border/70 bg-background hover:border-primary/50 hover:bg-muted/30"
  );

  if (href) {
    return (
      <Link href={href} className={cn(baseClasses, className)}>
        {content}
      </Link>
    );
  }

  if (onClick) {
    return (
      <button onClick={onClick} className={cn(baseClasses, className)}>
        {content}
      </button>
    );
  }

  return <div className={cn(baseClasses, className)}>{content}</div>;
}

/**
 * QueueSection - Grouped section of queue items
 */
export function QueueSection({
  title,
  description,
  children,
  count,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  count?: number;
  className?: string;
}) {
  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}
        </div>
        {count !== undefined && (
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium">
            {count}
          </span>
        )}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

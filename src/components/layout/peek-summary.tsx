"use client";

import Link from "next/link";
import { ExternalLink, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type PeekSummaryItem = {
  label: string;
  value: React.ReactNode;
  /** Highlight this item */
  highlight?: boolean;
  /** Link to full detail page */
  href?: string;
};

export type PeekSummaryProps = {
  /** Title for the peek section */
  title?: string;
  /** Description/subtitle */
  description?: string;
  /** Items to display */
  items: PeekSummaryItem[];
  /** Number of columns for the grid */
  columns?: 1 | 2 | 3 | 4;
  /** Full page link (escape hatch) */
  fullPageHref?: string;
  /** Label for full page link */
  fullPageLabel?: string;
  /** Visual density */
  density?: "compact" | "default" | "relaxed";
  /** Border style */
  bordered?: boolean;
  className?: string;
};

/**
 * PeekSummary - Compact metadata summary for peeks and previews
 *
 * Use for:
 * - Quick patient context summaries
 * - Order/invoice metadata peeks
 * - Preview card detail grids
 * - Inline metadata reveals
 *
 * Features:
 * - Configurable column layout
 * - Optional full page link
 * - Highlight support for key facts
 * - Consistent label/value styling
 *
 * Example:
 * <PeekSummary
 *   title="Patient Summary"
 *   items={[
 *     { label: "Age", value: "34y" },
 *     { label: "Gender", value: "Male" },
 *     { label: "ID", value: patient.id, highlight: true },
 *   ]}
 *   columns={3}
 *   fullPageHref={`/h/${slug}/patients/${id}`}
 * />
 */
export function PeekSummary({
  title,
  description,
  items,
  columns = 2,
  fullPageHref,
  fullPageLabel = "View full details",
  density = "default",
  bordered = true,
  className,
}: PeekSummaryProps) {
  const colClasses = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4",
  };

  const densityClasses = {
    compact: "gap-2 p-3",
    default: "gap-3 p-4",
    relaxed: "gap-4 p-5",
  };

  return (
    <div
      className={cn(
        "rounded-xl bg-background",
        bordered && "border border-border/70",
        className
      )}
    >
      {/* Header */}
      {(title || description || fullPageHref) && (
        <div className="flex items-start justify-between gap-4 border-b border-border/50 px-4 py-3">
          <div>
            {title && <h4 className="font-medium text-foreground">{title}</h4>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </div>
          {fullPageHref && (
            <Button variant="ghost" size="sm" asChild className="shrink-0">
              <Link href={fullPageHref} className="gap-1">
                {fullPageLabel}
                <ExternalLink className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </div>
      )}

      {/* Items Grid */}
      <div className={cn("grid", colClasses[columns], densityClasses[density])}>
        {items.map((item, index) => (
          <div
            key={index}
            className={cn(
              "min-w-0",
              item.highlight && "rounded-lg bg-muted/50 p-2"
            )}
          >
            <dt className="text-xs font-medium uppercase tracking-[0.1em] text-muted-foreground">
              {item.label}
            </dt>
            <dd className={cn("mt-0.5 text-sm", item.highlight ? "font-semibold text-foreground" : "text-foreground")}>
              {item.href ? (
                <Link href={item.href} className="inline-flex items-center gap-0.5 hover:text-primary hover:underline">
                  {item.value}
                  <ChevronRight className="h-3 w-3" />
                </Link>
              ) : (
                item.value
              )}
            </dd>
          </div>
        ))}
      </div>
    </div>
  );
}

export type CompactPeekProps = {
  /** Items in compact format - shown inline */
  items: Array<{
    label: string;
    value: React.ReactNode;
  }>;
  /** Separator between items */
  separator?: string;
  className?: string;
};

/**
 * CompactPeek - Inline metadata peek for tight spaces
 *
 * Use for:
 * - Row-level metadata hints
 * - Inline summary text
 * - Quick fact reveals
 *
 * Example:
 * <CompactPeek
 *   items={[
 *     { label: "Balance", value: `Rs. ${balance}` },
 *     { label: "Due", value: dueDate },
 *   ]}
 * />
 */
export function CompactPeek({ items, separator = " · ", className }: CompactPeekProps) {
  return (
    <span className={cn("text-sm text-muted-foreground", className)}>
      {items.map((item, index) => (
        <span key={index}>
          <span className="text-xs text-muted-foreground/70">{item.label}:</span>{" "}
          <span className="text-foreground">{item.value}</span>
          {index < items.length - 1 && (
            <span className="mx-1 text-muted-foreground/50">{separator}</span>
          )}
        </span>
      ))}
    </span>
  );
}

export type PeekStackProps = {
  /** Stack items - each is a row */
  items: Array<{
    label: string;
    value: React.ReactNode;
    secondary?: React.ReactNode;
  }>;
  /** Whether to show dividers between items */
  dividers?: boolean;
  className?: string;
};

/**
 * PeekStack - Vertical stack of labeled values
 *
 * Use for:
 * - Contact information peeks
 * - Address blocks
 * - Multi-line metadata
 *
 * Example:
 * <PeekStack
 *   items={[
 *     { label: "Phone", value: patient.phone },
 *     { label: "Email", value: patient.email },
 *     { label: "Address", value: patient.address, secondary: patient.city },
 *   ]}
 * />
 */
export function PeekStack({ items, dividers = true, className }: PeekStackProps) {
  return (
    <dl className={cn("space-y-2", dividers && "divide-y", className)}>
      {items.map((item, index) => (
        <div
          key={index}
          className={cn(
            "flex items-start justify-between gap-4",
            dividers && index > 0 && "pt-2"
          )}
        >
          <dt className="text-sm text-muted-foreground">{item.label}</dt>
          <dd className="text-right text-sm text-foreground">
            <div>{item.value}</div>
            {item.secondary && (
              <div className="text-xs text-muted-foreground">{item.secondary}</div>
            )}
          </dd>
        </div>
      ))}
    </dl>
  );
}

export type PeekBadgeProps = {
  /** Badge label */
  label: string;
  /** Optional count/value */
  value?: string | number;
  /** Click to peek */
  onClick?: () => void;
  /** Full page link */
  href?: string;
  className?: string;
};

/**
 * PeekBadge - Clickable badge that reveals detail
 *
 * Use for:
 * - Count badges that expand
 * - Status indicators with hidden detail
 * - Quick stat reveals
 *
 * Example:
 * <PeekBadge label="Payments" value={3} onClick={() => setShowPayments(true)} />
 */
export function PeekBadge({ label, value, onClick, href, className }: PeekBadgeProps) {
  const content = (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium",
        (onClick || href) && "cursor-pointer hover:bg-muted/80",
        className
      )}
    >
      <span className="text-muted-foreground">{label}</span>
      {value !== undefined && <span className="text-foreground">{value}</span>}
    </span>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  if (onClick) {
    return <button onClick={onClick}>{content}</button>;
  }

  return content;
}

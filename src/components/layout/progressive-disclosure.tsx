"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

export type ProgressiveDisclosureProps = {
  /** Always-visible summary content */
  summary: React.ReactNode;
  /** Content revealed when expanded */
  children: React.ReactNode;
  /** Label for the expand button (default: "Show more") */
  expandLabel?: string;
  /** Label for the collapse button (default: "Show less") */
  collapseLabel?: string;
  /** External control for expanded state */
  expanded?: boolean;
  /** Callback when expanded state changes */
  onExpandedChange?: (expanded: boolean) => void;
  /** Default expanded state (default: false) */
  defaultExpanded?: boolean;
  /** Visual variant */
  variant?: "default" | "bordered" | "subtle";
  /** Whether the trigger button should be at the top instead of bottom */
  triggerPosition?: "bottom" | "top" | "both";
  /** Custom trigger element */
  customTrigger?: React.ReactNode;
  className?: string;
  /** Content wrapper className */
  contentClassName?: string;
};

/**
 * ProgressiveDisclosure - Show more/less wrapper for content sections
 *
 * Use for:
 * - Hiding secondary details in detail pages
 * - Collapsing long metadata lists
 * - Progressive reveal of activity/history
 * - Keeping primary information visible while secondary is optional
 *
 * Example:
 * <ProgressiveDisclosure
 *   summary={<InvoiceSummary invoice={invoice} />}
 *   expandLabel="View full payment history"
 *   collapseLabel="Hide payment history"
 * >
 *   <PaymentHistory payments={payments} />
 * </ProgressiveDisclosure>
 */
export function ProgressiveDisclosure({
  summary,
  children,
  expandLabel = "Show more",
  collapseLabel = "Show less",
  expanded: controlledExpanded,
  onExpandedChange,
  defaultExpanded = false,
  variant = "default",
  triggerPosition = "bottom",
  customTrigger,
  className,
  contentClassName,
}: ProgressiveDisclosureProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isExpanded = controlledExpanded ?? internalExpanded;
  const setIsExpanded = onExpandedChange ?? setInternalExpanded;

  const toggle = () => setIsExpanded(!isExpanded);

  const variantStyles = {
    default: "",
    bordered: "rounded-xl border border-border/70 bg-background",
    subtle: "rounded-lg bg-muted/30",
  };

  const renderTrigger = () =>
    customTrigger ? (
      <div onClick={toggle} className="cursor-pointer">
        {customTrigger}
      </div>
    ) : (
      <Button
        variant="ghost"
        size="sm"
        onClick={toggle}
        className="text-muted-foreground hover:text-foreground"
      >
        {isExpanded ? (
          <>
            {collapseLabel}
            <ChevronUp className="ml-1 h-4 w-4" />
          </>
        ) : (
          <>
            {expandLabel}
            <ChevronDown className="ml-1 h-4 w-4" />
          </>
        )}
      </Button>
    );

  return (
    <div className={cn(variantStyles[variant], className)}>
      {/* Top trigger */}
      {triggerPosition !== "bottom" && (
        <div className="flex items-center justify-between border-b border-border/50 p-4">
          <div className="flex-1">{summary}</div>
          {renderTrigger()}
        </div>
      )}

      {/* Summary when trigger is at bottom */}
      {triggerPosition === "bottom" && <div className="p-4">{summary}</div>}

      {/* Expanded content */}
      {isExpanded && (
        <div
          className={cn(
            "border-t border-border/50",
            triggerPosition === "bottom" ? "p-4 pt-4" : "p-4",
            contentClassName
          )}
        >
          {children}
        </div>
      )}

      {/* Bottom trigger */}
      {triggerPosition !== "top" && triggerPosition !== "both" && (
        <div className="border-t border-border/50 px-4 py-2">
          {renderTrigger()}
        </div>
      )}
    </div>
  );
}

export type InlineDisclosureProps = {
  /** The label for the disclosure trigger */
  label: string;
  /** Content revealed when expanded */
  children: React.ReactNode;
  /** External control for expanded state */
  expanded?: boolean;
  /** Callback when expanded state changes */
  onExpandedChange?: (expanded: boolean) => void;
  /** Default expanded state */
  defaultExpanded?: boolean;
  /** Icon to show alongside label */
  icon?: React.ReactNode;
  className?: string;
};

/**
 * InlineDisclosure - Compact inline expand/collapse
 *
 * Use for:
 * - Revealing extra metadata inline
 * - Quick detail expansions within text flow
 * - Small context reveals
 *
 * Example:
 * <InlineDisclosure label="View allocations">
 *   <PaymentAllocations allocations={allocations} />
 * </InlineDisclosure>
 */
export function InlineDisclosure({
  label,
  children,
  expanded: controlledExpanded,
  onExpandedChange,
  defaultExpanded = false,
  icon,
  className,
}: InlineDisclosureProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isExpanded = controlledExpanded ?? internalExpanded;
  const setIsExpanded = onExpandedChange ?? setInternalExpanded;

  return (
    <div className={cn("inline-block", className)}>
      <Button
        variant="link"
        size="sm"
        className="h-auto p-0 font-normal"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {icon && <span className="mr-1">{icon}</span>}
        {label}
        {isExpanded ? (
          <ChevronUp className="ml-0.5 h-3.5 w-3.5" />
        ) : (
          <ChevronDown className="ml-0.5 h-3.5 w-3.5" />
        )}
      </Button>

      {isExpanded && (
        <div className="mt-2 rounded-lg border bg-background p-3">{children}</div>
      )}
    </div>
  );
}

export type SectionDisclosureProps = {
  /** Section title */
  title: string;
  /** Optional description */
  description?: string;
  /** Content revealed when expanded */
  children: React.ReactNode;
  /** External control for expanded state */
  expanded?: boolean;
  /** Callback when expanded state changes */
  onExpandedChange?: (expanded: boolean) => void;
  /** Default expanded state */
  defaultExpanded?: boolean;
  /** Whether this section is optional/empty */
  empty?: boolean;
  /** Message when empty */
  emptyMessage?: string;
  className?: string;
};

/**
 * SectionDisclosure - Expandable section within detail pages
 *
 * Use for:
 * - Collapsible detail page sections
 * - Secondary information that may be optional
 * - Activity/history sections
 * - Metadata sections that can be hidden
 *
 * Example:
 * <SectionDisclosure
 *   title="Payment History"
 *   description="Payments already posted to this invoice"
 *   empty={payments.length === 0}
 *   emptyMessage="No payments recorded yet"
 * >
 *   <PaymentsList payments={payments} />
 * </SectionDisclosure>
 */
export function SectionDisclosure({
  title,
  description,
  children,
  expanded: controlledExpanded,
  onExpandedChange,
  defaultExpanded = false,
  empty = false,
  emptyMessage = "No data available",
  className,
}: SectionDisclosureProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  const isExpanded = controlledExpanded ?? internalExpanded;
  const setIsExpanded = onExpandedChange ?? setInternalExpanded;

  return (
    <section className={cn("rounded-xl border border-border/70 bg-background", className)}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/30"
      >
        <div>
          <h3 className="font-medium text-foreground">{title}</h3>
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </div>
        <ChevronDown
          className={cn("h-5 w-5 text-muted-foreground transition-transform", isExpanded && "rotate-180")}
        />
      </button>

      {isExpanded && (
        <div className="border-t border-border/50 p-4">
          {empty ? (
            <p className="text-sm text-muted-foreground">{emptyMessage}</p>
          ) : (
            children
          )}
        </div>
      )}
    </section>
  );
}

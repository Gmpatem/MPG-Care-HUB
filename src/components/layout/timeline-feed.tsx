"use client";

import Link from "next/link";
import { useState } from "react";
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
  ChevronDown,
  ChevronUp,
  Stethoscope,
  ClipboardCheck,
  Move,
  DoorOpen,
  Banknote,
  Receipt,
  Activity,
  type LucideIcon
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

/**
 * TimelineEventType - Standardized event types across all modules
 * 
 * These map to different domains:
 * - Patient/admission: admission, discharge, transfer
 * - Clinical: encounter, vitals, nurse_note, doctor_round
 * - Lab: lab_order, lab_result, specimen_collected
 * - Pharmacy: prescription, dispensation
 * - Billing: invoice, payment, receipt
 * - Admin: user_action, config_change (use sparingly)
 */
export type TimelineEventType = 
  | "admission"
  | "discharge"
  | "transfer"
  | "encounter"
  | "vitals"
  | "nurse_note"
  | "doctor_round"
  | "lab_order"
  | "lab_result"
  | "specimen_collected"
  | "prescription"
  | "dispensation"
  | "invoice"
  | "payment"
  | "receipt"
  | "user_action"
  | "system"
  | "generic";

/**
 * TimelineEvent - A single event in the timeline
 */
export type TimelineEvent = {
  id: string;
  type: TimelineEventType;
  /** Event title - short, active voice, past tense */
  title: string;
  /** Optional longer description */
  description?: string;
  /** Who performed the action */
  actor?: {
    name: string;
    role?: string;
    href?: string;
  };
  /** When the event occurred */
  timestamp: string;
  /** Event tone for visual styling */
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
  /** Link to related detail page */
  href?: string;
  /** Action button label if clickable */
  actionLabel?: string;
  /** Optional expandable details */
  details?: {
    label: string;
    value: string | React.ReactNode;
  }[];
  /** Optional status badge */
  status?: {
    label: string;
    tone: "neutral" | "info" | "success" | "warning" | "danger";
  };
};

export type TimelineFeedProps = {
  title?: string;
  description?: string;
  events: TimelineEvent[];
  /** Show newest first (default) or oldest first */
  sort?: "newest" | "oldest";
  /** Max events to show initially */
  maxEvents?: number;
  /** Show "show more" button if events exceed max */
  expandable?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  emptyDescription?: string;
  className?: string;
  /** Compact mode for tighter spaces */
  compact?: boolean;
  /** Show vertical timeline connector line */
  showConnector?: boolean;
};

const typeIcons: Record<TimelineEventType, LucideIcon> = {
  admission: UserPlus,
  discharge: DoorOpen,
  transfer: Move,
  encounter: Stethoscope,
  vitals: Activity,
  nurse_note: FileText,
  doctor_round: Stethoscope,
  lab_order: FlaskConical,
  lab_result: CheckCircle2,
  specimen_collected: FlaskConical,
  prescription: Pill,
  dispensation: Pill,
  invoice: FileText,
  payment: Banknote,
  receipt: Receipt,
  user_action: User,
  system: Clock,
  generic: Clock,
};

const typeColors: Record<TimelineEventType, string> = {
  admission: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800",
  discharge: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700",
  transfer: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300 border-violet-200 dark:border-violet-800",
  encounter: "bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 border-sky-200 dark:border-sky-800",
  vitals: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
  nurse_note: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800",
  doctor_round: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800",
  lab_order: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800",
  lab_result: "bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 border-fuchsia-200 dark:border-fuchsia-800",
  specimen_collected: "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300 border-pink-200 dark:border-pink-800",
  prescription: "bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-300 border-teal-200 dark:border-teal-800",
  dispensation: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-green-200 dark:border-green-800",
  invoice: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800",
  payment: "bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-300 border-lime-200 dark:border-lime-800",
  receipt: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800",
  user_action: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
  system: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
  generic: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700",
};

const toneBadgeStyles = {
  neutral: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
  info: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  success: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  warning: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  danger: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
};

function formatDateTime(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
    hour: "numeric",
    minute: "2-digit",
  });
}

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
  return formatDateTime(timestamp);
}

/**
 * TimelineFeed - Unified timeline component for historical visibility
 * 
 * Use for:
 * - Admission/discharge history
 * - Lab order progression
 * - Invoice payment history
 * - Prescription dispensing timeline
 * - Patient care chronology
 * - Audit trails where appropriate
 * 
 * This answers: what happened, in what order, by whom, when.
 * 
 * Example:
 * <TimelineFeed
 *   title="Admission History"
 *   events={[
 *     {
 *       id: "1",
 *       type: "admission",
 *       title: "Patient admitted",
 *       actor: { name: "Dr. Smith", role: "Attending Physician" },
 *       timestamp: "2024-01-15T08:30:00Z",
 *       details: [
 *         { label: "Ward", value: "General Ward A" },
 *         { label: "Bed", value: "101" },
 *       ],
 *     },
 *   ]}
 * />
 */
export function TimelineFeed({
  title = "Timeline",
  description,
  events,
  sort = "newest",
  maxEvents = 10,
  expandable = true,
  emptyMessage = "No events recorded",
  emptyDescription = "Activity will appear here as actions are performed.",
  className,
  compact = false,
  showConnector = true,
}: TimelineFeedProps) {
  const [expanded, setExpanded] = useState(false);

  const sortedEvents = [...events].sort((a, b) => {
    const aTime = new Date(a.timestamp).getTime();
    const bTime = new Date(b.timestamp).getTime();
    return sort === "newest" ? bTime - aTime : aTime - bTime;
  });

  const displayEvents = expanded 
    ? sortedEvents 
    : sortedEvents.slice(0, maxEvents);

  const hasMore = sortedEvents.length > maxEvents;

  if (events.length === 0) {
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
      {(title || description) && (
        <div className="border-b border-border/50 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              {title && <h3 className="font-semibold text-foreground">{title}</h3>}
              {description && (
                <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
              )}
            </div>
            {events.length > 0 && (
              <span className="text-xs text-muted-foreground">
                {events.length} event{events.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      )}

      <div className="p-4">
        <div className={cn("relative", showConnector && "pl-4")}>
          {showConnector && displayEvents.length > 1 && (
            <div className="absolute left-[19px] top-3 bottom-3 w-px bg-border" />
          )}

          <div className="space-y-4">
            {displayEvents.map((event, index) => (
              <TimelineEventRow 
                key={event.id} 
                event={event} 
                compact={compact}
                isFirst={index === 0}
                isLast={index === displayEvents.length - 1}
              />
            ))}
          </div>
        </div>
      </div>

      {hasMore && expandable && (
        <div className="border-t border-border/50 px-5 py-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? (
              <>
                <ChevronUp className="mr-2 h-4 w-4" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="mr-2 h-4 w-4" />
                Show {sortedEvents.length - maxEvents} more
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}

function TimelineEventRow({
  event,
  compact,
  isFirst,
  isLast,
}: {
  event: TimelineEvent;
  compact?: boolean;
  isFirst?: boolean;
  isLast?: boolean;
}) {
  const [detailsExpanded, setDetailsExpanded] = useState(false);
  const Icon = typeIcons[event.type];
  const hasDetails = event.details && event.details.length > 0;
  const hasAction = event.href && event.actionLabel;

  const content = (
    <div className="flex gap-3">
      {/* Icon/dot */}
      <div className={cn(
        "relative z-10 flex shrink-0 items-center justify-center rounded-full border-2 border-background",
        compact ? "h-8 w-8" : "h-10 w-10",
        typeColors[event.type]
      )}>
        <Icon className={cn(compact ? "h-4 w-4" : "h-5 w-5")} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1 pt-1">
        {/* Header: Title and timestamp */}
        <div className="flex flex-wrap items-start justify-between gap-x-3 gap-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className={cn("font-medium text-foreground", compact && "text-sm")}>
              {event.title}
            </p>
            {event.status && (
              <Badge 
                variant="secondary" 
                className={cn("text-xs", toneBadgeStyles[event.status.tone])}
              >
                {event.status.label}
              </Badge>
            )}
          </div>
          <time 
            className="shrink-0 text-xs text-muted-foreground"
            dateTime={event.timestamp}
            title={formatDateTime(event.timestamp)}
          >
            {formatRelativeTime(event.timestamp)}
          </time>
        </div>

        {/* Actor */}
        {event.actor && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            by{" "}
            {event.actor.href ? (
              <Link href={event.actor.href} className="hover:text-primary hover:underline">
                {event.actor.name}
              </Link>
            ) : (
              <span className="font-medium">{event.actor.name}</span>
            )}
            {event.actor.role && <span> · {event.actor.role}</span>}
          </p>
        )}

        {/* Description */}
        {event.description && (
          <p className={cn("mt-1 text-muted-foreground", compact ? "text-xs" : "text-sm")}>
            {event.description}
          </p>
        )}

        {/* Expandable details */}
        {hasDetails && (
          <div className="mt-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-auto p-0 text-xs"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDetailsExpanded(!detailsExpanded);
              }}
            >
              {detailsExpanded ? (
                <><ChevronUp className="mr-1 h-3 w-3" /> Less detail</>
              ) : (
                <><ChevronDown className="mr-1 h-3 w-3" /> More detail</>
              )}
            </Button>

            {detailsExpanded && (
              <div className="mt-2 rounded-lg bg-muted/50 p-3">
                <dl className="space-y-1">
                  {event.details?.map((detail, idx) => (
                    <div key={idx} className="flex gap-2 text-sm">
                      <dt className="text-muted-foreground">{detail.label}:</dt>
                      <dd className="font-medium">{detail.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        )}

        {/* Action link */}
        {hasAction && (
          <div className="mt-2">
            <Button asChild variant="link" size="sm" className="h-auto p-0">
              <Link href={event.href!}>{event.actionLabel}</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );

  if (event.href && !hasDetails) {
    return (
      <Link 
        href={event.href} 
        className="block rounded-lg p-2 -mx-2 transition-colors hover:bg-muted/30"
      >
        {content}
      </Link>
    );
  }

  return <div className="rounded-lg p-2 -mx-2">{content}</div>;
}

/**
 * CompactTimeline - Minimal timeline for tight spaces
 */
export function CompactTimeline({
  events,
  maxEvents = 5,
  emptyMessage = "No activity",
}: {
  events: TimelineEvent[];
  maxEvents?: number;
  emptyMessage?: string;
}) {
  if (events.length === 0) {
    return <p className="text-sm text-muted-foreground">{emptyMessage}</p>;
  }

  const sortedEvents = [...events]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, maxEvents);

  return (
    <div className="space-y-2">
      {sortedEvents.map((event) => {
        const Icon = typeIcons[event.type];
        return (
          <div key={event.id} className="flex items-center gap-2 text-sm">
            <Icon className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="flex-1 truncate">{event.title}</span>
            <span className="text-xs text-muted-foreground">
              {formatRelativeTime(event.timestamp)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

/**
 * TimelineSection - Wrapper for placing timeline in a page section
 */
export function TimelineSection({
  title,
  description,
  events,
  emptyMessage,
  viewAllHref,
  viewAllLabel = "View full history",
  className,
}: {
  title: string;
  description?: string;
  events: TimelineEvent[];
  emptyMessage?: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  className?: string;
}) {
  return (
    <section className={cn("surface-panel p-4 sm:p-5", className)}>
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{title}</h3>
        {description && <p className="text-sm text-muted-foreground">{description}</p>}
      </div>

      <TimelineFeed
        events={events}
        showConnector={true}
        emptyMessage={emptyMessage}
        compact
      />

      {viewAllHref && events.length > 0 && (
        <div className="mt-4">
          <Button asChild variant="outline" size="sm" className="w-full">
            <Link href={viewAllHref}>{viewAllLabel}</Link>
          </Button>
        </div>
      )}
    </section>
  );
}

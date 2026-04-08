import type { ReactNode } from "react";
import { 
  Inbox, 
  Search, 
  Users, 
  ClipboardCheck,
  AlertCircle,
  UserRound,
  LucideIcon
} from "lucide-react";

import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export type EmptyStateVariant = "default" | "search" | "queue" | "setup" | "blocked" | "compact";

export type WorkspaceEmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
  secondaryAction?: ReactNode;
  icon?: ReactNode;
  iconComponent?: LucideIcon;
  className?: string;
  variant?: EmptyStateVariant;
};

const variantIcons: Record<EmptyStateVariant, LucideIcon> = {
  default: Inbox,
  search: Search,
  queue: Users,
  setup: ClipboardCheck,
  blocked: AlertCircle,
  compact: Inbox,
};

const variantStyles: Record<EmptyStateVariant, string> = {
  default: "bg-[rgba(14,122,145,0.10)] text-primary",
  search: "bg-[rgba(83,74,183,0.10)] text-indigo-600",
  queue: "bg-[rgba(17,150,176,0.10)] text-cyan-600",
  setup: "bg-[rgba(30,138,82,0.10)] text-emerald-600",
  blocked: "bg-[rgba(224,54,32,0.10)] text-red-600",
  compact: "bg-muted text-muted-foreground",
};

/**
 * WorkspaceEmptyState - Consistent empty state display across all workspaces
 * 
 * Use this component for:
 * - Empty queues (variant="queue")
 * - No search results (variant="search")
 * - Setup/configuration needed (variant="setup")
 * - Blocked workflow states (variant="blocked")
 * - Generic empty states (variant="default")
 * 
 * The component provides:
 * - Consistent visual styling with dashed border
 * - Context-appropriate icons
 * - Primary and secondary action support
 * - Responsive layout
 */
export function WorkspaceEmptyState({
  title,
  description,
  action,
  secondaryAction,
  icon,
  iconComponent,
  className,
  variant = "default",
}: WorkspaceEmptyStateProps) {
  const IconComponent = iconComponent ?? variantIcons[variant];
  const iconStyle = variantStyles[variant];

  // Compact variant - smaller, less padding
  if (variant === "compact") {
    return (
      <div className={cn("rounded-xl border border-dashed border-border/60 bg-muted/30 p-4", className)}>
        <div className="flex items-start gap-3">
          <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-lg", iconStyle)}>
            {icon ?? <IconComponent className="h-4 w-4" />}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="text-sm font-medium text-foreground">{title}</h3>
            <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
            {(action || secondaryAction) ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {action}
                {secondaryAction}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card
      className={cn(
        "overflow-hidden border-dashed border-border/80 bg-[linear-gradient(180deg,rgba(248,250,252,0.88),rgba(255,255,255,0.96))] shadow-none dark:bg-[linear-gradient(180deg,rgba(15,23,42,0.7),rgba(15,23,42,0.88))]",
        className
      )}
    >
      <CardContent className="flex flex-col items-start gap-4 py-8 sm:py-9">
        <div className={cn(
          "flex h-11 w-11 items-center justify-center rounded-2xl ring-1 ring-border/70",
          iconStyle
        )}>
          {icon ?? <IconComponent className="h-5 w-5" />}
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
        </div>

        {(action || secondaryAction) ? (
          <div className="flex flex-wrap gap-2">
            {action}
            {secondaryAction}
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// PRESET EMPTY STATES - Common workspace patterns
// ============================================================================

export type PresetEmptyStateProps = {
  hospitalSlug?: string;
  action?: ReactNode;
  className?: string;
};

/**
 * Empty state for when no patients are in a queue
 */
export function EmptyQueueState({ 
  action,
  className 
}: Omit<PresetEmptyStateProps, "hospitalSlug"> & { 
  queueName?: string;
}) {
  return (
    <WorkspaceEmptyState
      variant="queue"
      title="No patients in queue"
      description="Patients will appear here once they are checked in. Use the intake form to register arrivals."
      action={action}
      className={className}
    />
  );
}

/**
 * Empty state for when no search results are found
 */
export function EmptySearchState({ 
  action,
  className 
}: PresetEmptyStateProps) {
  return (
    <WorkspaceEmptyState
      variant="search"
      title="No matches found"
      description="Try adjusting your search terms or check spelling. You can also register a new patient if needed."
      action={action}
      className={className}
    />
  );
}

/**
 * Empty state for setup/configuration needed
 */
export function SetupNeededState({ 
  title = "Setup required",
  description = "Complete the configuration to enable this workflow.",
  action,
  className 
}: PresetEmptyStateProps & { title?: string; description?: string }) {
  return (
    <WorkspaceEmptyState
      variant="setup"
      title={title}
      description={description}
      action={action}
      className={className}
    />
  );
}

/**
 * Empty state for blocked workflow states
 */
export function BlockedState({ 
  title = "Cannot proceed",
  description = "Complete the required steps before continuing.",
  action,
  className 
}: PresetEmptyStateProps & { title?: string; description?: string }) {
  return (
    <WorkspaceEmptyState
      variant="blocked"
      title={title}
      description={description}
      action={action}
      className={className}
    />
  );
}

/**
 * Empty state for when no patient is selected in a workspace
 */
export function NoPatientSelectedState({ 
  description = "Select a patient from the queue to open their workspace and begin working.",
  className 
}: { description?: string; className?: string }) {
  return (
    <div className={cn("flex h-full min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 p-8 text-center", className)}>
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
        <UserRound className="h-7 w-7 text-muted-foreground" />
      </div>
      <h3 className="mt-4 font-semibold text-foreground">No Patient Selected</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
    </div>
  );
}

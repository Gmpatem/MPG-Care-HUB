"use client";

import Link from "next/link";
import {
  ArrowRight,
  ArrowLeft,
  UserRound,
  Stethoscope,
  FlaskConical,
  Pill,
  CreditCard,
  HeartPulse,
  BedDouble,
  ClipboardList,
  CheckCircle2,
  Clock,
  AlertCircle,
  Ban,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusBadge, type StatusTone } from "./status-badge";

// ============================================================================
// Types
// ============================================================================

export type WorkflowStage =
  | "intake"
  | "doctor"
  | "lab"
  | "pharmacy"
  | "nurse"
  | "ward"
  | "billing"
  | "discharge"
  | "complete";

export type HandoffDirection = "from" | "to" | "blocked" | "waiting" | "returned";

export type WorkflowHandoffStep = {
  stage: WorkflowStage;
  label: string;
  status: "complete" | "active" | "pending" | "blocked" | "waiting";
  timestamp?: string;
  actor?: string;
  description?: string;
  icon?: typeof UserRound;
};

export type WorkflowHandoffCardProps = {
  /** Current stage where the patient/item is being handled */
  currentStage: WorkflowStage;
  /** Previous stage that handed off to current */
  previousStage?: WorkflowStage;
  /** Next expected stage */
  nextStage?: WorkflowStage;
  /** Whether the handoff is currently blocked */
  isBlocked?: boolean;
  /** Blocker description if blocked */
  blockerDescription?: string;
  /** Whether waiting on another role */
  waitingOn?: WorkflowStage;
  /** Whether returned for review/follow-up */
  isReturned?: boolean;
  /** Return reason if returned */
  returnReason?: string;
  /** Hospital slug for generating links */
  hospitalSlug: string;
  /** Patient ID for context links */
  patientId?: string;
  /** Entity IDs for specific links */
  encounterId?: string;
  admissionId?: string;
  labOrderId?: string;
  prescriptionId?: string;
  invoiceId?: string;
  /** Custom next action label */
  nextActionLabel?: string;
  /** Custom next action href */
  nextActionHref?: string;
  /** Compact mode for tight spaces */
  compact?: boolean;
  className?: string;
};

// ============================================================================
// Stage Configuration
// ============================================================================

const STAGE_CONFIG: Record<WorkflowStage, { label: string; icon: typeof UserRound; color: string }> = {
  intake: { label: "Front Desk", icon: ClipboardList, color: "text-blue-600" },
  doctor: { label: "Doctor", icon: Stethoscope, color: "text-emerald-600" },
  lab: { label: "Laboratory", icon: FlaskConical, color: "text-amber-600" },
  pharmacy: { label: "Pharmacy", icon: Pill, color: "text-purple-600" },
  nurse: { label: "Nursing", icon: HeartPulse, color: "text-pink-600" },
  ward: { label: "Ward", icon: BedDouble, color: "text-indigo-600" },
  billing: { label: "Billing", icon: CreditCard, color: "text-cyan-600" },
  discharge: { label: "Discharge", icon: CheckCircle2, color: "text-green-600" },
  complete: { label: "Complete", icon: CheckCircle2, color: "text-green-600" },
};

// ============================================================================
// Helper Components
// ============================================================================

function StageIcon({ stage, status }: { stage: WorkflowStage; status: "complete" | "active" | "pending" | "blocked" | "waiting" }) {
  const config = STAGE_CONFIG[stage];
  const Icon = config.icon;

  const statusStyles = {
    complete: "bg-emerald-100 text-emerald-600",
    active: "bg-primary/10 text-primary ring-2 ring-primary/30",
    pending: "bg-muted text-muted-foreground",
    blocked: "bg-red-100 text-red-600",
    waiting: "bg-amber-100 text-amber-600",
  };

  return (
    <div className={cn("flex h-8 w-8 items-center justify-center rounded-full", statusStyles[status])}>
      <Icon className="h-4 w-4" />
    </div>
  );
}

function StageLabel({ stage, status }: { stage: WorkflowStage; status: "complete" | "active" | "pending" | "blocked" | "waiting" }) {
  const config = STAGE_CONFIG[stage];

  const statusStyles = {
    complete: "text-muted-foreground line-through",
    active: "text-foreground font-medium",
    pending: "text-muted-foreground",
    blocked: "text-red-600 font-medium",
    waiting: "text-amber-600 font-medium",
  };

  return <span className={cn("text-sm", statusStyles[status])}>{config.label}</span>;
}

function HandoffArrow({ direction }: { direction: HandoffDirection }) {
  const icons = {
    from: <ArrowLeft className="h-4 w-4 text-muted-foreground" />,
    to: <ArrowRight className="h-4 w-4 text-muted-foreground" />,
    blocked: <Ban className="h-4 w-4 text-red-500" />,
    waiting: <Clock className="h-4 w-4 text-amber-500" />,
    returned: <ArrowLeft className="h-4 w-4 text-amber-500" />,
  };

  return icons[direction];
}

// ============================================================================
// Main Component
// ============================================================================

/**
 * WorkflowHandoffCard - Shows cross-role handoff context and continuity
 *
 * Use for:
 * - Detail pages to show where patient came from and where they're going
 * - Workspace pages to understand cross-role dependencies
 * - Queue items to hint at next step ownership
 *
 * Displays:
 * - Previous stage (where patient came from)
 * - Current stage (where patient is now)
 * - Next stage (where patient is expected to go)
 * - Blockers or waiting conditions
 * - Return/follow-up status
 */
export function WorkflowHandoffCard({
  currentStage,
  previousStage,
  nextStage,
  isBlocked,
  blockerDescription,
  waitingOn,
  isReturned,
  returnReason,
  hospitalSlug,
  patientId,
  encounterId,
  admissionId,
  labOrderId,
  prescriptionId,
  invoiceId,
  nextActionLabel,
  nextActionHref,
  compact = false,
  className,
}: WorkflowHandoffCardProps) {
  // Generate next action link if not provided
  const getNextAction = () => {
    if (nextActionHref && nextActionLabel) {
      return { href: nextActionHref, label: nextActionLabel };
    }

    if (waitingOn) {
      const paths: Record<WorkflowStage, string> = {
        intake: `/h/${hospitalSlug}/frontdesk`,
        doctor: `/h/${hospitalSlug}/doctor`,
        lab: `/h/${hospitalSlug}/lab`,
        pharmacy: `/h/${hospitalSlug}/pharmacy`,
        nurse: `/h/${hospitalSlug}/nurse`,
        ward: `/h/${hospitalSlug}/ward`,
        billing: `/h/${hospitalSlug}/billing`,
        discharge: `/h/${hospitalSlug}/ward/discharges`,
        complete: `/h/${hospitalSlug}`,
      };
      return {
        href: paths[waitingOn],
        label: `Open ${STAGE_CONFIG[waitingOn].label}`,
      };
    }

    if (nextStage) {
      const paths: Record<WorkflowStage, string> = {
        intake: `/h/${hospitalSlug}/frontdesk`,
        doctor: patientId ? `/h/${hospitalSlug}/doctor/patients/${patientId}` : `/h/${hospitalSlug}/doctor`,
        lab: `/h/${hospitalSlug}/lab/orders`,
        pharmacy: `/h/${hospitalSlug}/pharmacy`,
        nurse: admissionId ? `/h/${hospitalSlug}/nurse/admissions/${admissionId}` : `/h/${hospitalSlug}/nurse`,
        ward: admissionId ? `/h/${hospitalSlug}/ward/admissions/${admissionId}` : `/h/${hospitalSlug}/ward`,
        billing: invoiceId ? `/h/${hospitalSlug}/billing/invoices/${invoiceId}` : `/h/${hospitalSlug}/billing`,
        discharge: `/h/${hospitalSlug}/ward/discharges`,
        complete: `/h/${hospitalSlug}/patients/${patientId}`,
      };
      return {
        href: paths[nextStage],
        label: `Go to ${STAGE_CONFIG[nextStage].label}`,
      };
    }

    return null;
  };

  const nextAction = getNextAction();

  // Compact mode - horizontal flow
  if (compact) {
    return (
      <div className={cn("flex items-center gap-2 rounded-lg border bg-card p-2", className)}>
        {previousStage && (
          <>
            <StageIcon stage={previousStage} status="complete" />
            <HandoffArrow direction="from" />
          </>
        )}
        <StageIcon stage={currentStage} status="active" />
        <StageLabel stage={currentStage} status="active" />
        {isBlocked && <HandoffArrow direction="blocked" />}
        {waitingOn && <HandoffArrow direction="waiting" />}
        {isReturned && <HandoffArrow direction="returned" />}
        {nextStage && !isBlocked && !waitingOn && <HandoffArrow direction="to" />}
        {nextStage && !isBlocked && !waitingOn && <StageIcon stage={nextStage} status="pending" />}
      </div>
    );
  }

  // Full mode - detailed card
  return (
    <div className={cn("rounded-xl border bg-card", className)}>
      {/* Header */}
      <div className="border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <ArrowRight className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Care Journey</h3>
            <p className="text-xs text-muted-foreground">
              {isBlocked
                ? "Handoff blocked — action needed"
                : waitingOn
                ? `Waiting on ${STAGE_CONFIG[waitingOn].label}`
                : isReturned
                ? "Returned for review"
                : "Current stage in patient flow"}
            </p>
          </div>
        </div>
      </div>

      {/* Flow Visualization */}
      <div className="p-4">
        <div className="flex items-center gap-3">
          {/* Previous Stage */}
          {previousStage && (
            <>
              <div className="flex flex-col items-center gap-1">
                <StageIcon stage={previousStage} status="complete" />
                <StageLabel stage={previousStage} status="complete" />
              </div>
              <HandoffArrow direction="from" />
            </>
          )}

          {/* Current Stage */}
          <div className="flex flex-col items-center gap-1">
            <StageIcon stage={currentStage} status="active" />
            <StageLabel stage={currentStage} status="active" />
          </div>

          {/* Status indicator */}
          {isBlocked && (
            <>
              <HandoffArrow direction="blocked" />
              <div className="flex flex-col items-center gap-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
                  <Ban className="h-4 w-4 text-red-600" />
                </div>
                <span className="text-sm text-red-600 font-medium">Blocked</span>
              </div>
            </>
          )}

          {waitingOn && !isBlocked && (
            <>
              <HandoffArrow direction="waiting" />
              <div className="flex flex-col items-center gap-1">
                <StageIcon stage={waitingOn} status="waiting" />
                <StageLabel stage={waitingOn} status="waiting" />
              </div>
            </>
          )}

          {isReturned && !isBlocked && (
            <>
              <HandoffArrow direction="returned" />
              <div className="flex flex-col items-center gap-1">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                </div>
                <span className="text-sm text-amber-600 font-medium">Review</span>
              </div>
            </>
          )}

          {/* Next Stage */}
          {nextStage && !isBlocked && !waitingOn && !isReturned && (
            <>
              <HandoffArrow direction="to" />
              <div className="flex flex-col items-center gap-1">
                <StageIcon stage={nextStage} status="pending" />
                <StageLabel stage={nextStage} status="pending" />
              </div>
            </>
          )}
        </div>

        {/* Status Messages */}
        <div className="mt-4 space-y-2">
          {isBlocked && blockerDescription && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-800">
              <div className="flex items-center gap-2">
                <Ban className="h-4 w-4" />
                <span className="font-medium">Blocked</span>
              </div>
              <p className="mt-1 text-red-700">{blockerDescription}</p>
            </div>
          )}

          {waitingOn && !isBlocked && (
            <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span className="font-medium">Waiting on {STAGE_CONFIG[waitingOn].label}</span>
              </div>
              <p className="mt-1 text-amber-700">
                This role has completed their work. Waiting for {STAGE_CONFIG[waitingOn].label.toLowerCase()} to continue.
              </p>
            </div>
          )}

          {isReturned && returnReason && (
            <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Returned for review</span>
              </div>
              <p className="mt-1 text-amber-700">{returnReason}</p>
            </div>
          )}
        </div>

        {/* Next Action */}
        {nextAction && (
          <div className="mt-4 pt-4 border-t">
            <Button asChild size="sm">
              <Link href={nextAction.href}>
                {nextAction.label}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Compact Handoff Hint for Lists/Queues
// ============================================================================

export type HandoffHintProps = {
  /** Where the item came from */
  from?: WorkflowStage;
  /** Where the item is going next */
  to?: WorkflowStage;
  /** Current status of handoff */
  status: "ready" | "waiting" | "blocked" | "complete";
  /** Optional description */
  description?: string;
  className?: string;
};

export function HandoffHint({ from, to, status, description, className }: HandoffHintProps) {
  const statusConfig = {
    ready: { tone: "success" as StatusTone, label: "Ready for" },
    waiting: { tone: "warning" as StatusTone, label: "Waiting on" },
    blocked: { tone: "danger" as StatusTone, label: "Blocked — needs" },
    complete: { tone: "success" as StatusTone, label: "Complete" },
  };

  const config = statusConfig[status];

  return (
    <div className={cn("flex items-center gap-1.5 text-xs", className)}>
      {from && to && (
        <>
          <span className="text-muted-foreground">{STAGE_CONFIG[from].label}</span>
          <ArrowRight className="h-3 w-3 text-muted-foreground" />
        </>
      )}
      <StatusBadge
        label={to ? `${config.label} ${STAGE_CONFIG[to].label}` : config.label}
        tone={config.tone}
        className="px-1.5 py-0.5 text-xs"
      />
      {description && <span className="text-muted-foreground">· {description}</span>}
    </div>
  );
}

// ============================================================================
// Workflow Stage Summary for Headers
// ============================================================================

export type WorkflowStageSummaryProps = {
  stages: WorkflowHandoffStep[];
  currentStageIndex: number;
  className?: string;
};

export function WorkflowStageSummary({ stages, currentStageIndex, className }: WorkflowStageSummaryProps) {
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {stages.map((stage, index) => {
        const Icon = stage.icon;
        return (
          <div key={stage.stage} className="flex items-center">
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-full px-2 py-1 text-xs",
                index < currentStageIndex && "bg-emerald-100 text-emerald-700",
                index === currentStageIndex && "bg-primary/10 text-primary font-medium",
                index > currentStageIndex && "bg-muted text-muted-foreground"
              )}
            >
              {Icon && <Icon className="h-3 w-3" />}
              <span className="hidden sm:inline">{stage.label}</span>
            </div>
            {index < stages.length - 1 && (
              <ArrowRight className="h-3 w-3 mx-1 text-muted-foreground" />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default WorkflowHandoffCard;

"use client";

import Link from "next/link";
import {
  ArrowRight,
  ClipboardList,
  Stethoscope,
  FlaskConical,
  Pill,
  HeartPulse,
  BedDouble,
  CreditCard,
  CheckCircle2,
  Clock,
  Ban,
  AlertCircle,
  UserRound,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatusBadge, type StatusTone } from "./status-badge";

// ============================================================================
// Types
// ============================================================================

export type JourneyStage =
  | "intake"
  | "checkin"
  | "doctor"
  | "lab"
  | "pharmacy"
  | "admission"
  | "inpatient"
  | "billing"
  | "discharge"
  | "complete";

export type JourneyStageStatus = "complete" | "active" | "waiting" | "blocked" | "optional" | "skipped";

export type JourneyStageInfo = {
  stage: JourneyStage;
  status: JourneyStageStatus;
  label?: string;
  timestamp?: string;
  actor?: string;
  description?: string;
  href?: string;
};

export type PatientJourneyStripProps = {
  stages: JourneyStageInfo[];
  patientId?: string;
  hospitalSlug: string;
  /** Current interpretation of the patient's episode */
  currentInterpretation?: string;
  /** Next step description */
  nextStep?: string;
  /** Show compact version for tight spaces */
  compact?: boolean;
  className?: string;
};

export type PatientJourneyCardProps = {
  stages: JourneyStageInfo[];
  patientId?: string;
  hospitalSlug: string;
  currentStage: JourneyStage;
  currentInterpretation: string;
  nextStep?: string;
  nextAction?: { label: string; href: string };
  className?: string;
};

// ============================================================================
// Stage Configuration
// ============================================================================

const STAGE_CONFIG: Record<
  JourneyStage,
  { label: string; icon: typeof UserRound; shortLabel: string }
> = {
  intake: { label: "Intake", shortLabel: "Intake", icon: ClipboardList },
  checkin: { label: "Check-in", shortLabel: "Check-in", icon: UserRound },
  doctor: { label: "Doctor Review", shortLabel: "Doctor", icon: Stethoscope },
  lab: { label: "Laboratory", shortLabel: "Lab", icon: FlaskConical },
  pharmacy: { label: "Pharmacy", shortLabel: "Pharmacy", icon: Pill },
  admission: { label: "Admission", shortLabel: "Admit", icon: BedDouble },
  inpatient: { label: "Inpatient Care", shortLabel: "Inpatient", icon: HeartPulse },
  billing: { label: "Billing", shortLabel: "Billing", icon: CreditCard },
  discharge: { label: "Discharge", shortLabel: "Discharge", icon: CheckCircle2 },
  complete: { label: "Complete", shortLabel: "Complete", icon: CheckCircle2 },
};

const STATUS_STYLES: Record<JourneyStageStatus, { bg: string; text: string; border: string; tone: StatusTone }> = {
  complete: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200", tone: "success" },
  active: { bg: "bg-primary/10", text: "text-primary", border: "border-primary/30", tone: "info" },
  waiting: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200", tone: "warning" },
  blocked: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200", tone: "danger" },
  optional: { bg: "bg-muted", text: "text-muted-foreground", border: "border-border", tone: "neutral" },
  skipped: { bg: "bg-muted/50", text: "text-muted-foreground/50", border: "border-border/50", tone: "neutral" },
};

// ============================================================================
// Sub-Components
// ============================================================================

function StageIcon({
  stage,
  status,
  size = "md",
}: {
  stage: JourneyStage;
  status: JourneyStageStatus;
  size?: "sm" | "md" | "lg";
}) {
  const config = STAGE_CONFIG[stage];
  const Icon = config.icon;
  const styles = STATUS_STYLES[status];

  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-10 w-10",
  };

  const iconSizes = {
    sm: "h-3 w-3",
    md: "h-4 w-4",
    lg: "h-5 w-5",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-full shrink-0",
        sizeClasses[size],
        styles.bg,
        styles.text,
        status === "active" && "ring-2 ring-primary/30"
      )}
    >
      <Icon className={iconSizes[size]} />
    </div>
  );
}

function StageConnector({
  fromStatus,
  toStatus,
  isBlocked,
}: {
  fromStatus: JourneyStageStatus;
  toStatus: JourneyStageStatus;
  isBlocked?: boolean;
}) {
  if (isBlocked) {
    return (
      <div className="flex-1 flex items-center justify-center px-1">
        <Ban className="h-4 w-4 text-red-500" />
      </div>
    );
  }

  const isComplete = fromStatus === "complete";

  return (
    <div className="flex-1 flex items-center justify-center px-1">
      <div
        className={cn(
          "h-0.5 w-full max-w-[40px]",
          isComplete ? "bg-emerald-300" : "bg-border"
        )}
      />
    </div>
  );
}

// ============================================================================
// Compact Journey Strip
// ============================================================================

export function PatientJourneyStrip({
  stages,
  patientId,
  hospitalSlug,
  currentInterpretation,
  nextStep,
  compact = false,
  className,
}: PatientJourneyStripProps) {
  // Filter out skipped stages for display
  const visibleStages = stages.filter((s) => s.status !== "skipped");
  const activeIndex = visibleStages.findIndex((s) => s.status === "active");
  const activeStage = visibleStages.find((s) => s.status === "active");

  if (compact) {
    return (
      <div className={cn("flex items-center gap-1", className)}>
        {visibleStages.slice(0, 5).map((stage, index) => (
          <div key={stage.stage} className="flex items-center">
            <StageIcon stage={stage.stage} status={stage.status} size="sm" />
            {index < Math.min(visibleStages.length, 5) - 1 && (
              <StageConnector
                fromStatus={stage.status}
                toStatus={visibleStages[index + 1]?.status || "waiting"}
                isBlocked={stage.status === "blocked"}
              />
            )}
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border bg-card", className)}>
      {/* Header */}
      <div className="border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <ClipboardList className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">Patient Journey</h3>
              {currentInterpretation && (
                <p className="text-xs text-muted-foreground">{currentInterpretation}</p>
              )}
            </div>
          </div>
          {nextStep && (
            <StatusBadge
              label={nextStep}
              tone={activeStage?.status === "blocked" ? "danger" : "info"}
              className="px-2.5 py-1"
            />
          )}
        </div>
      </div>

      {/* Journey Track */}
      <div className="p-4">
        <div className="flex items-center overflow-x-auto pb-2">
          {visibleStages.map((stage, index) => (
            <div key={stage.stage} className="flex items-center shrink-0">
              <Link
                href={
                  stage.href ||
                  (patientId ? `/h/${hospitalSlug}/patients/${patientId}` : `/h/${hospitalSlug}`)
                }
                className={cn(
                  "flex flex-col items-center gap-1.5 p-2 rounded-lg transition-colors",
                  stage.status === "active" && "bg-primary/5",
                  stage.status === "blocked" && "bg-red-50"
                )}
              >
                <StageIcon stage={stage.stage} status={stage.status} size="md" />
                <span
                  className={cn(
                    "text-xs whitespace-nowrap",
                    stage.status === "active" && "font-medium text-foreground",
                    stage.status === "complete" && "text-muted-foreground",
                    stage.status === "waiting" && "text-amber-600",
                    stage.status === "blocked" && "text-red-600",
                    stage.status === "optional" && "text-muted-foreground/60"
                  )}
                >
                  {STAGE_CONFIG[stage.stage].shortLabel}
                </span>
                {stage.actor && (
                  <span className="text-[10px] text-muted-foreground truncate max-w-[60px]">
                    {stage.actor}
                  </span>
                )}
              </Link>
              {index < visibleStages.length - 1 && (
                <StageConnector
                  fromStatus={stage.status}
                  toStatus={visibleStages[index + 1]?.status || "waiting"}
                  isBlocked={visibleStages[index + 1]?.status === "blocked"}
                />
              )}
            </div>
          ))}
        </div>

        {/* Stage Descriptions */}
        <div className="mt-4 space-y-2">
          {visibleStages
            .filter((s) => s.status === "active" || s.status === "blocked")
            .map((stage) => (
              <div
                key={stage.stage}
                className={cn(
                  "rounded-lg p-3 text-sm",
                  stage.status === "active" && "bg-primary/5",
                  stage.status === "blocked" && "bg-red-50"
                )}
              >
                <div className="flex items-center gap-2">
                  {stage.status === "blocked" ? (
                    <Ban className="h-4 w-4 text-red-600" />
                  ) : (
                    <Clock className="h-4 w-4 text-primary" />
                  )}
                  <span className={cn("font-medium", stage.status === "blocked" && "text-red-800")}>
                    {stage.label || STAGE_CONFIG[stage.stage].label}
                  </span>
                </div>
                {stage.description && (
                  <p
                    className={cn(
                      "mt-1 ml-6",
                      stage.status === "blocked" ? "text-red-700" : "text-muted-foreground"
                    )}
                  >
                    {stage.description}
                  </p>
                )}
                {stage.href && (
                  <Button asChild size="sm" variant="outline" className="mt-2 ml-6">
                    <Link href={stage.href}>
                      Open {STAGE_CONFIG[stage.stage].shortLabel}
                      <ArrowRight className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                )}
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Episode of Care Card
// ============================================================================

export function EpisodeOfCareCard({
  stages,
  patientId,
  hospitalSlug,
  currentStage,
  currentInterpretation,
  nextStep,
  nextAction,
  className,
}: PatientJourneyCardProps) {
  const currentStageInfo = stages.find((s) => s.stage === currentStage);
  const completedStages = stages.filter((s) => s.status === "complete");
  const upcomingStages = stages.filter(
    (s) => s.status === "waiting" || s.status === "optional"
  );

  return (
    <div className={cn("rounded-xl border bg-card overflow-hidden", className)}>
      {/* Header */}
      <div className="bg-muted/30 border-b px-4 py-3">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-foreground">Episode of Care</h3>
        </div>
        {currentInterpretation && (
          <p className="mt-1 text-sm text-muted-foreground">{currentInterpretation}</p>
        )}
      </div>

      {/* Progress Overview */}
      <div className="p-4">
        {/* Current Stage */}
        <div className="flex items-start gap-3 mb-4">
          <StageIcon stage={currentStage} status="active" size="lg" />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-foreground">
                {currentStageInfo?.label || STAGE_CONFIG[currentStage].label}
              </span>
              <StatusBadge label="Current" tone="info" className="px-1.5 py-0 text-[10px]" />
            </div>
            {currentStageInfo?.description && (
              <p className="text-sm text-muted-foreground mt-1">
                {currentStageInfo.description}
              </p>
            )}
            {currentStageInfo?.actor && (
              <p className="text-xs text-muted-foreground mt-1">
                With: {currentStageInfo.actor}
              </p>
            )}
          </div>
        </div>

        {/* Stage Summary */}
        <div className="grid grid-cols-3 gap-2 text-center py-3 border-y">
          <div>
            <p className="text-lg font-semibold text-emerald-600">{completedStages.length}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-primary">1</p>
            <p className="text-xs text-muted-foreground">Active</p>
          </div>
          <div>
            <p className="text-lg font-semibold text-muted-foreground">{upcomingStages.length}</p>
            <p className="text-xs text-muted-foreground">Upcoming</p>
          </div>
        </div>

        {/* Next Step */}
        {(nextStep || nextAction) && (
          <div className="mt-4">
            {nextStep && (
              <p className="text-sm text-muted-foreground mb-2">
                <span className="font-medium text-foreground">Next:</span> {nextStep}
              </p>
            )}
            {nextAction && (
              <Button asChild size="sm" className="w-full">
                <Link href={nextAction.href}>
                  {nextAction.label}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Journey Summary for Headers
// ============================================================================

export type CareJourneySummaryProps = {
  currentStage: JourneyStage;
  currentStatus: "ontrack" | "waiting" | "blocked" | "delayed";
  summary: string;
  nextStep?: string;
  blockerReason?: string;
  className?: string;
};

export function CareJourneySummary({
  currentStage,
  currentStatus,
  summary,
  nextStep,
  blockerReason,
  className,
}: CareJourneySummaryProps) {
  const statusConfig = {
    ontrack: { tone: "success" as StatusTone, icon: CheckCircle2, label: "On Track" },
    waiting: { tone: "warning" as StatusTone, icon: Clock, label: "Waiting" },
    blocked: { tone: "danger" as StatusTone, icon: Ban, label: "Blocked" },
    delayed: { tone: "warning" as StatusTone, icon: AlertCircle, label: "Delayed" },
  };

  const config = statusConfig[currentStatus];
  const StatusIcon = config.icon;

  return (
    <div
      className={cn(
        "rounded-lg border p-3",
        currentStatus === "blocked" && "bg-red-50 border-red-200",
        currentStatus === "waiting" && "bg-amber-50 border-amber-200",
        currentStatus === "ontrack" && "bg-emerald-50 border-emerald-200",
        currentStatus === "delayed" && "bg-amber-50 border-amber-200",
        className
      )}
    >
      <div className="flex items-start gap-2">
        <StatusIcon
          className={cn(
            "h-5 w-5 shrink-0",
            currentStatus === "blocked" && "text-red-600",
            currentStatus === "waiting" && "text-amber-600",
            currentStatus === "ontrack" && "text-emerald-600",
            currentStatus === "delayed" && "text-amber-600"
          )}
        />
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <span className="font-medium text-foreground">
              {STAGE_CONFIG[currentStage].label}
            </span>
            <StatusBadge label={config.label} tone={config.tone} className="px-1.5 py-0 text-[10px]" />
          </div>
          <p
            className={cn(
              "text-sm mt-0.5",
              currentStatus === "blocked" && "text-red-700",
              currentStatus === "waiting" && "text-amber-700",
              currentStatus === "ontrack" && "text-emerald-700",
              currentStatus === "delayed" && "text-amber-700"
            )}
          >
            {summary}
          </p>
          {nextStep && (
            <p className="text-xs text-muted-foreground mt-1">
              <span className="font-medium">Next:</span> {nextStep}
            </p>
          )}
          {blockerReason && (
            <p className="text-xs text-red-600 mt-1">
              <span className="font-medium">Blocked:</span> {blockerReason}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// Helper: Build Journey from Context
// ============================================================================

export function buildPatientJourneyFromContext({
  hasIntake,
  isCheckedIn,
  encounterStage,
  labOrderStatus,
  prescriptionStatus,
  admissionStatus,
  invoiceStatus,
  isDischargeReady,
}: {
  hasIntake?: boolean;
  isCheckedIn?: boolean;
  encounterStage?: string | null;
  labOrderStatus?: string | null;
  prescriptionStatus?: string | null;
  admissionStatus?: "none" | "admitted" | "discharge_requested" | "discharged";
  invoiceStatus?: "none" | "unpaid" | "partial" | "paid";
  isDischargeReady?: boolean;
}): JourneyStageInfo[] {
  const stages: JourneyStageInfo[] = [];

  // Intake stage
  stages.push({
    stage: "intake",
    status: hasIntake ? "complete" : "optional",
    label: "Intake Complete",
  });

  // Check-in stage
  stages.push({
    stage: "checkin",
    status: isCheckedIn ? "complete" : hasIntake ? "waiting" : "optional",
  });

  // Doctor stage
  let doctorStatus: JourneyStageStatus = "waiting";
  if (encounterStage === "completed") doctorStatus = "complete";
  else if (encounterStage) doctorStatus = "active";
  else if (isCheckedIn) doctorStatus = "waiting";
  else doctorStatus = "optional";

  stages.push({
    stage: "doctor",
    status: doctorStatus,
    label: encounterStage ? undefined : "Awaiting Review",
  });

  // Lab stage (conditional)
  if (labOrderStatus) {
    stages.push({
      stage: "lab",
      status: labOrderStatus === "completed" ? "complete" : "active",
    });
  }

  // Pharmacy stage (conditional)
  if (prescriptionStatus) {
    stages.push({
      stage: "pharmacy",
      status: prescriptionStatus === "dispensed" ? "complete" : "active",
    });
  }

  // Admission stage (conditional)
  if (admissionStatus && admissionStatus !== "none") {
    stages.push({
      stage: "admission",
      status: admissionStatus === "admitted" || admissionStatus === "discharge_requested" ? "complete" : "active",
    });

    // Inpatient stage
    const inpatientStatus: JourneyStageStatus =
      admissionStatus === "discharged"
        ? "complete"
        : admissionStatus === "discharge_requested"
        ? "waiting"
        : "active";

    stages.push({
      stage: "inpatient",
      status: inpatientStatus,
      label: admissionStatus === "discharge_requested" ? "Discharge Requested" : undefined,
    });
  }

  // Billing stage
  if (invoiceStatus && invoiceStatus !== "none") {
    stages.push({
      stage: "billing",
      status: invoiceStatus === "paid" ? "complete" : invoiceStatus === "partial" ? "waiting" : "active",
    });
  }

  // Discharge stage
  if (isDischargeReady !== undefined) {
    stages.push({
      stage: "discharge",
      status: isDischargeReady ? "waiting" : "optional",
    });
  }

  // Complete stage
  const allComplete = stages.every(
    (s) => s.status === "complete" || s.status === "optional"
  );
  stages.push({
    stage: "complete",
    status: allComplete ? "complete" : "optional",
  });

  return stages;
}

export default PatientJourneyStrip;

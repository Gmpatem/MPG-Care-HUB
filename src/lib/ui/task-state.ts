/**
 * Task State & Readiness Utilities for MPG Care Hub
 * 
 * This module provides a unified vocabulary and mapping layer for expressing
 * task states, readiness signals, and workflow progress across all workspaces.
 * 
 * Design Principles:
 * - Conservative mapping: Only express states that data clearly supports
 * - Clear distinction between: ready, pending, blocked, in-progress, completed
 * - Consistent UI language across modules
 * - Defensive against missing or partial data
 */

import { StatusTone } from "@/components/layout/status-badge";

// ============================================================================
// TASK STATE CATEGORY TYPE
// ============================================================================

export type TaskStateCategory =
  | "ready"        // Actionable now
  | "pending"      // Waiting on something
  | "in_progress"  // Work has started
  | "blocked"      // Cannot proceed (needs attention)
  | "partial"      // Partially complete
  | "completed";   // Finished

// ============================================================================
// READINESS SIGNAL TYPE
// ============================================================================

export type ReadinessSignal = {
  /** Display label for the state */
  label: string;
  /** Visual tone for the badge */
  tone: StatusTone;
  /** High-level category */
  category: TaskStateCategory;
  /** Optional detail text (e.g., "3 of 5 complete") */
  detail?: string;
  /** Whether user can take primary action */
  isActionable: boolean;
  /** Whether this state represents a blockage */
  isBlocked: boolean;
  /** Whether this state represents completion */
  isComplete: boolean;
  /** Progress fraction (0-1) if applicable */
  progress?: number;
  /** Text describing progress (e.g., "3/5 items") */
  progressText?: string;
};

// ============================================================================
// HELPER FUNCTIONS FOR CONSISTENT STATE MAPPING
// ============================================================================

/**
 * Map a discharge checklist summary to a readiness signal
 */
export function getDischargeReadiness(
  checklistReady: boolean,
  dischargeRequested: boolean,
  completedCount: number,
  totalCount: number,
  requiredCompleted: number,
  requiredTotal: number
): ReadinessSignal {
  if (!dischargeRequested) {
    return {
      label: "Not requested",
      tone: "neutral",
      category: "pending",
      detail: "Doctor must request discharge first",
      isActionable: false,
      isBlocked: false,
      isComplete: false,
    };
  }

  if (checklistReady) {
    return {
      label: "Ready to discharge",
      tone: "success",
      category: "ready",
      detail: `All ${requiredTotal} required items complete`,
      isActionable: true,
      isBlocked: false,
      isComplete: true,
      progress: totalCount > 0 ? completedCount / totalCount : 1,
      progressText: `${completedCount}/${totalCount} items`,
    };
  }

  return {
    label: "Blocked",
    tone: "danger",
    category: "blocked",
    detail: `${requiredCompleted}/${requiredTotal} required items complete`,
    isActionable: false,
    isBlocked: true,
    isComplete: false,
    progress: requiredTotal > 0 ? requiredCompleted / requiredTotal : 0,
    progressText: `${requiredCompleted}/${requiredTotal} required`,
  };
}

/**
 * Map lab order status to a readiness signal
 */
export function getLabOrderReadiness(
  status: string | null | undefined,
  pendingCount: number,
  enteredCount: number,
  verifiedCount: number,
  totalCount: number
): ReadinessSignal {
  const completedCount = enteredCount + verifiedCount;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;
  const progressText = `${completedCount}/${totalCount} items`;

  switch (status) {
    case "completed":
    case "verified":
      return {
        label: "Completed",
        tone: "success",
        category: "completed",
        detail: "All results entered and verified",
        isActionable: false,
        isBlocked: false,
        isComplete: true,
        progress: 1,
        progressText,
      };

    case "in_progress":
      if (pendingCount === 0 && enteredCount > 0) {
        return {
          label: "Ready for review",
          tone: "info",
          category: "ready",
          detail: "All items entered, pending verification",
          isActionable: true,
          isBlocked: false,
          isComplete: false,
          progress,
          progressText,
        };
      }
      return {
        label: "In progress",
        tone: "warning",
        category: "in_progress",
        detail: `${pendingCount} items still pending entry`,
        isActionable: true,
        isBlocked: false,
        isComplete: false,
        progress,
        progressText,
      };

    case "ordered":
    default:
      return {
        label: "Pending",
        tone: "neutral",
        category: "pending",
        detail: "Awaiting result entry",
        isActionable: true,
        isBlocked: false,
        isComplete: false,
        progress: 0,
        progressText: `0/${totalCount} items`,
      };
  }
}

/**
 * Map lab order item status to a readiness signal
 */
export function getLabItemReadiness(status: string | null | undefined): ReadinessSignal {
  switch (status) {
    case "verified":
      return {
        label: "Verified",
        tone: "success",
        category: "completed",
        isActionable: false,
        isBlocked: false,
        isComplete: true,
      };
    case "entered":
      return {
        label: "Entered",
        tone: "info",
        category: "in_progress",
        isActionable: true,
        isBlocked: false,
        isComplete: false,
      };
    case "pending":
    default:
      return {
        label: "Pending",
        tone: "warning",
        category: "pending",
        isActionable: true,
        isBlocked: false,
        isComplete: false,
      };
  }
}

/**
 * Map prescription status to a readiness signal
 */
export function getPrescriptionReadiness(
  status: string | null | undefined,
  readyCount: number,
  blockedCount: number,
  dispensedCount: number,
  totalCount: number
): ReadinessSignal {
  const progress = totalCount > 0 ? dispensedCount / totalCount : 0;
  const progressText = `${dispensedCount}/${totalCount} items`;

  if (status === "dispensed" || dispensedCount === totalCount && totalCount > 0) {
    return {
      label: "Dispensed",
      tone: "success",
      category: "completed",
      detail: "All items dispensed",
      isActionable: false,
      isBlocked: false,
      isComplete: true,
      progress: 1,
      progressText,
    };
  }

  if (blockedCount > 0 && readyCount === 0) {
    return {
      label: "Blocked",
      tone: "danger",
      category: "blocked",
      detail: `${blockedCount} items out of stock`,
      isActionable: false,
      isBlocked: true,
      isComplete: false,
      progress,
      progressText,
    };
  }

  if (blockedCount > 0 && readyCount > 0) {
    return {
      label: "Partial",
      tone: "warning",
      category: "partial",
      detail: `${readyCount} ready, ${blockedCount} blocked`,
      isActionable: true,
      isBlocked: false,
      isComplete: false,
      progress,
      progressText,
    };
  }

  if (dispensedCount > 0 && dispensedCount < totalCount) {
    return {
      label: "Partially dispensed",
      tone: "info",
      category: "partial",
      detail: `${totalCount - dispensedCount} items remaining`,
      isActionable: true,
      isBlocked: false,
      isComplete: false,
      progress,
      progressText,
    };
  }

  return {
    label: "Ready",
    tone: "success",
    category: "ready",
    detail: `${readyCount} items ready to dispense`,
    isActionable: true,
    isBlocked: false,
    isComplete: false,
    progress: 0,
    progressText: `0/${totalCount} items`,
  };
}

/**
 * Map prescription item status to a readiness signal
 */
export function getPrescriptionItemReadiness(
  status: string | null | undefined,
  hasStock: boolean | null | undefined
): ReadinessSignal {
  if (hasStock === false) {
    return {
      label: "No stock",
      tone: "danger",
      category: "blocked",
      detail: "Stock unavailable",
      isActionable: false,
      isBlocked: true,
      isComplete: false,
    };
  }

  if (status === "dispensed") {
    return {
      label: "Dispensed",
      tone: "success",
      category: "completed",
      isActionable: false,
      isBlocked: false,
      isComplete: true,
    };
  }

  if (status === "partially_dispensed") {
    return {
      label: "Partial",
      tone: "warning",
      category: "partial",
      isActionable: true,
      isBlocked: false,
      isComplete: false,
    };
  }

  return {
    label: "Ready",
    tone: "success",
    category: "ready",
    isActionable: true,
    isBlocked: false,
    isComplete: false,
  };
}

/**
 * Map invoice payment status to a readiness signal
 */
export function getInvoiceReadiness(
  totalAmount: number,
  amountPaid: number,
  balanceDue: number
): ReadinessSignal {
  if (balanceDue <= 0 || amountPaid >= totalAmount) {
    return {
      label: "Paid",
      tone: "success",
      category: "completed",
      detail: `Fully paid: ${amountPaid.toFixed(2)}`,
      isActionable: false,
      isBlocked: false,
      isComplete: true,
      progress: 1,
      progressText: "100% paid",
    };
  }

  if (amountPaid === 0) {
    return {
      label: "Unpaid",
      tone: "warning",
      category: "pending",
      detail: `Balance: ${balanceDue.toFixed(2)}`,
      isActionable: true,
      isBlocked: false,
      isComplete: false,
      progress: 0,
      progressText: "0% paid",
    };
  }

  const progress = totalAmount > 0 ? amountPaid / totalAmount : 0;
  return {
    label: "Partially paid",
    tone: "info",
    category: "partial",
    detail: `Paid: ${amountPaid.toFixed(2)}, Balance: ${balanceDue.toFixed(2)}`,
    isActionable: true,
    isBlocked: false,
    isComplete: false,
    progress,
    progressText: `${(progress * 100).toFixed(0)}% paid`,
  };
}

/**
 * Map payment status to a readiness signal
 */
export function getPaymentReadiness(status: string | null | undefined): ReadinessSignal {
  if (status === "completed" || status === "verified") {
    return {
      label: "Completed",
      tone: "success",
      category: "completed",
      isActionable: false,
      isBlocked: false,
      isComplete: true,
    };
  }

  if (status === "pending" || status === "processing") {
    return {
      label: "Processing",
      tone: "warning",
      category: "in_progress",
      isActionable: false,
      isBlocked: false,
      isComplete: false,
    };
  }

  if (status === "failed" || status === "rejected") {
    return {
      label: "Failed",
      tone: "danger",
      category: "blocked",
      isActionable: true,
      isBlocked: true,
      isComplete: false,
    };
  }

  return {
    label: status?.replaceAll("_", " ") ?? "Pending",
    tone: "neutral",
    category: "pending",
    isActionable: false,
    isBlocked: false,
    isComplete: false,
  };
}

/**
 * Map encounter stage to a readiness signal for doctor workflow
 */
export function getEncounterStageReadiness(
  stage: string | null | undefined,
  hasEncounter: boolean
): ReadinessSignal {
  if (!hasEncounter) {
    return {
      label: "New consultation",
      tone: "info",
      category: "ready",
      detail: "Start encounter to begin",
      isActionable: true,
      isBlocked: false,
      isComplete: false,
    };
  }

  switch (stage) {
    case "completed":
      return {
        label: "Completed",
        tone: "neutral",
        category: "completed",
        detail: "Encounter finalized",
        isActionable: false,
        isBlocked: false,
        isComplete: true,
      };

    case "results_review":
      return {
        label: "Ready for review",
        tone: "success",
        category: "ready",
        detail: "Lab results available",
        isActionable: true,
        isBlocked: false,
        isComplete: false,
      };

    case "treatment_decided":
      return {
        label: "Treatment decided",
        tone: "success",
        category: "ready",
        detail: "Ready to finalize",
        isActionable: true,
        isBlocked: false,
        isComplete: false,
      };

    case "awaiting_results":
      return {
        label: "Awaiting results",
        tone: "warning",
        category: "pending",
        detail: "Waiting for lab results",
        isActionable: false,
        isBlocked: false,
        isComplete: false,
      };

    case "admission_requested":
      return {
        label: "Admission requested",
        tone: "danger",
        category: "blocked",
        detail: "Coordinate with ward",
        isActionable: true,
        isBlocked: true,
        isComplete: false,
      };

    case "initial_review":
    default:
      return {
        label: "In progress",
        tone: "info",
        category: "in_progress",
        detail: "Initial assessment",
        isActionable: true,
        isBlocked: false,
        isComplete: false,
      };
  }
}

/**
 * Map appointment/queue status to a readiness signal
 */
export function getQueueItemReadiness(status: string | null | undefined): ReadinessSignal {
  switch (status) {
    case "checked_in":
      return {
        label: "Checked in",
        tone: "info",
        category: "ready",
        detail: "Ready for doctor",
        isActionable: true,
        isBlocked: false,
        isComplete: false,
      };

    case "completed":
      return {
        label: "Completed",
        tone: "success",
        category: "completed",
        isActionable: false,
        isBlocked: false,
        isComplete: true,
      };

    case "cancelled":
      return {
        label: "Cancelled",
        tone: "neutral",
        category: "completed",
        isActionable: false,
        isBlocked: false,
        isComplete: true,
      };

    case "scheduled":
    default:
      return {
        label: "Scheduled",
        tone: "neutral",
        category: "pending",
        detail: "Waiting for arrival",
        isActionable: false,
        isBlocked: false,
        isComplete: false,
      };
  }
}

// ============================================================================
// PROGRESS CALCULATION HELPERS
// ============================================================================

export function calculateProgress(completed: number, total: number): number {
  if (total <= 0) return 0;
  return Math.min(Math.max(completed / total, 0), 1);
}

export function formatProgressText(completed: number, total: number, label = "items"): string {
  return `${completed}/${total} ${label}`;
}

export function getProgressTone(progress: number): StatusTone {
  if (progress >= 1) return "success";
  if (progress >= 0.75) return "info";
  if (progress >= 0.5) return "warning";
  if (progress > 0) return "warning";
  return "neutral";
}

// ============================================================================
// ACTIONABILITY HELPERS
// ============================================================================

/**
 * Determine if a task is actionable based on current state
 */
export function isTaskActionable(category: TaskStateCategory): boolean {
  return category === "ready" || category === "in_progress";
}

/**
 * Determine if a task is blocked
 */
export function isTaskBlocked(category: TaskStateCategory): boolean {
  return category === "blocked";
}

/**
 * Determine if a task is complete
 */
export function isTaskComplete(category: TaskStateCategory): boolean {
  return category === "completed";
}

"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowLeft,
  ArrowRight,
  BedDouble,
  ClipboardList,
  CreditCard,
  FileText,
  FlaskConical,
  HeartPulse,
  LayoutDashboard,
  List,
  Pill,
  Stethoscope,
  UserRound,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

export type RelatedAction = {
  label: string;
  href: string;
  icon?: LucideIcon;
  variant?: "default" | "outline" | "secondary" | "ghost";
  description?: string;
  disabled?: boolean;
  disabledReason?: string;
};

export type RelatedActionGroup = {
  title: string;
  actions: RelatedAction[];
};

export type RelatedWorkspaceActionsProps = {
  hospitalSlug: string;
  // Context entities for auto-generated actions
  patientId?: string;
  encounterId?: string;
  admissionId?: string;
  labOrderId?: string;
  prescriptionId?: string;
  invoiceId?: string;
  appointmentId?: string;
  // Current context for smart back links
  currentWorkspace?: "doctor" | "lab" | "pharmacy" | "billing" | "nurse" | "ward" | "frontdesk";
  // Custom actions to add
  customActions?: RelatedAction[];
  // Display options
  title?: string;
  description?: string;
  layout?: "horizontal" | "vertical" | "grid";
  showBackToQueue?: boolean;
  showBackToDashboard?: boolean;
  maxActions?: number;
  className?: string;
};

// ============================================================================
// Workspace Route Configuration
// ============================================================================

const WORKSPACE_QUEUES: Record<string, { label: string; href: string; icon: LucideIcon }> = {
  doctor: { label: "Doctor Queue", href: "doctor", icon: Stethoscope },
  lab: { label: "Lab Queue", href: "lab", icon: FlaskConical },
  pharmacy: { label: "Pharmacy Queue", href: "pharmacy", icon: Pill },
  billing: { label: "Billing", href: "billing/invoices", icon: CreditCard },
  nurse: { label: "Nursing Station", href: "nurse", icon: HeartPulse },
  ward: { label: "Ward Workspace", href: "ward", icon: BedDouble },
  frontdesk: { label: "Front Desk", href: "frontdesk", icon: LayoutDashboard },
};

// ============================================================================
// Helper Functions
// ============================================================================

function generateRelatedActions({
  hospitalSlug,
  patientId,
  encounterId,
  admissionId,
  labOrderId,
  prescriptionId,
  invoiceId,
  appointmentId,
  currentWorkspace,
}: Omit<RelatedWorkspaceActionsProps, "customActions" | "title" | "description" | "layout" | "showBackToQueue" | "showBackToDashboard" | "maxActions" | "className">): RelatedAction[] {
  const actions: RelatedAction[] = [];

  // Patient Profile (always useful if we have patient context)
  if (patientId) {
    actions.push({
      label: "Patient Profile",
      href: `/h/${hospitalSlug}/patients/${patientId}`,
      icon: UserRound,
      variant: "outline",
    });
  }

  // Encounter-related actions
  if (encounterId && currentWorkspace !== "doctor") {
    actions.push({
      label: "Open Encounter",
      href: `/h/${hospitalSlug}/encounters/${encounterId}`,
      icon: FileText,
      variant: "default",
    });
  }

  // Doctor workspace for patient
  if (patientId && currentWorkspace !== "doctor") {
    actions.push({
      label: "Doctor Workspace",
      href: `/h/${hospitalSlug}/doctor/patients/${patientId}`,
      icon: Stethoscope,
      variant: "outline",
    });
  }

  // Admission/Nurse/Ward links
  if (admissionId) {
    if (currentWorkspace !== "nurse") {
      actions.push({
        label: "Nurse Chart",
        href: `/h/${hospitalSlug}/nurse/admissions/${admissionId}`,
        icon: HeartPulse,
        variant: "outline",
      });
    }
    if (currentWorkspace !== "ward") {
      actions.push({
        label: "Ward Chart",
        href: `/h/${hospitalSlug}/ward/admissions/${admissionId}`,
        icon: BedDouble,
        variant: "outline",
      });
    }
  }

  // Lab order links
  if (labOrderId && currentWorkspace !== "lab") {
    actions.push({
      label: "Lab Order",
      href: `/h/${hospitalSlug}/lab/orders/${labOrderId}`,
      icon: FlaskConical,
      variant: "outline",
    });
  }

  // Prescription links
  if (prescriptionId && currentWorkspace !== "pharmacy") {
    actions.push({
      label: "Prescription",
      href: `/h/${hospitalSlug}/pharmacy/prescriptions/${prescriptionId}`,
      icon: Pill,
      variant: "outline",
    });
  }

  // Invoice/Billing links
  if (invoiceId && currentWorkspace !== "billing") {
    actions.push({
      label: "Invoice",
      href: `/h/${hospitalSlug}/billing/invoices/${invoiceId}`,
      icon: CreditCard,
      variant: "outline",
    });
  }

  // Appointment link
  if (appointmentId) {
    actions.push({
      label: "Appointment",
      href: `/h/${hospitalSlug}/doctor/appointments/${appointmentId}/open`,
      icon: ClipboardList,
      variant: "outline",
    });
  }

  // Census (always useful for inpatient context)
  if (admissionId && currentWorkspace !== "ward") {
    actions.push({
      label: "Census",
      href: `/h/${hospitalSlug}/census`,
      icon: Users,
      variant: "ghost",
    });
  }

  return actions;
}

// ============================================================================
// Sub-Components
// ============================================================================

function ActionButton({ action }: { action: RelatedAction }) {
  const Icon = action.icon;

  if (action.disabled) {
    return (
      <Button variant="outline" size="sm" disabled className="justify-start opacity-60">
        {Icon && <Icon className="mr-2 h-4 w-4" />}
        <span className="truncate">{action.label}</span>
      </Button>
    );
  }

  return (
    <Button asChild variant={action.variant ?? "outline"} size="sm" className="justify-start">
      <Link href={action.href}>
        {Icon && <Icon className="mr-2 h-4 w-4 shrink-0" />}
        <span className="truncate">{action.label}</span>
      </Link>
    </Button>
  );
}

function BackLink({
  hospitalSlug,
  workspace,
}: {
  hospitalSlug: string;
  workspace?: string;
}) {
  if (!workspace) return null;

  const config = WORKSPACE_QUEUES[workspace];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <Button asChild variant="ghost" size="sm" className="justify-start text-muted-foreground hover:text-foreground">
      <Link href={`/h/${hospitalSlug}/${config.href}`}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        <span className="truncate">Back to {config.label}</span>
      </Link>
    </Button>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function RelatedWorkspaceActions({
  hospitalSlug,
  patientId,
  encounterId,
  admissionId,
  labOrderId,
  prescriptionId,
  invoiceId,
  appointmentId,
  currentWorkspace,
  customActions = [],
  title = "Related Actions",
  description,
  layout = "horizontal",
  showBackToQueue = true,
  showBackToDashboard = false,
  maxActions = 6,
  className,
}: RelatedWorkspaceActionsProps) {
  const generatedActions = generateRelatedActions({
    hospitalSlug,
    patientId,
    encounterId,
    admissionId,
    labOrderId,
    prescriptionId,
    invoiceId,
    appointmentId,
    currentWorkspace,
  });

  const allActions = [...generatedActions, ...customActions].slice(0, maxActions);

  if (allActions.length === 0 && !showBackToQueue && !showBackToDashboard) {
    return null;
  }

  // Horizontal layout (default) - compact row
  if (layout === "horizontal") {
    return (
      <div className={cn("flex flex-wrap items-center gap-2", className)}>
        {allActions.map((action) => (
          <ActionButton key={action.href} action={action} />
        ))}
        {showBackToQueue && currentWorkspace && (
          <BackLink hospitalSlug={hospitalSlug} workspace={currentWorkspace} />
        )}
        {showBackToDashboard && (
          <Button asChild variant="ghost" size="sm" className="justify-start text-muted-foreground">
            <Link href={`/h/${hospitalSlug}`}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Link>
          </Button>
        )}
      </div>
    );
  }

  // Vertical layout - stacked buttons
  if (layout === "vertical") {
    return (
      <div className={cn("space-y-2", className)}>
        {allActions.map((action) => (
          <ActionButton key={action.href} action={action} />
        ))}
        {showBackToQueue && currentWorkspace && (
          <BackLink hospitalSlug={hospitalSlug} workspace={currentWorkspace} />
        )}
      </div>
    );
  }

  // Grid layout - card-based with descriptions
  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {description && <p className="text-xs text-muted-foreground">{description}</p>}
      </CardHeader>
      <CardContent className="space-y-2">
        {allActions.map((action) => (
          <div key={action.href} className="space-y-1">
            <ActionButton action={action} />
            {action.description && (
              <p className="text-xs text-muted-foreground pl-8">{action.description}</p>
            )}
          </div>
        ))}
        {(showBackToQueue || showBackToDashboard) && (
          <div className="pt-2 border-t mt-2">
            {showBackToQueue && currentWorkspace && (
              <BackLink hospitalSlug={hospitalSlug} workspace={currentWorkspace} />
            )}
            {showBackToDashboard && (
              <Button asChild variant="ghost" size="sm" className="justify-start text-muted-foreground w-full">
                <Link href={`/h/${hospitalSlug}`}>
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  Dashboard
                </Link>
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Compact Inline Variant
// ============================================================================

export function CompactRelatedActions({
  hospitalSlug,
  patientId,
  encounterId,
  admissionId,
  labOrderId,
  prescriptionId,
  invoiceId,
  currentWorkspace,
  maxActions = 4,
  className,
}: Omit<RelatedWorkspaceActionsProps, "customActions" | "title" | "description" | "layout" | "showBackToQueue" | "showBackToDashboard">) {
  return (
    <RelatedWorkspaceActions
      hospitalSlug={hospitalSlug}
      patientId={patientId}
      encounterId={encounterId}
      admissionId={admissionId}
      labOrderId={labOrderId}
      prescriptionId={prescriptionId}
      invoiceId={invoiceId}
      currentWorkspace={currentWorkspace}
      layout="horizontal"
      maxActions={maxActions}
      showBackToQueue={false}
      className={className}
    />
  );
}

// ============================================================================
// Section Wrapper Variant
// ============================================================================

export function RelatedActionsSection({
  hospitalSlug,
  patientId,
  encounterId,
  admissionId,
  labOrderId,
  prescriptionId,
  invoiceId,
  appointmentId,
  currentWorkspace,
  customActions = [],
  title = "Next Actions",
  className,
}: RelatedWorkspaceActionsProps) {
  const generatedActions = generateRelatedActions({
    hospitalSlug,
    patientId,
    encounterId,
    admissionId,
    labOrderId,
    prescriptionId,
    invoiceId,
    appointmentId,
    currentWorkspace,
  });

  const allActions = [...generatedActions, ...customActions];

  if (allActions.length === 0) return null;

  return (
    <section className={cn("surface-panel p-4 sm:p-5", className)}>
      <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {allActions.map((action) => (
          <ActionButton key={action.href} action={action} />
        ))}
      </div>
    </section>
  );
}

export default RelatedWorkspaceActions;

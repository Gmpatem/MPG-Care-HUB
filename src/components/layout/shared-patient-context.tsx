"use client";

import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  Stethoscope,
  FlaskConical,
  Pill,
  CreditCard,
  HeartPulse,
  BedDouble,
  FileText,
  UserRound,
  ArrowRight,
} from "lucide-react";
import { StatusBadge, type StatusTone } from "@/components/layout/status-badge";
import { InfoGrid } from "@/components/layout/info-grid";
import { Button } from "@/components/ui/button";

// ============================================================================
// Types
// ============================================================================

export type PatientInfo = {
  id?: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  patient_number?: string | null;
  sex?: string | null;
  date_of_birth?: string | null;
  phone?: string | null;
  email?: string | null;
};

export type AppointmentInfo = {
  id?: string;
  scheduled_at?: string | null;
  check_in_at?: string | null;
  visit_type?: string | null;
  reason?: string | null;
  queue_number?: number | null;
  status?: string | null;
  staff?: { full_name?: string | null } | null;
  staff_name?: string | null;
};

export type EncounterInfo = {
  id?: string;
  status?: string | null;
  stage?: string | null;
  chief_complaint?: string | null;
  admission_requested?: boolean | null;
  requires_lab?: boolean | null;
  disposition_type?: string | null;
  started_at?: string | null;
  finalized_at?: string | null;
  results_reviewed_at?: string | null;
};

export type AdmissionInfo = {
  id?: string;
  admitted_at?: string | null;
  discharge_requested?: boolean | null;
  discharge_requested_at?: string | null;
  admission_reason?: string | null;
  ward?: { name?: string | null; code?: string | null; ward_type?: string | null } | null;
  bed?: { bed_number?: string | null; status?: string | null } | null;
  admitting_doctor?: { full_name?: string | null; specialty?: string | null } | null;
};

export type LabOrderInfo = {
  id?: string;
  status?: string | null;
  priority?: string | null;
  ordered_at?: string | null;
  completed_at?: string | null;
  sample_collected_at?: string | null;
  clinical_notes?: string | null;
  ordered_by_staff?: { full_name?: string | null } | null;
};

export type PrescriptionInfo = {
  id?: string;
  status?: string | null;
  prescribed_at?: string | null;
  notes?: string | null;
  prescribed_by_staff?: { full_name?: string | null } | null;
};

export type InvoiceInfo = {
  id?: string;
  invoice_number?: string | null;
  status?: string | null;
  issued_at?: string | null;
  due_at?: string | null;
  total_amount?: number | null;
  balance_due?: number | null;
};

export type RelatedLink = {
  label: string;
  href: string;
  icon?: LucideIcon;
  variant?: "default" | "outline";
};

export type SharedPatientContextProps = {
  hospitalSlug: string;
  patient: PatientInfo | null;
  // Optional context layers
  appointment?: AppointmentInfo | null;
  encounter?: EncounterInfo | null;
  admission?: AdmissionInfo | null;
  labOrder?: LabOrderInfo | null;
  prescription?: PrescriptionInfo | null;
  invoice?: InvoiceInfo | null;
  // Display options
  showRelatedLinks?: boolean;
  customLinks?: RelatedLink[];
  primaryItems?: Array<{ label: string; value: string | number | null | undefined }>;
  secondaryItems?: Array<{ label: string; value: string | number | null | undefined }>;
  children?: React.ReactNode;
};

// ============================================================================
// Helper Functions
// ============================================================================

export function fullName(patient: PatientInfo | null | undefined): string {
  if (!patient) return "Unknown patient";
  return [patient.first_name, patient.middle_name, patient.last_name]
    .filter(Boolean)
    .join(" ");
}

export function formatDateTime(value: string | null | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString("en-PH", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ageFromDob(dateOfBirth: string | null | undefined): string {
  if (!dateOfBirth) return "—";
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return "—";
  const now = new Date();
  let age = now.getFullYear() - dob.getFullYear();
  const m = now.getMonth() - dob.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < dob.getDate())) age--;
  return age >= 0 ? `${age}y` : "—";
}

export function encounterTone(stage: string | null | undefined): StatusTone {
  if (stage === "awaiting_results") return "warning";
  if (stage === "results_review") return "success";
  if (stage === "admission_requested") return "danger";
  if (stage === "completed") return "neutral";
  return "info";
}

export function encounterLabel(stage: string | null | undefined): string {
  if (stage === "awaiting_results") return "awaiting lab results";
  if (stage === "results_review") return "ready for review";
  if (stage === "admission_requested") return "admission requested";
  if (stage === "treatment_decided") return "treatment decided";
  if (stage === "completed") return "completed";
  if (stage === "initial_review") return "initial review";
  return stage ? stage.replace(/_/g, " ") : "new consultation";
}

export function labOrderTone(status: string | null | undefined): StatusTone {
  if (status === "completed") return "success";
  if (status === "in_progress") return "info";
  if (status === "cancelled") return "danger";
  return "warning";
}

export function prescriptionTone(status: string | null | undefined): StatusTone {
  if (status === "dispensed") return "success";
  if (status === "partially_dispensed") return "warning";
  return "info";
}

export function invoiceTone(status: string | null | undefined): StatusTone {
  if (status === "paid") return "success";
  if (status === "partially_paid") return "warning";
  if (status === "cancelled") return "danger";
  return "neutral";
}

export function admissionTone(dischargeRequested: boolean | null | undefined): StatusTone {
  if (dischargeRequested) return "warning";
  return "success";
}

// ============================================================================
// Sub-Components
// ============================================================================

function PatientIdentity({
  patient,
  statusLabel,
  statusTone,
  subtitle,
}: {
  patient: PatientInfo;
  statusLabel?: string | null;
  statusTone?: StatusTone;
  subtitle?: string | null;
}) {
  return (
    <div className="space-y-1">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-lg font-semibold text-foreground">{fullName(patient)}</h3>
        {statusLabel && (
          <StatusBadge label={statusLabel} tone={statusTone ?? "neutral"} className="px-2.5 py-1" />
        )}
      </div>
      <p className="text-sm text-muted-foreground">
        {patient.patient_number || "No patient number"}
        {patient.sex && ` · ${patient.sex}`}
        {patient.date_of_birth && ` · ${ageFromDob(patient.date_of_birth)}`}
        {subtitle && ` · ${subtitle}`}
      </p>
      {(patient.phone || patient.email) && (
        <p className="text-xs text-muted-foreground">
          {patient.phone && `Phone: ${patient.phone}`}
          {patient.phone && patient.email && " · "}
          {patient.email && `Email: ${patient.email}`}
        </p>
      )}
    </div>
  );
}

function ContextBadges({
  encounter,
  admission,
  labOrder,
  prescription,
  invoice,
}: {
  encounter?: EncounterInfo | null;
  admission?: AdmissionInfo | null;
  labOrder?: LabOrderInfo | null;
  prescription?: PrescriptionInfo | null;
  invoice?: InvoiceInfo | null;
}) {
  const badges: Array<{ label: string; tone: StatusTone }> = [];

  if (encounter?.stage) {
    badges.push({
      label: encounterLabel(encounter.stage),
      tone: encounterTone(encounter.stage),
    });
  }

  if (admission?.discharge_requested) {
    badges.push({ label: "discharge requested", tone: "warning" });
  } else if (admission) {
    badges.push({ label: "admitted", tone: "success" });
  }

  if (labOrder?.status) {
    badges.push({
      label: labOrder.status.replace(/_/g, " "),
      tone: labOrderTone(labOrder.status),
    });
  }

  if (prescription?.status) {
    badges.push({
      label: prescription.status.replace(/_/g, " "),
      tone: prescriptionTone(prescription.status),
    });
  }

  if (invoice?.status) {
    badges.push({
      label: invoice.status.replace(/_/g, " "),
      tone: invoiceTone(invoice.status),
    });
  }

  if (badges.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-1.5">
      {badges.map((badge, index) => (
        <StatusBadge key={index} label={badge.label} tone={badge.tone} className="px-2 py-0.5 text-xs" />
      ))}
    </div>
  );
}

function RelatedWorkspaceLinks({
  hospitalSlug,
  patientId,
  encounterId,
  admissionId,
  labOrderId,
  prescriptionId,
  invoiceId,
  customLinks,
}: {
  hospitalSlug: string;
  patientId?: string;
  encounterId?: string;
  admissionId?: string;
  labOrderId?: string;
  prescriptionId?: string;
  invoiceId?: string;
  customLinks?: RelatedLink[];
}) {
  const links: Array<{ label: string; href: string; icon: React.ComponentType<{ className?: string }> }> = [];

  if (patientId && !encounterId && !admissionId) {
    links.push({ label: "Doctor", href: `/h/${hospitalSlug}/doctor/patients/${patientId}`, icon: Stethoscope });
  }

  if (encounterId) {
    links.push({ label: "Encounter", href: `/h/${hospitalSlug}/encounters/${encounterId}`, icon: FileText });
  }

  if (admissionId) {
    links.push({ label: "Nurse Chart", href: `/h/${hospitalSlug}/nurse/admissions/${admissionId}`, icon: HeartPulse });
    links.push({ label: "Ward", href: `/h/${hospitalSlug}/ward/admissions/${admissionId}`, icon: BedDouble });
  }

  if (labOrderId) {
    links.push({ label: "Lab Order", href: `/h/${hospitalSlug}/lab/orders/${labOrderId}`, icon: FlaskConical });
  }

  if (prescriptionId) {
    links.push({
      label: "Prescription",
      href: `/h/${hospitalSlug}/pharmacy/prescriptions/${prescriptionId}`,
      icon: Pill,
    });
  }

  if (invoiceId) {
    links.push({ label: "Invoice", href: `/h/${hospitalSlug}/billing/invoices/${invoiceId}`, icon: CreditCard });
  }

  if (patientId) {
    links.push({ label: "Patient Profile", href: `/h/${hospitalSlug}/patients/${patientId}`, icon: UserRound });
  }

  const allLinks = [...links, ...(customLinks || [])];

  if (allLinks.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {allLinks.slice(0, 5).map((link) => {
        const Icon = link.icon;
        return (
          <Button key={link.href} asChild variant="outline" size="sm">
            <Link href={link.href}>
              {Icon && <Icon className="mr-1.5 h-3.5 w-3.5" />}
              {link.label}
            </Link>
          </Button>
        );
      })}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function SharedPatientContext({
  hospitalSlug,
  patient,
  appointment,
  encounter,
  admission,
  labOrder,
  prescription,
  invoice,
  showRelatedLinks = true,
  customLinks,
  primaryItems,
  secondaryItems,
  children,
}: SharedPatientContextProps) {
  if (!patient) {
    return (
      <section className="surface-panel p-4 sm:p-5">
        <div className="flex items-center gap-3 text-muted-foreground">
          <UserRound className="h-5 w-5" />
          <p className="text-sm">Patient information not available</p>
        </div>
      </section>
    );
  }

  // Determine primary context for status display
  const contextStatus = encounter?.stage
    ? { label: encounterLabel(encounter.stage), tone: encounterTone(encounter.stage) }
    : admission?.discharge_requested
    ? { label: "discharge requested", tone: "warning" as StatusTone }
    : admission
    ? { label: "admitted", tone: "success" as StatusTone }
    : labOrder?.status
    ? { label: labOrder.status.replace(/_/g, " "), tone: labOrderTone(labOrder.status) }
    : prescription?.status
    ? { label: prescription.status.replace(/_/g, " "), tone: prescriptionTone(prescription.status) }
    : invoice?.status
    ? { label: invoice.status.replace(/_/g, " "), tone: invoiceTone(invoice.status) }
    : null;

  // Build default primary items if not provided
  const defaultPrimaryItems = primaryItems ?? [
    { label: "Phone", value: patient.phone },
    { label: "Sex", value: patient.sex },
    ...(appointment
      ? [
          { label: "Visit Type", value: appointment.visit_type },
          { label: "Checked In", value: formatDateTime(appointment.check_in_at) },
        ]
      : []),
    ...(admission
      ? [
          { label: "Ward", value: admission.ward?.name },
          { label: "Bed", value: admission.bed?.bed_number },
        ]
      : []),
    ...(labOrder
      ? [
          { label: "Priority", value: labOrder.priority },
          { label: "Ordered", value: formatDateTime(labOrder.ordered_at) },
        ]
      : []),
    ...(prescription
      ? [
          { label: "Prescriber", value: prescription.prescribed_by_staff?.full_name },
          { label: "Prescribed", value: formatDateTime(prescription.prescribed_at) },
        ]
      : []),
    ...(invoice
      ? [
          { label: "Invoice #", value: invoice.invoice_number },
          { label: "Issued", value: formatDateTime(invoice.issued_at) },
        ]
      : []),
  ].slice(0, 4);

  // Build default secondary items
  const defaultSecondaryItems = secondaryItems ?? [
    ...(encounter
      ? [
          { label: "Encounter Status", value: encounter.status },
          { label: "Chief Complaint", value: encounter.chief_complaint },
        ]
      : []),
    ...(admission
      ? [
          { label: "Doctor", value: admission.admitting_doctor?.full_name },
          { label: "Admitted", value: formatDateTime(admission.admitted_at) },
        ]
      : []),
    ...(labOrder
      ? [
          { label: "Ordered By", value: labOrder.ordered_by_staff?.full_name },
          { label: "Sample Collected", value: formatDateTime(labOrder.sample_collected_at) },
        ]
      : []),
    ...(invoice
      ? [
          { label: "Total", value: invoice.total_amount },
          { label: "Balance Due", value: invoice.balance_due },
        ]
      : []),
  ].slice(0, 4);

  return (
    <section className="surface-panel p-4 sm:p-5">
      <div className="flex flex-col gap-4">
        {/* Identity Row */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <PatientIdentity
            patient={patient}
            statusLabel={contextStatus?.label}
            statusTone={contextStatus?.tone}
            subtitle={appointment?.visit_type}
          />
          {children}
        </div>

        {/* Context Badges */}
        <ContextBadges
          encounter={encounter}
          admission={admission}
          labOrder={labOrder}
          prescription={prescription}
          invoice={invoice}
        />

        {/* Info Grid */}
        <div className="mt-2 space-y-3">
          <InfoGrid items={defaultPrimaryItems} columnsClassName="md:grid-cols-2 xl:grid-cols-4" />
          {defaultSecondaryItems.length > 0 && (
            <InfoGrid items={defaultSecondaryItems} columnsClassName="md:grid-cols-2 xl:grid-cols-4" />
          )}
        </div>

        {/* Related Links */}
        {showRelatedLinks && (
          <div className="pt-2">
            <RelatedWorkspaceLinks
              hospitalSlug={hospitalSlug}
              patientId={patient.id}
              encounterId={encounter?.id}
              admissionId={admission?.id}
              labOrderId={labOrder?.id}
              prescriptionId={prescription?.id}
              invoiceId={invoice?.id}
              customLinks={customLinks}
            />
          </div>
        )}
      </div>
    </section>
  );
}

// ============================================================================
// Compact Variant for Lists/Queues
// ============================================================================

export function CompactPatientContext({
  patient,
  statusLabel,
  statusTone,
  metadata,
}: {
  patient: PatientInfo | null;
  statusLabel?: string;
  statusTone?: StatusTone;
  metadata?: string;
}) {
  if (!patient) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <UserRound className="h-4 w-4" />
        <span className="text-sm">Unknown patient</span>
      </div>
    );
  }

  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 space-y-0.5">
        <div className="flex items-center gap-2">
          <span className="font-medium text-foreground truncate">{fullName(patient)}</span>
          {statusLabel && (
            <StatusBadge label={statusLabel} tone={statusTone ?? "neutral"} className="px-2 py-0.5 text-xs" />
          )}
        </div>
        <p className="text-sm text-muted-foreground truncate">
          {patient.patient_number || "No ID"}
          {metadata && ` · ${metadata}`}
        </p>
      </div>
    </div>
  );
}

export default SharedPatientContext;

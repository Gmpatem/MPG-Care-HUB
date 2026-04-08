# 🧩 Component Inventory

**Generated:** 2026-04-07  
**Status:** Confirmed from actual codebase

---

## UI Components (shadcn/ui)

| Component | File | Props | Dependencies | Notes |
|-----------|------|-------|--------------|-------|
| Badge | `badge.tsx` | `variant`, `className` | `cn`, `cva` | Status indicators |
| Button | `button.tsx` | `variant`, `size`, `asChild` | `cva`, `radix-ui/Slot` | CVA-based variants |
| Card | `card.tsx` | `size`, `className` | `cn` | Size: default/sm |
| Dialog | `dialog.tsx` | Standard | `@radix-ui/react-dialog` | Modal dialogs |
| DropdownMenu | `dropdown-menu.tsx` | Standard | `@radix-ui/react-dropdown-menu` | Menus |
| Input | `input.tsx` | Standard + `className` | `cn` | Form input |
| Label | `label.tsx` | Standard | `@radix-ui/react-label` | Form labels |
| Select | `select.tsx` | Standard | `@radix-ui/react-select` | Dropdown select |
| Sheet | `sheet.tsx` | `side`, `className` | `@radix-ui/react-dialog` | Slide-over panels |
| Table | `table.tsx` | Standard | `cn` | Data tables |
| Textarea | `textarea.tsx` | Standard | `cn` | Multi-line input |

### Button Variants

```typescript
variants: {
  default: "bg-primary text-primary-foreground"
  outline: "border-border bg-background"
  secondary: "bg-secondary text-secondary-foreground"
  ghost: "hover:bg-muted"
  destructive: "bg-destructive/10 text-destructive"
  link: "text-primary underline-offset-4"
}
sizes: default, xs, sm, lg, icon, icon-xs, icon-sm, icon-lg
```

---

## Layout Components

| Component | File | Props | Purpose | Usage |
|-----------|------|-------|---------|-------|
| HospitalShell | `hospital-shell.tsx` | `hospitalName`, `hospitalSlug`, `allowedWorkspaces`, `isPlatformOwner`, `primaryRole`, `children` | Main app shell with navigation | All hospital routes |
| PlatformShell | `platform-shell.tsx` | (not analyzed) | Platform admin shell | Platform routes |
| WorkspacePageHeader | `workspace-page-header.tsx` | `eyebrow`, `title`, `description`, `actions` | Page header pattern | Feature pages |
| WorkspaceSectionHeader | `workspace-section-header.tsx` | `title`, `description`, `actions` | Section headers | Within pages |
| WorkspaceStatCard | `workspace-stat-card.tsx` | `title`, `value`, `description`, `icon` | KPI cards | Dashboards |
| WorkspaceEmptyState | `workspace-empty-state.tsx` | `title`, `description`, `action`, `icon` | Empty state pattern | Lists with no data |
| InfoGrid | `info-grid.tsx` | (not analyzed) | Data display grid | Detail pages |
| PatientSummaryPanel | `patient-summary-panel.tsx` | (not analyzed) | Patient info display | Patient pages |
| StatusBadge | `status-badge.tsx` | (not analyzed) | Status indicators | Tables, lists |
| WorkflowStepCard | `workflow-step-card.tsx` | `step`, `title`, `description`, `icon` | Step indicators | Onboarding, flows |

### HospitalShell Navigation Sections

1. **Overview**
   - Hospital Overview (Dashboard)

2. **Patient Flow**
   - Front Desk (conditional)
   - Appointments (conditional)
   - Encounters (conditional)
   - Patient Directory (conditional)

3. **Clinical Workspaces**
   - Doctor Workspace (conditional)
   - Nursing Station (conditional)
   - Ward Admissions (conditional)
   - Ward Census (conditional)
   - Laboratory (conditional)
   - Pharmacy (conditional)
   - Billing (conditional)

4. **Administration**
   - Access Control (admin only)
   - Staff Management (admin only)
   - Ward Setup (admin only)
   - Hospital Settings (admin only)
   - Audit Activity (admin only)

---

## Feedback Components

| Component | File | Props | Purpose |
|-----------|------|-------|---------|
| AppToastHost | `app-toast-host.tsx` | None | Global toast container |
| InlineFeedback | `inline-feedback.tsx` | `message`, `tone`, `className` | Inline error/success messages |
| RouteFeedbackBar | `route-feedback-bar.tsx` | (not analyzed) | Route-level feedback |

### Toast System

**Location:** `src/lib/ui/app-toast.ts`

```typescript
type AppToastTone = "success" | "error" | "info";
type AppToastPayload = {
  title: string;
  description?: string;
  tone?: AppToastTone;
  durationMs?: number;
};
```

**Usage:**
```typescript
emitAppToast({
  title: "Success",
  description: "Patient created",
  tone: "success"
});
```

---

## Form Components

| Component | File | Props | Purpose |
|-----------|------|-------|---------|
| FormMessage | `form-message.tsx` | (not analyzed) | Form validation messages |
| SubmitButton | `submit-button.tsx` | (not analyzed) | Button with loading state |

---

## Feature Components

### Admin Setup (`features/admin-setup/components/`)

| Component | Purpose |
|-----------|---------|
| AccessAdminPage | User access management UI |
| AdminSetupNav | Navigation for admin sections |
| BedsAdminPage | Bed configuration |
| DepartmentsAdminPage | Department management |
| LabTestsAdminPage | Lab test catalog |
| MedicationsAdminPage | Medication catalog |
| PharmacyStockAdminPage | Stock management |
| WardsAdminPage | Ward configuration |

### Appointments (`features/appointments/components/`)

| Component | Purpose |
|-----------|---------|
| (empty directory) | Components likely inline in pages |

### Billing (`features/billing/components/`)

| Component | Purpose |
|-----------|---------|
| BillingDashboardPage | Billing overview |
| BillingSummaryCard | Summary statistics |
| CreateInvoiceForm | Invoice creation |
| InvoiceDetailPage | Invoice view/edit |
| InvoiceItemsInput | Line item management |
| InvoicesPage | Invoice list |
| PaymentEntryForm | Payment recording |
| PaymentsPage | Payment list |

### Doctor (`features/doctor/components/`)

| Component | Purpose |
|-----------|---------|
| AddDoctorRoundNoteForm | Round note entry |
| DoctorDischargeActionBar | Discharge actions |
| DoctorRoundsWorkspacePage | Rounds view |
| RequestDischargeButton | Discharge request |

### Doctor Rounds (`features/doctor-rounds/components/`)

| Component | Purpose |
|-----------|---------|
| DoctorRoundForm | Round entry form |
| DoctorRoundsDashboard | Rounds overview |

### Doctor Workflow (`features/doctor-workflow/components/`)

| Component | Purpose |
|-----------|---------|
| DoctorDashboard | Doctor workspace home |
| DoctorLabOrderForm | Lab order creation |
| DoctorPatientWorkspacePage | Patient detail view |
| DoctorPatientWorkspace | (wrapper) |
| DoctorPrescriptionPatientPickerPage | Patient selection |
| DoctorQueueList | Patient queue |
| DoctorStats | KPI display |

### Encounters (`features/encounters/components/`)

| Component | Purpose |
|-----------|---------|
| EncounterWorkflowButtons | Workflow actions |

### Frontdesk (`features/frontdesk/components/`)

| Component | Purpose |
|-----------|---------|
| CheckInVitalsForm | Vital signs entry |
| FrontdeskDashboard | Front desk home |
| FrontdeskPatientForm | Patient registration |
| FrontdeskPatientSearch | Patient lookup |
| FrontdeskQueuePage | Queue management |
| FrontdeskQueuePreview | Queue preview card |
| FrontdeskSmartIntake | Smart registration |
| FrontdeskStats | Statistics display |
| FrontdeskVisitForm | Visit creation |

### Lab (`features/lab/components/`)

| Component | Purpose |
|-----------|---------|
| CompleteLabOrderButton | Mark order complete |
| CreateLabTestForm | Test creation |
| EncounterLabResultsPanel | Results display |
| LabDashboard | Lab workspace |
| LabOrderDetailPage | Order details |
| LabOrderItemResultForm | Result entry |
| LabOrdersPage | Order list |
| LabTestsPage | Test catalog |

### Nurse (`features/nurse/components/`)

| Component | Purpose |
|-----------|---------|
| AddNurseNoteForm | Nursing note entry |
| DischargeClearanceCard | Clearance display |
| NurseAdmissionChartPage | Patient chart |
| NurseDashboardPage | Nursing station |
| NurseDashboard | (variant) |
| NurseDischargeClearanceForm | Clearance workflow |
| NurseVitalsForm | Vitals entry |
| RecordNurseVitalsForm | Vitals recording |
| VitalsTimelineChart | Vitals visualization |

### Pharmacy (`features/pharmacy/components/`)

| Component | Purpose |
|-----------|---------|
| CreatePrescriptionForm | Prescription creation |
| DispensePrescriptionItemForm | Dispensing workflow |
| PharmacyQueuePage | Queue management |
| PharmacyWorkflowCard | Workflow step |
| PrescriptionDetailPage | Prescription view |

### Staff (`features/staff/components/`)

| Component | Purpose |
|-----------|---------|
| StaffForm | Staff creation/editing |
| StaffPage | Staff list/management |

### Ward (`features/ward/components/`)

| Component | Purpose |
|-----------|---------|
| AdmissionActivityTimeline | Activity history |
| AdmissionDetailPage | Admission view |
| AdmissionTransferForm | Transfer workflow |
| CensusPage | Ward census |
| DischargeChecklistPanel | Discharge tasks |
| FinalizePatientDischargeForm | Discharge completion |
| InpatientQuickNav | Quick navigation |
| NurseNoteForm | Note entry |
| NurseVitalsForm | Vitals entry |
| OpenAdmissionActivityButton | Activity button |
| WardAdmissionDetailPage | Detail view |
| WardAdmissionIntakePage | Intake workflow |
| WardCensusPage | Census view |
| WardConfigPage | Configuration |
| WardDashboardPage | Ward home |
| WardDischargeQueuePage | Discharge queue |
| WardWorkflowConfigPage | Workflow settings |

---

## Custom Hooks

**Status:** No dedicated `src/hooks/` directory found

Hooks appear to be:
- Colocated within components
- Using React built-in hooks only
- No custom hook library extracted

**Inferred Hook Usage:**
- `useState`, `useEffect` - Standard React
- `usePathname`, `useRouter` - Next.js navigation
- `useForm` - React Hook Form
- No custom `useAuth`, `useQuery` hooks detected

---

## Utilities

### Core Utilities (`src/lib/`)

| File | Exports | Purpose |
|------|---------|---------|
| `utils.ts` | `cn(...inputs)` | Tailwind class merging (clsx + tailwind-merge) |

### Auth Utilities (`src/lib/auth/`)

| File | Exports | Purpose |
|------|---------|---------|
| `roles.ts` | `AppRole` type | Role definitions |
| `permissions.ts` | `hasRole()` | Role checking helper |
| `session.ts` | `requireUser()`, `getCurrentProfile()` | Session management |
| `workspaces.ts` | `hasWorkspaceAccess()` | Workspace authorization |
| `guards.ts` | (unknown) | Auth guards |
| `get-hospital-access-context.ts` | (unknown) | Access context |
| `require-hospital-workspace-access.ts` | (unknown) | Middleware guard |

### Supabase Clients (`src/lib/supabase/`)

| File | Exports | Purpose |
|------|---------|---------|
| `server.ts` | `createClient()` | Server component client |
| `browser.ts` | `createClient()` | Browser client |
| `middleware.ts` | `updateSession()` | Middleware session handler |

### UI Utilities (`src/lib/ui/`)

| File | Exports | Purpose |
|------|---------|---------|
| `app-toast.ts` | `emitAppToast()`, `getAppToastEventName()` | Toast system |
| `get-friendly-error-message.ts` | (unknown) | Error message formatting |

### General Utilities (`src/lib/utils/`)

| File | Purpose |
|------|---------|
| `audit.ts` | Audit logging helpers |
| `dates.ts` | Date formatting utilities |
| `money.ts` | Currency formatting |
| `slug.ts` | URL slug generation |

---

## Server Actions

Server Actions follow pattern: `features/{feature}/actions/{action-name}.ts`

### Admin Setup Actions

| Action | File | Purpose |
|--------|------|---------|
| createBed | `create-bed.ts` | Create hospital bed |
| createDepartment | `create-department.ts` | Create department |
| createHospitalAccessInvitation | `create-hospital-access-invitation.ts` | Invite users |
| createLabTest | `create-lab-test.ts` | Add lab test type |
| createMedication | `create-medication.ts` | Add medication |
| createPharmacyStockBatch | `create-pharmacy-stock-batch.ts` | Stock intake |
| createWard | `create-ward.ts` | Create ward |

### Appointments Actions

| Action | File |
|--------|------|
| createAppointment | `create-appointment.ts` |

### Billing Actions

| Action | File |
|--------|------|
| createInvoice | `create-invoice.ts` |
| createPayment | `create-payment.ts` |

### Doctor Actions

| Action | File |
|--------|------|
| addDoctorRoundNote | `add-doctor-round-note.ts` |
| requestPatientDischarge | `request-patient-discharge.ts` |

### Doctor Rounds Actions

| Action | File |
|--------|------|
| createDoctorRound | `create-doctor-round.ts` |

### Doctor Workflow Actions

| Action | File |
|--------|------|
| createLabOrder | `create-lab-order.ts` |

### Encounters Actions

| Action | File |
|--------|------|
| createEncounter | `create-encounter.ts` |
| updateEncounterWorkflow | `update-encounter-workflow.ts` |

### Frontdesk Actions

| Action | File |
|--------|------|
| checkInWithVitals | `check-in-with-vitals.ts` |
| createFrontdeskPatient | `create-frontdesk-patient.ts` |
| createFrontdeskVisit | `create-frontdesk-visit.ts` |
| createOrQueuePatient | `create-or-queue-patient.ts` |

### Hospitals Actions

| Action | File |
|--------|------|
| createHospital | `create-hospital.ts` |
| createSelfServeFacility | `create-self-serve-facility.ts` |
| updateHospitalSettings | `update-hospital-settings.ts` |

### Invitations Actions

| Action | File |
|--------|------|
| acceptInvitation | `accept-invitation.ts` |
| createInvitation | `create-invitation.ts` |

### Lab Actions

| Action | File |
|--------|------|
| completeLabOrder | `complete-lab-order.ts` |
| createLabTest | `create-lab-test.ts` |
| saveLabOrderItemResult | `save-lab-order-item-result.ts` |

### Nurse Actions

| Action | File |
|--------|------|
| addNurseNote | `add-nurse-note.ts` |
| nurseDischargeClearance | `nurse-discharge-clearance.ts` |
| recordNurseVitals | `record-nurse-vitals.ts` |

### Patients Actions

| Action | File |
|--------|------|
| createPatient | `create-patient.ts` |

### Pharmacy Actions

| Action | File |
|--------|------|
| createPrescription | `create-prescription.ts` |
| dispensePrescriptionItem | `dispense-prescription-item.ts` |

### Staff Actions

| Action | File |
|--------|------|
| createStaff | `create-staff.ts` |
| createStaffProfile | `create-staff-profile.ts` |
| toggleHospitalUserStatus | `toggle-hospital-user-status.ts` |
| toggleStaffActive | `toggle-staff-active.ts` |
| updateHospitalUserRole | `update-hospital-user-role.ts` |
| updateHospitalUserWorkspaces | `update-hospital-user-workspaces.ts` |
| updateStaff | `update-staff.ts` |

### Ward Actions

| Action | File |
|--------|------|
| advanceAdmissionWorkflowStep | `advance-admission-workflow-step.ts` |
| completeDischarge | `complete-discharge.ts` |
| createAdmissionIntake | `create-admission-intake.ts` |
| createAdmissionTransfer | `create-admission-transfer.ts` |
| createNurseNote | `create-nurse-note.ts` |
| createNurseVitals | `create-nurse-vitals.ts` |
| finalizePatientDischarge | `finalize-patient-discharge.ts` |
| toggleDischargeChecklistItem | `toggle-discharge-checklist-item.ts` |

**Total Server Actions:** ~60

---

## Schemas / Validation

| Feature | Schema File | Purpose |
|---------|-------------|---------|
| Appointments | `appointment.schema.ts` | Appointment validation |
| Billing | `invoice.schema.ts` | Invoice validation |
| Billing | `payment.schema.ts` | Payment validation |
| Encounters | `encounter.schema.ts` | Encounter validation |
| Hospitals | `hospital.schema.ts` | Hospital validation |
| Invitations | `invitation.schema.ts` | Invitation validation |
| Lab | `lab-test.schema.ts` | Lab test validation |
| Patients | `patient.schema.ts` | Patient validation |

**Total Schemas:** 8

---

## Types

| File | Purpose |
|------|---------|
| `src/lib/db/types.ts` | Database types (likely Supabase-generated) |
| `src/features/frontdesk/types.ts` | Frontdesk type definitions |
| `src/features/doctor-workflow/types.ts` | Doctor workflow types |

---

## Component Consolidation Opportunities

### Potential Duplicates

| Pattern | Locations | Recommendation |
|---------|-----------|----------------|
| VitalsForm | nurse, ward | Consolidate into shared component |
| NoteForm | nurse, ward, doctor | Consolidate if structure similar |
| Dashboard | Multiple features | Keep separate (different needs) |

### Orphaned/Rarely Used

| Component | Status | Note |
|-----------|--------|------|
| `cards/` directory | Empty | Not used |
| `tables/` directory | Empty | Not used |

---

## Component Usage Matrix

| Component | Used In | Reuse Level |
|-----------|---------|-------------|
| Button | All pages | High |
| Card | Most pages | High |
| Input | All forms | High |
| HospitalShell | All hospital routes | Critical |
| WorkspaceStatCard | Dashboards | Medium |
| WorkspaceEmptyState | List pages | Medium |
| Sheet | Mobile nav | Low |
| Dialog | Forms | Medium |

---

## Summary Statistics

| Category | Count |
|----------|-------|
| UI Components | 11 |
| Layout Components | 10 |
| Feedback Components | 3 |
| Form Components | 2 |
| Feature Components | ~70 |
| Server Actions | ~60 |
| Schemas | 8 |
| Utilities | 15+ |
| **Total Building Blocks** | **~180** |

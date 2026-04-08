/**
 * Unified Feedback Vocabulary for MPG Care Hub
 * 
 * This file defines consistent, practical, human-readable messages for common
 * application states across all workspaces. Use these to ensure the app speaks
 * with one clear voice.
 * 
 * Principles:
 * - Practical and operational, not fluffy
 * - Short and scannable
 * - Context-aware (what, why, what next)
 * - Professional healthcare tone
 */

// ============================================================================
// LOADING MESSAGES
// ============================================================================

export const loadingMessages = {
  default: "Loading...",
  workspace: "Loading workspace...",
  data: "Loading data...",
  queue: "Loading queue...",
  patient: "Loading patient details...",
  results: "Loading results...",
  history: "Loading history...",
  saving: "Saving...",
  processing: "Processing...",
  submitting: "Submitting...",
} as const;

// ============================================================================
// EMPTY STATE MESSAGES - by workspace context
// ============================================================================

export const emptyStateMessages = {
  // Front desk
  frontdeskQueue: {
    title: "No patients in queue",
    description: "Patients will appear here once they are checked in. Use the intake form to register arrivals.",
  },
  frontdeskIntake: {
    title: "Search to begin",
    description: "Enter a name, phone number, or patient ID to find existing records or register a new patient.",
  },
  
  // Doctor workspace
  doctorQueue: {
    title: "No patients waiting",
    description: "Checked-in patients and active encounters will appear here. The queue updates automatically as patients arrive.",
  },
  doctorNoPatientSelected: {
    title: "Select a patient to begin",
    description: "Choose a patient from the queue to open their clinical workspace and manage their encounter.",
  },
  doctorEncounter: {
    title: "No active encounter",
    description: "Start an encounter to document the clinical visit, record findings, and create lab or prescription orders.",
  },
  doctorLabs: {
    title: "No lab orders yet",
    description: "Lab orders will appear here once created from the encounter. Click Order Lab to request investigations.",
  },
  doctorPrescriptions: {
    title: "No prescriptions yet",
    description: "Prescriptions will appear here once created from the encounter. Click Prescribe to write medications.",
  },
  
  // Lab workspace
  labQueue: {
    title: "No pending lab orders",
    description: "Doctor lab requests will appear here automatically once they are created from an encounter.",
  },
  labOrdersEmpty: {
    title: "No lab orders yet",
    description: "Create the first lab order to begin tracking investigations for patients.",
  },
  labResults: {
    title: "No results entered",
    description: "Enter test results to build the lab report. Results save automatically as you work.",
  },
  labCatalogEmpty: {
    title: "No lab tests configured",
    description: "Add lab tests to the catalog so doctors can order them during encounters.",
  },
  
  // Pharmacy workspace
  pharmacyQueue: {
    title: "No prescriptions received",
    description: "Doctor prescriptions will appear here automatically after they are created from the clinical workflow.",
  },
  pharmacyDispensingEmpty: {
    title: "No items to dispense",
    description: "Prescription items will appear here once a prescription is selected from the queue.",
  },
  pharmacyStockEmpty: {
    title: "No stock records",
    description: "Add medications to the pharmacy catalog and record stock levels to enable dispensing.",
  },
  
  // Billing workspace
  billingInvoicesEmpty: {
    title: "No invoices yet",
    description: "Create the first invoice to begin billing activity. Invoices can be created from encounters or directly.",
  },
  billingPaymentsEmpty: {
    title: "No payments posted",
    description: "Payments will appear here once recorded against invoices.",
  },
  billingNoOpenInvoice: {
    title: "No open invoice selected",
    description: "Select an invoice to view details, add items, or record payments.",
  },
  
  // Nurse workspace
  nurseAdmissionsEmpty: {
    title: "No admitted patients",
    description: "Admitted patients will appear here when doctors request admission or through the admission intake process.",
  },
  nurseVitalsEmpty: {
    title: "No vitals recorded",
    description: "Record the first set of vitals to begin tracking patient observations.",
  },
  
  // Ward workspace
  wardAdmissionsEmpty: {
    title: "No active admissions",
    description: "Admitted patients will appear here when they are assigned to a ward bed.",
  },
  wardNoPatientSelected: {
    title: "Select an admission to manage",
    description: "Choose a patient from the admissions list to manage their ward care, transfers, and discharge.",
  },
  wardNoWardsConfigured: {
    title: "No wards configured",
    description: "Create wards and add beds to enable patient admissions. Start with Ward Setup to configure your first ward.",
  },
  wardDischargeEmpty: {
    title: "No discharge requests",
    description: "Patients with discharge requests will appear here when doctors mark them ready for discharge.",
  },
  
  // Admin / Setup
  adminNoStaff: {
    title: "No staff members",
    description: "Invite staff members to give them access to hospital workspaces.",
  },
  adminNoDepartments: {
    title: "No departments configured",
    description: "Create departments to organize staff and clinical workflows.",
  },
  adminNoBeds: {
    title: "No beds configured",
    description: "Add beds to wards to enable patient admissions.",
  },
  
  // General / Search
  searchNoResults: {
    title: "No matches found",
    description: "Try adjusting your search terms or check spelling.",
  },
  searchNoQuery: {
    title: "Enter search terms",
    description: "Type at least 2 characters to search for patients, staff, or records.",
  },
  
  // Generic fallback
  generic: {
    title: "Nothing here yet",
    description: "Items will appear here when they are created or assigned.",
  },
} as const;

// ============================================================================
// SUCCESS MESSAGES
// ============================================================================

export const successMessages = {
  // Patient workflow
  patientRegistered: "Patient registered successfully.",
  patientCheckedIn: "Patient checked in and added to queue.",
  patientUpdated: "Patient details updated.",
  
  // Encounter workflow
  encounterStarted: "Encounter started. You can now document the visit.",
  encounterUpdated: "Encounter details saved.",
  encounterCompleted: "Encounter completed successfully.",
  
  // Lab workflow
  labOrderCreated: "Lab order created and sent to the lab queue.",
  labResultsSaved: "Lab results saved successfully.",
  labOrderCompleted: "Lab order completed and returned to doctor.",
  
  // Pharmacy workflow
  prescriptionCreated: "Prescription created and sent to pharmacy.",
  itemDispensed: "Item marked as dispensed.",
  prescriptionCompleted: "Prescription fully dispensed.",
  
  // Billing workflow
  invoiceCreated: "Invoice created successfully.",
  invoiceUpdated: "Invoice updated.",
  paymentRecorded: "Payment recorded successfully.",
  
  // Ward/Nurse workflow
  admissionCreated: "Admission created and patient assigned to ward.",
  vitalsRecorded: "Vitals recorded successfully.",
  nurseNoteAdded: "Nurse note added to chart.",
  transferCompleted: "Patient transferred successfully.",
  dischargeCompleted: "Patient discharged successfully.",
  
  // General
  saved: "Changes saved successfully.",
  deleted: "Item deleted.",
  updated: "Update successful.",
  created: "Created successfully.",
  submitted: "Submitted successfully.",
} as const;

// ============================================================================
// ERROR MESSAGES
// ============================================================================

export const errorMessages = {
  // Generic
  generic: "Something went wrong. Please try again.",
  networkError: "Could not connect to the server. Check your connection and try again.",
  sessionExpired: "Your session has expired. Please sign in again.",
  permissionDenied: "You do not have permission to perform this action.",
  notFound: "The requested record could not be found.",
  
  // Validation
  requiredField: "Please fill in all required fields.",
  invalidDate: "Please enter a valid date.",
  invalidNumber: "Please enter a valid number.",
  invalidEmail: "Please enter a valid email address.",
  
  // Workflow specific
  patientNotFound: "Patient record not found. Please check the patient ID.",
  encounterNotFound: "Encounter not found. It may have been deleted.",
  admissionNotFound: "Admission record not found.",
  labOrderNotFound: "Lab order not found.",
  prescriptionNotFound: "Prescription not found.",
  invoiceNotFound: "Invoice not found.",
  
  // Blocking errors
  cannotModifyCompleted: "This record is completed and cannot be modified.",
  stockUnavailable: "Insufficient stock for this item.",
  bedNotAvailable: "The selected bed is no longer available.",
  dischargeNotReady: "Discharge cannot be completed. Checklist items are still pending.",
  
  // Duplicate/Conflict
  duplicateRecord: "A similar record already exists.",
  alreadyExists: "This record already exists.",
  
  // Payment/Billing
  paymentFailed: "Payment could not be recorded. Please try again.",
  invoiceAlreadyPaid: "This invoice is already paid in full.",
  amountExceedsBalance: "Payment amount exceeds the outstanding balance.",
} as const;

// ============================================================================
// WARNING / BLOCKED STATE MESSAGES
// ============================================================================

export const warningMessages = {
  // Workflow warnings
  dischargeBlocked: {
    title: "Discharge cannot proceed",
    description: "Complete all checklist items and resolve billing before discharge.",
  },
  labOrderIncomplete: {
    title: "Lab order incomplete",
    description: "Some test items are still pending results. Complete all items to finish the order.",
  },
  prescriptionPartial: {
    title: "Partially dispensed",
    description: "Some items are out of stock. Dispense available items or mark out of stock to continue.",
  },
  encounterStageBlocked: {
    title: "Action not available",
    description: "Complete the current stage before proceeding to the next step.",
  },
  
  // Stock/Availability warnings
  lowStock: {
    title: "Low stock",
    description: "Stock levels are running low. Consider restocking soon.",
  },
  noStock: {
    title: "Out of stock",
    description: "This item is currently unavailable for dispensing.",
  },
  bedCapacity: {
    title: "Ward near capacity",
    description: "Available beds are limited. Consider expanding capacity or managing discharges.",
  },
  
  // Configuration warnings
  setupIncomplete: {
    title: "Setup incomplete",
    description: "Complete the required configuration to enable this workflow.",
  },
  noLabCatalog: {
    title: "No lab catalog configured",
    description: "Add lab tests to the catalog before doctors can order investigations.",
  },
  noPharmacyCatalog: {
    title: "No pharmacy catalog configured",
    description: "Add medications to the catalog before prescriptions can be dispensed.",
  },
} as const;

// ============================================================================
// INFO / GUIDANCE MESSAGES
// ============================================================================

export const infoMessages = {
  nextStep: "Next step: ",
  workflowTip: "Tip: ",
  autoSave: "Changes are saved automatically.",
  draftSaved: "Draft saved. You can return to this later.",
  
  // Workflow guidance
  selectPatientFirst: "Select a patient from the queue to begin working.",
  startEncounterFirst: "Start an encounter to document findings and create orders.",
  reviewResults: "Review lab results before making a treatment decision.",
  
  // Partial states
  partialCompletion: "Some items are still pending. You can return to complete them later.",
  awaitingExternal: "Waiting for external results or approval.",
} as const;

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get a context-appropriate empty state message
 */
export function getEmptyStateMessage(
  context: keyof typeof emptyStateMessages
): { title: string; description: string } {
  return emptyStateMessages[context] ?? emptyStateMessages.generic;
}

/**
 * Get a friendly success message with optional context
 */
export function getSuccessMessage(
  key: keyof typeof successMessages,
  context?: string
): string {
  const base = successMessages[key];
  return context ? `${base} ${context}` : base;
}

/**
 * Get an error message, falling back to generic if not found
 */
export function getErrorMessage(key: keyof typeof errorMessages): string {
  return errorMessages[key] ?? errorMessages.generic;
}

/**
 * Get a warning/blocking state message
 */
export function getWarningMessage(
  key: keyof typeof warningMessages
): { title: string; description: string } {
  return warningMessages[key];
}

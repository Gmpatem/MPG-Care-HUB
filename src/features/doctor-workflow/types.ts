export type EncounterStage =
  | "initial_review"
  | "awaiting_results"
  | "results_review"
  | "treatment_decided"
  | "admission_requested"
  | "completed";

export type DispositionType =
  | "outpatient_treatment"
  | "admission"
  | "referred"
  | "follow_up"
  | "observation"
  | "none";

export type DoctorQueueRow = {
  hospital_id: string;
  appointment_id: string;
  patient_id: string;
  patient_number: string | null;
  first_name: string | null;
  last_name: string | null;
  middle_name: string | null;
  assigned_staff_id: string | null;
  assigned_staff_name: string | null;
  visit_type: string | null;
  scheduled_at: string | null;
  check_in_at: string | null;
  queue_number: number | null;
  appointment_status: string | null;
  encounter_id: string | null;
  encounter_status: string | null;
  encounter_stage: EncounterStage | null;
  requires_lab: boolean | null;
  disposition_type: DispositionType | null;
  started_at: string | null;
  finalized_at: string | null;
  results_reviewed_at: string | null;
  final_decision_at: string | null;
  chief_complaint: string | null;
  admission_requested: boolean | null;
};

export type DoctorSummary = {
  hospital_id: string;
  hospital_name: string | null;
  appointments_today: number | null;
  checked_in_today: number | null;
  completed_appointments_today: number | null;
  emergency_visits_today: number | null;
  encounters_today: number | null;
  draft_encounters_today: number | null;
  finalized_encounters_today: number | null;
  active_admissions: number | null;
  admissions_today: number | null;
  discharges_today: number | null;
  payments_today_count: number | null;
  payments_today_amount: number | null;
  lab_orders_today: number | null;
  pending_lab_orders: number | null;
  prescriptions_today: number | null;
  pending_prescriptions: number | null;
};

export type DoctorStageCounts = {
  new_consultations: number;
  awaiting_results: number;
  ready_for_final_decision: number;
  admission_requested: number;
  completed_cases: number;
};
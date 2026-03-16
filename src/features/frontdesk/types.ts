export type FrontdeskSummary = {
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

export type FrontdeskQueueRow = {
  hospital_id: string;
  appointment_id: string;
  patient_id: string;
  patient_number: string | null;
  first_name: string | null;
  last_name: string | null;
  middle_name: string | null;
  staff_name: string | null;
  appointment_type: string | null;
  visit_type: string | null;
  scheduled_at: string | null;
  check_in_at: string | null;
  queue_number: number | null;
  status: string | null;
  reason: string | null;
  arrival_notes: string | null;
};
export type LabSummary = {
  pending_orders: number;
  in_progress: number;
  completed_today: number;
  avg_turnaround_min: number | null;
  urgent_pending: number;
};

export type LabOrderRow = {
  order_id: string;
  patient_id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  patient_number: string | null;
  order_status: string | null;
  priority: string | null;
  specimen_type: string | null;
  test_names: string | null;
  ordered_at: string | null;
  ordered_by_name: string | null;
  specimen_collected_at: string | null;
  collector_name: string | null;
  result_reported_at: string | null;
};

export type LabTestRow = {
  id: string;
  code: string | null;
  name: string;
  description: string | null;
  price: number | null;
  active: boolean;
  created_at: string;
};

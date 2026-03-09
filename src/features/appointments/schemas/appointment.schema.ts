import { z } from "zod";

export const createAppointmentSchema = z.object({
  hospital_id: z.string().uuid("Invalid hospital id"),
  patient_id: z.string().uuid("Patient is required"),
  appointment_type: z.string().optional(),
  scheduled_at: z.string().min(1, "Scheduled date and time is required"),
  duration_minutes: z.coerce.number().int().positive().default(30),
  reason: z.string().optional(),
  notes: z.string().optional(),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

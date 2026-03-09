import { z } from "zod";

export const createEncounterSchema = z.object({
  hospital_id: z.string().uuid("Invalid hospital id"),
  patient_id: z.string().uuid("Patient is required"),
  appointment_id: z.string().uuid().optional().or(z.literal("")),
  chief_complaint: z.string().optional(),
  history_notes: z.string().optional(),
  assessment_notes: z.string().optional(),
  plan_notes: z.string().optional(),
  diagnosis_text: z.string().optional(),
  temperature: z.string().optional(),
  blood_pressure: z.string().optional(),
  pulse_rate: z.string().optional(),
  respiratory_rate: z.string().optional(),
  oxygen_saturation: z.string().optional(),
  weight_kg: z.string().optional(),
});

export type CreateEncounterInput = z.infer<typeof createEncounterSchema>;

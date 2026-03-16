import { z } from "zod";

export const createInvoiceSchema = z.object({
  hospital_id: z.string().uuid("Invalid hospital id"),
  patient_id: z.string().uuid("Patient is required"),
  appointment_id: z.string().uuid().optional().or(z.literal("")),
  encounter_id: z.string().uuid().optional().or(z.literal("")),
  notes: z.string().optional(),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;

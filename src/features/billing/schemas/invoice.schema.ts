import { z } from "zod";

export const createInvoiceSchema = z.object({
  hospital_id: z.string().uuid("Invalid hospital id"),
  patient_id: z.string().uuid("Patient is required"),
  appointment_id: z.string().uuid().optional().or(z.literal("")),
  encounter_id: z.string().uuid().optional().or(z.literal("")),
  notes: z.string().optional(),
  items_text: z.string().min(1, "At least one invoice item is required"),
});

export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;

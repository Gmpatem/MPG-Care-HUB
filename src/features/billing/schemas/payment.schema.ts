import { z } from "zod";

export const createPaymentSchema = z.object({
  hospital_id: z.string().uuid("Invalid hospital id"),
  invoice_id: z.string().uuid("Invoice is required"),
  amount: z.coerce.number().positive("Payment amount must be greater than zero"),
  method: z.enum(["cash", "mobile_money", "bank_transfer", "card", "other"]),
  payment_date: z.string().min(1, "Payment date is required"),
  reference_number: z.string().optional(),
  notes: z.string().optional(),
});

export type CreatePaymentInput = z.infer<typeof createPaymentSchema>;

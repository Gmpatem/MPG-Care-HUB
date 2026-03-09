import { z } from "zod";

export const createInvitationSchema = z.object({
  hospital_id: z.string().uuid("Invalid hospital id"),
  email: z.string().email("Valid email is required"),
  role: z.enum(["hospital_admin", "receptionist", "doctor", "nurse", "cashier"]),
});

export type CreateInvitationInput = z.infer<typeof createInvitationSchema>;

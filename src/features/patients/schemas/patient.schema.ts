import { z } from "zod";

export const createPatientSchema = z.object({
  hospital_id: z.string().uuid("Invalid hospital id"),
  first_name: z.string().min(1, "First name is required"),
  last_name: z.string().min(1, "Last name is required"),
  middle_name: z.string().optional(),
  sex: z.enum(["male", "female", "other", "unknown"]),
  date_of_birth: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  address_text: z.string().optional(),
  emergency_contact_name: z.string().optional(),
  emergency_contact_phone: z.string().optional(),
});

export type CreatePatientInput = z.infer<typeof createPatientSchema>;

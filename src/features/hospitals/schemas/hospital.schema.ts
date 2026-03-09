import { z } from "zod";

export const createHospitalSchema = z.object({
  name: z.string().min(2, "Hospital name is required"),
  slug: z
    .string()
    .min(2, "Slug is required")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  type: z.enum(["hospital", "clinic", "maternity", "practice"]),
  country_code: z.string().min(2).max(3).default("CM"),
  timezone: z.string().min(2).default("Africa/Douala"),
  currency_code: z.string().min(2).max(3).default("XAF"),
  phone: z.string().optional(),
  email: z.string().email("Enter a valid email").optional().or(z.literal("")),
  address_text: z.string().optional(),
});

export type CreateHospitalInput = z.infer<typeof createHospitalSchema>;

import { z } from "zod";

export const createLabTestSchema = z.object({
  hospital_id: z.string().uuid("Invalid hospital id"),
  department_id: z.string().uuid().optional().or(z.literal("")),
  code: z.string().trim().max(50).optional(),
  name: z.string().trim().min(2, "Test name is required").max(150),
  description: z.string().trim().max(1000).optional(),
  price: z.coerce.number().min(0, "Price must be 0 or more"),
  active: z.coerce.boolean().default(true),
});

export type CreateLabTestInput = z.infer<typeof createLabTestSchema>;
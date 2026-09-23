import { z } from "zod";

export const updatePatientSchema = z
  .object({
    firstName: z.string().trim().min(1).max(100).optional(),
    lastName: z.string().trim().min(1).max(100).optional(),
    dateOfBirth: z.coerce.date().optional(),
    gender: z.string().trim().min(1).max(30).optional(),
    bloodGroup: z.string().trim().min(1).max(10).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export type UpdatePatientInput = z.infer<typeof updatePatientSchema>;

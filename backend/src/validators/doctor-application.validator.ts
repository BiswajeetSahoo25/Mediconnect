import { z } from "zod";

export const createDoctorApplicationSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  licenseNumber: z.string().trim().min(3).max(100),
  licenseAuthority: z.string().trim().min(1).max(150).optional(),
  yearsOfExperience: z.coerce.number().int().min(0).max(100).optional(),
  about: z.string().trim().min(1).max(3000).optional(),
});

export type CreateDoctorApplicationInput = z.infer<typeof createDoctorApplicationSchema>;

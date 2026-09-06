import { z } from "zod";

export const doctorIdSchema = z.object({
  id: z.string().uuid(),
});

export const listDoctorsQuerySchema = z.object({
  specializationId: z.string().uuid().optional(),
  facilityId: z.string().uuid().optional(),
  search: z.string().trim().min(1).max(100).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const availableSlotsQuerySchema = z.object({
  doctorFacilityId: z.string().uuid(),
  date: z.coerce.date(),
});

export const applyDoctorSchema = z.object({
  firstName: z.string().trim().min(1).max(100),
  lastName: z.string().trim().min(1).max(100),
  licenseNumber: z.string().trim().min(3).max(100),
  licenseAuthority: z.string().trim().min(1).max(150).optional(),
  yearsOfExperience: z.coerce.number().int().min(0).max(100).optional(),
  about: z.string().trim().min(1).max(3000).optional(),
});

export const updateDoctorProfileSchema = z
  .object({
    firstName: z.string().trim().min(1).max(100).optional(),
    lastName: z.string().trim().min(1).max(100).optional(),
    yearsOfExperience: z.number().int().min(0).optional(),
    about: z.string().trim().min(1).optional(),
    profileImage: z.string().trim().url().max(500).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export type DoctorIdInput = z.infer<typeof doctorIdSchema>;

export type ListDoctorsQuery = z.infer<typeof listDoctorsQuerySchema>;

export type AvailableSlotsQuery = z.infer<typeof availableSlotsQuerySchema>;

export type ApplyDoctorInput = z.infer<typeof applyDoctorSchema>;

export type UpdateDoctorProfileInput = z.infer<
  typeof updateDoctorProfileSchema
>;

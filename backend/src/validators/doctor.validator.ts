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

export type DoctorIdInput = z.infer<typeof doctorIdSchema>;
export type ListDoctorsQuery = z.infer<typeof listDoctorsQuerySchema>;
export type AvailableSlotsQuery = z.infer<typeof availableSlotsQuerySchema>;

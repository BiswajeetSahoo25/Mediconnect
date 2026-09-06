import { z } from "zod";

const appointmentTypes = [
  "CONSULTATION",
  "FOLLOW_UP",
  "EMERGENCY",
  "ROUTINE",
  "SPECIALIZED",
] as const;

const appointmentModels = ["IN_PERSON", "VIDEO_CALL", "PHONE_CALL"] as const;

const appointmentStatuses = [
  "SCHEDULED",
  "COMPLETED",
  "CANCELLED",
  "RESCHEDULED",
  "NO_SHOW",
] as const;

export const createAppointmentSchema = z.object({
  doctorFacilityId: z.string().uuid(),

  appointmentType: z.enum(appointmentTypes),

  appointmentModel: z.enum(appointmentModels),

  appointmentDate: z.coerce.date(),

  reason: z.string().trim().min(1).max(2000).optional(),

  patientNotes: z.string().trim().min(1).max(2000).optional(),
});

export const appointmentIdSchema = z.object({
  id: z.string().uuid(),
});

export const doctorFacilityIdSchema = z.object({
  doctorFacilityId: z.string().uuid(),
});

export const listAppointmentsQuerySchema = z.object({
  status: z.enum(appointmentStatuses).optional(),

  from: z.coerce.date().optional(),

  to: z.coerce.date().optional(),

  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const cancelAppointmentSchema = z.object({
  reason: z.string().trim().min(1).max(2000),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;

export type AppointmentIdInput = z.infer<typeof appointmentIdSchema>;

export type DoctorFacilityIdInput = z.infer<typeof doctorFacilityIdSchema>;

export type ListAppointmentsQuery = z.infer<typeof listAppointmentsQuerySchema>;

export type CancelAppointmentInput = z.infer<typeof cancelAppointmentSchema>;

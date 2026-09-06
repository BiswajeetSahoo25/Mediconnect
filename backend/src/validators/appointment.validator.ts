import { z } from "zod";

const appointmentTypes = [
  "CONSULTATION",
  "FOLLOW_UP",
  "EMERGENCY",
  "ROUTINE",
  "SPECIALIZED",
] as const;

const timeSchema = z
  .string()
  .regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Time must use HH:mm format");

const appointmentScheduleSchema = z
  .object({
    appointmentDate: z.coerce.date(),
    startTime: timeSchema,
    endTime: timeSchema,
  })
  .refine((data) => data.endTime > data.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export const createAppointmentSchema = appointmentScheduleSchema.safeExtend({
  doctorFacilityId: z.string().uuid(),
  appointmentType: z.enum(appointmentTypes),
  reason: z.string().trim().min(1).max(2000).optional(),
  patientNotes: z.string().trim().min(1).max(2000).optional(),
});

export const rescheduleAppointmentSchema = appointmentScheduleSchema;

export const cancelAppointmentSchema = z.object({
  reason: z.string().trim().min(1).max(2000),
});

export const appointmentIdSchema = z.object({
  id: z.string().uuid(),
});

export const listAppointmentsQuerySchema = z.object({
  status: z
    .enum(["SCHEDULED", "COMPLETED", "CANCELLED", "RESCHEDULED", "NO_SHOW"])
    .optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type CreateAppointmentInput = z.infer<typeof createAppointmentSchema>;
export type RescheduleAppointmentInput = z.infer<typeof rescheduleAppointmentSchema>;
export type CancelAppointmentInput = z.infer<typeof cancelAppointmentSchema>;
export type AppointmentIdInput = z.infer<typeof appointmentIdSchema>;
export type ListAppointmentsQuery = z.infer<typeof listAppointmentsQuerySchema>;

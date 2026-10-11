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

export const pendingApplicationsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const availableSlotsQuerySchema = z.object({
  doctorFacilityId: z.string().uuid(),
  // A date-only value is interpreted as the facility's local calendar date.
  date: z.iso.date(),
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
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

const practiceAvailabilityWindowSchema = z
  .object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
  })
  .refine((window) => window.startTime < window.endTime, {
    message: "End time must be later than start time",
    path: ["endTime"],
  });

function validateAvailabilityWindows(
  windows: Array<{ dayOfWeek: number; startTime: string; endTime: string }>,
  context: z.RefinementCtx,
) {
  for (let index = 0; index < windows.length; index += 1) {
    for (let otherIndex = index + 1; otherIndex < windows.length; otherIndex += 1) {
      const current = windows[index]!;
      const other = windows[otherIndex]!;
      if (
        current.dayOfWeek === other.dayOfWeek &&
        current.startTime < other.endTime &&
        other.startTime < current.endTime
      ) {
        context.addIssue({
          code: "custom",
          path: [otherIndex, "startTime"],
          message: "Availability windows on the same day cannot overlap",
        });
      }
    }
  }
}

const practiceFacilitySettingsSchema = z.object({
  consultationFee: z.number().min(0).max(9_999_999_999.99),
  consultationMode: z.enum(["IN_PERSON", "OFFLINE", "ONLINE", "BOTH"]),
  onlineBookingEnabled: z.boolean(),
  onlineBookingLimit: z.number().int().min(1).max(1000).nullable().optional(),
  availability: z.array(practiceAvailabilityWindowSchema).max(28).optional(),
});

export const createDoctorPracticeFacilitySchema = practiceFacilitySettingsSchema
  .extend({
    facilityId: z.uuid(),
    departmentId: z.uuid(),
    joiningDate: z.iso.date().optional(),
  })
  .superRefine((data, context) => {
    validateAvailabilityWindows(data.availability ?? [], context);
  });

export const updateDoctorPracticeFacilitySchema =
  practiceFacilitySettingsSchema
    .partial()
    .refine((data) => Object.keys(data).length > 0, {
      message: "At least one setting is required",
    })
    .superRefine((data, context) => {
      if (data.availability) {
        validateAvailabilityWindows(data.availability, context);
      }
    });

export const doctorFacilityAssignmentIdSchema = z.object({
  doctorFacilityId: z.uuid(),
});

export const updateDoctorSpecializationsSchema = z
  .object({
    specializationIds: z.array(z.uuid()).max(20),
    primarySpecializationId: z.uuid().nullable(),
  })
  .superRefine((data, context) => {
    if (new Set(data.specializationIds).size !== data.specializationIds.length) {
      context.addIssue({
        code: "custom",
        path: ["specializationIds"],
        message: "A specialization can only be selected once",
      });
    }
    if (
      (data.specializationIds.length === 0 && data.primarySpecializationId !== null) ||
      (data.specializationIds.length > 0 &&
        (!data.primarySpecializationId ||
          !data.specializationIds.includes(data.primarySpecializationId)))
    ) {
      context.addIssue({
        code: "custom",
        path: ["primarySpecializationId"],
        message: "Choose a primary specialization from your selected list",
      });
    }
  });

export type DoctorIdInput = z.infer<typeof doctorIdSchema>;

export type ListDoctorsQuery = z.infer<typeof listDoctorsQuerySchema>;

export type PendingApplicationsQuery = z.infer<
  typeof pendingApplicationsQuerySchema
>;

export type AvailableSlotsQuery = z.infer<typeof availableSlotsQuerySchema>;

export type ApplyDoctorInput = z.infer<typeof applyDoctorSchema>;

export type UpdateDoctorProfileInput = z.infer<
  typeof updateDoctorProfileSchema
>;

export type CreateDoctorPracticeFacilityInput = z.infer<
  typeof createDoctorPracticeFacilitySchema
>;

export type UpdateDoctorPracticeFacilityInput = z.infer<
  typeof updateDoctorPracticeFacilitySchema
>;

export type DoctorFacilityAssignmentIdInput = z.infer<
  typeof doctorFacilityAssignmentIdSchema
>;

export type UpdateDoctorSpecializationsInput = z.infer<
  typeof updateDoctorSpecializationsSchema
>;

export const revokeDoctorSchema = z.object({
  reason: z.string().trim().min(1).max(3000),
});

export type RevokeDoctorInput = z.infer<typeof revokeDoctorSchema>;

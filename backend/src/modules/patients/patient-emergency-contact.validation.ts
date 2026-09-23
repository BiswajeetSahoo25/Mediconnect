import { z } from "zod";

export const createEmergencyContactSchema = z
  .object({
    contactName: z.string().trim().min(1).max(150).optional(),
    contactPhone: z.string().trim().min(1).max(20).optional(),
    contactRelationship: z.string().trim().min(1).max(50).optional(),
    isPrimary: z.boolean().optional(),
  })
  .refine(
    (data) => data.contactName !== undefined || data.contactPhone !== undefined,
    {
      message: "Contact name or phone is required",
    },
  );

export const updateEmergencyContactSchema = z
  .object({
    contactName: z.string().trim().min(1).max(150).optional(),
    contactPhone: z.string().trim().min(1).max(20).optional(),
    contactRelationship: z.string().trim().min(1).max(50).optional(),
    isPrimary: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export type CreateEmergencyContactInput = z.infer<
  typeof createEmergencyContactSchema
>;

export type UpdateEmergencyContactInput = z.infer<
  typeof updateEmergencyContactSchema
>;

export const emergencyContactIdSchema = z.object({
  id: z.string().uuid(),
});

export type EmergencyContactIdInput = z.infer<typeof emergencyContactIdSchema>;

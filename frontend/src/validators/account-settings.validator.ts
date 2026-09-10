import { z } from "zod";

const addressSchema = z.object({
  dbId: z.string().optional(),
  addressType: z.enum(["HOME", "WORK", "OTHER"]),
  addressLine1: z.string(),
  addressLine2: z.string(),
  landmark: z.string(),
  city: z.string(),
  state: z.string(),
  pincode: z.string(),
  country: z.string(),
  isDefault: z.boolean(),
});

const emergencyContactSchema = z.object({
  dbId: z.string().optional(),
  contactName: z.string(),
  contactPhone: z.string(),
  contactRelationship: z.string(),
  isPrimary: z.boolean(),
});

export const accountSettingsSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(100),

  lastName: z.string().trim().min(1, "Last name is required").max(100),

  email: z.email("Enter a valid email address"),

  phone: z
    .string()
    .trim()
    .min(10, "Phone number must be at least 10 characters")
    .max(20, "Phone number must be at most 20 characters"),

  dateOfBirth: z.string().optional(),

  gender: z.string().optional(),

  bloodGroup: z.string().optional(),

  addresses: z.array(addressSchema),

  emergencyContacts: z
    .array(emergencyContactSchema)
    .max(3, "You can add up to 3 emergency contacts"),
});

export type AccountSettingsForm = z.infer<typeof accountSettingsSchema>;

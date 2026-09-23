import { z } from "zod";

const addressTypes = ["HOME", "WORK", "OTHER"] as const;

export const createUserAddressSchema = z.object({
  addressLine1: z.string().trim().min(1).max(255),
  addressLine2: z.string().trim().min(1).max(255).optional(),
  landmark: z.string().trim().min(1).max(255).optional(),

  city: z.string().trim().min(1).max(100),
  state: z.string().trim().min(1).max(100),
  country: z.string().trim().min(1).max(100),
  pincode: z.string().trim().min(1).max(20),

  latitude: z.number().min(-90).max(90).optional(),
  longitude: z.number().min(-180).max(180).optional(),

  addressType: z.enum(addressTypes).default("HOME"),
  isDefault: z.boolean().optional(),
});

export const updateUserAddressSchema = z
  .object({
    addressLine1: z.string().trim().min(1).max(255).optional(),
    addressLine2: z.string().trim().min(1).max(255).optional(),
    landmark: z.string().trim().min(1).max(255).optional(),

    city: z.string().trim().min(1).max(100).optional(),
    state: z.string().trim().min(1).max(100).optional(),
    country: z.string().trim().min(1).max(100).optional(),
    pincode: z.string().trim().min(1).max(20).optional(),

    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),

    addressType: z.enum(addressTypes).optional(),
    isDefault: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field is required",
  });

export const userAddressIdSchema = z.object({
  id: z.string().uuid(),
});

export type CreateUserAddressInput = z.infer<typeof createUserAddressSchema>;

export type UpdateUserAddressInput = z.infer<typeof updateUserAddressSchema>;

export type UserAddressIdInput = z.infer<typeof userAddressIdSchema>;

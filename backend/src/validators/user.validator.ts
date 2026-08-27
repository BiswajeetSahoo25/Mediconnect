import { z } from "zod";

export const userIdSchema = z.strictObject({
  id: z.uuid(),
});
export type UserIdInput = z.infer<typeof userIdSchema>;

export const createUserSchema = z.strictObject({
  email: z.email(),
  phone: z.string().min(10).max(20).optional(),
  password: z.string().min(8).max(128),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;

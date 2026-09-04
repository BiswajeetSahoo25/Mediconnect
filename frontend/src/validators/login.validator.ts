import { z } from "zod";

export const loginSchema = z.strictObject({
  email: z.email(),
  password: z.string().min(8).max(128),
});

export type LoginFormData = z.infer<typeof loginSchema>;

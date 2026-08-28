import { z } from "zod";

export const signupSchema = z.strictObject({
  email: z.email(),
  phone: z.preprocess(
    (value) => (value === "" ? undefined : value),
    z
      .string()
      .regex(/^\d{10}$/, "Phone number must contain exactly 10 digits")
      .optional(),
  ),
  password: z.string().min(8),
});

export type SignupFormData = z.infer<typeof signupSchema>;

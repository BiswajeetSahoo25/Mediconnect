import { z } from "zod";

export const userIdSchema = z.strictObject({
  id: z.uuid(),
});
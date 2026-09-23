import { z } from "zod";

export const listMedicinesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  search: z.string().trim().min(1).max(100).optional(),
});

export const medicineIdSchema = z.object({
  id: z.string().trim().min(1).max(100),
});

export type ListMedicinesQuery = z.infer<typeof listMedicinesQuerySchema>;
export type MedicineIdInput = z.infer<typeof medicineIdSchema>;

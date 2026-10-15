import { z } from "zod";

export const MAX_MEDICAL_RECORD_BYTES = 5 * 1024 * 1024;

export const medicalDocumentTypes = [
  "LAB_REPORT",
  "IMAGING",
  "PRESCRIPTION",
  "DISCHARGE_SUMMARY",
  "REFERRAL",
  "OTHER",
] as const;

export const medicalRecordIdSchema = z.object({
  id: z.string().uuid(),
});

export const createMedicalRecordSchema = z.object({
  fileName: z
    .string()
    .trim()
    .min(1)
    .max(255)
    .refine((value) => !/[\\/\u0000-\u001f]/.test(value), "Invalid file name"),
  documentType: z.enum(medicalDocumentTypes),
  mimeType: z.enum(["application/pdf", "image/jpeg", "image/png", "image/webp"]),
  contentBase64: z
    .string()
    .min(4)
    .max(7_000_000)
    .regex(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/),
});

export type CreateMedicalRecordInput = z.infer<typeof createMedicalRecordSchema>;
export type MedicalRecordIdInput = z.infer<typeof medicalRecordIdSchema>;

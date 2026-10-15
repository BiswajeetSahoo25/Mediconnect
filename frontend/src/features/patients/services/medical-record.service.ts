import { api, handleApiError } from "../../../services/api";

export const MEDICAL_DOCUMENT_TYPES = [
  "LAB_REPORT",
  "IMAGING",
  "PRESCRIPTION",
  "DISCHARGE_SUMMARY",
  "REFERRAL",
  "OTHER",
] as const;

export type MedicalDocumentType = (typeof MEDICAL_DOCUMENT_TYPES)[number];

export interface MedicalDocument {
  id: string;
  patientId: string;
  appointmentId: string | null;
  documentType: MedicalDocumentType;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  mimeType: string | null;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

type MedicalDocumentsResponse = {
  status: "success";
  data: MedicalDocument[];
};

type MedicalDocumentResponse = {
  status: "success";
  data: MedicalDocument;
};

export type CreateMedicalDocumentInput = {
  fileName: string;
  documentType: MedicalDocumentType;
  mimeType: "application/pdf" | "image/jpeg" | "image/png" | "image/webp";
  contentBase64: string;
};

const MEDICAL_DOCUMENTS_URL = "/patients/me/medical-records";

export async function getMedicalDocuments() {
  try {
    const response = await api.get<MedicalDocumentsResponse>(
      MEDICAL_DOCUMENTS_URL,
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function createMedicalDocument(input: CreateMedicalDocumentInput) {
  try {
    const response = await api.post<MedicalDocumentResponse>(
      MEDICAL_DOCUMENTS_URL,
      input,
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function downloadMedicalDocument(id: string) {
  try {
    const response = await api.get<Blob>(
      `${MEDICAL_DOCUMENTS_URL}/${encodeURIComponent(id)}/file`,
      { responseType: "blob" },
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function deleteMedicalDocument(id: string) {
  try {
    const response = await api.delete<{ status: "success"; message: string }>(
      `${MEDICAL_DOCUMENTS_URL}/${encodeURIComponent(id)}`,
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

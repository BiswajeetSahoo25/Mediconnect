import { api } from "./api";

export interface Patient {
  id: string;
  userId: string;
  firstName: string;
  middleName: string | null;
  lastName: string;
  dateOfBirth: string | null;
  gender: string | null;
  bloodGroup: string | null;
  maritalStatus: string | null;
  occupation: string | null;
  profileCompleted: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PatientResponse {
  status: "success";
  data: Patient;
}

export interface UpdatePatientInput {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: string;
  bloodGroup?: string;
}

export async function getPatient(): Promise<PatientResponse> {
  const response = await api.get<PatientResponse>("/patients/me");

  return response.data;
}

export async function updatePatient(
  data: UpdatePatientInput,
): Promise<PatientResponse> {
  const response = await api.patch<PatientResponse>("/patients/me", data);

  return response.data;
}

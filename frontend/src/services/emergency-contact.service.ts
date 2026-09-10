import { api } from "./api";

export interface EmergencyContact {
  id: string;
  patientId: string;
  contactName: string;
  contactPhone: string;
  contactRelationship: string;
  isPrimary: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EmergencyContactsResponse {
  status: "success";
  data: EmergencyContact[];
}

export interface EmergencyContactResponse {
  status: "success";
  data: EmergencyContact;
}

export interface CreateEmergencyContactInput {
  contactName?: string;
  contactPhone?: string;
  contactRelationship?: string;
  isPrimary?: boolean;
}

export interface UpdateEmergencyContactInput {
  contactName?: string;
  contactPhone?: string;
  contactRelationship?: string;
  isPrimary?: boolean;
}

export async function getEmergencyContacts(): Promise<EmergencyContactsResponse> {
  const response = await api.get<EmergencyContactsResponse>(
    "/patients/me/emergency-contacts/",
  );

  return response.data;
}

export async function createEmergencyContact(
  data: CreateEmergencyContactInput,
): Promise<EmergencyContactResponse> {
  const response = await api.post<EmergencyContactResponse>(
    "/patients/me/emergency-contacts/",
    data,
  );

  return response.data;
}

export async function updateEmergencyContact(
  id: string,
  data: UpdateEmergencyContactInput,
): Promise<EmergencyContactResponse> {
  const response = await api.patch<EmergencyContactResponse>(
    `/patients/me/emergency-contacts/${encodeURIComponent(id)}`,
    data,
  );

  return response.data;
}

export async function deleteEmergencyContact(id: string): Promise<void> {
  await api.delete(`/patients/me/emergency-contacts/${encodeURIComponent(id)}`);
}

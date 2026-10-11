import { api, handleApiError } from "../../../services/api";

export interface PendingDoctorApplication {
  id: string;
  firstName: string;
  lastName: string | null;
  licenseNumber: string;
  licenseAuthority: string | null;
  licenseVerificationStatus: string;
  yearsOfExperience: number | null;
  about: string | null;
  createdAt: string;
  user: { email: string; phone: string | null };
  specializations: Array<{
    id: string;
    isPrimary: boolean;
    specialization: { id: string; name: string };
  }>;
}

export interface PendingDoctorApplicationsResponse {
  status: "success";
  data: {
    items: PendingDoctorApplication[];
    pagination: { page: number; limit: number; total: number; totalPages: number };
  };
}

export async function getPendingDoctorApplications(page = 1) {
  try {
    const response = await api.get<PendingDoctorApplicationsResponse>(
      "/doctors/applications",
      { params: { page, limit: 20 } },
    );
    return response.data.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function approveDoctorApplication(id: string) {
  try {
    const response = await api.patch(`/doctors/applications/${encodeURIComponent(id)}/approve`);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

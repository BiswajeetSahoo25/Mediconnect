import { api, handleApiError } from "../../../services/api";
import type {
  DoctorApplicationStatus,
  DoctorListResponse,
  DoctorResponse,
  MyDoctorProfile,
} from "../types";

export interface GetDoctorsParams {
  page?: number;
  limit?: number;
  search?: string;
  specializationId?: string;
  facilityId?: string;
}

export async function getDoctors(params?: GetDoctorsParams) {
  try {
    const response = await api.get<DoctorListResponse>("/doctors", {
      params,
    });

    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function getDoctorById(id: string) {
  try {
    const response = await api.get<DoctorResponse>(
      `/doctors/${encodeURIComponent(id)}`,
    );

    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export interface SpecializationOption {
  id: string;
  name: string;
  description: string | null;
}

export async function getSpecializations() {
  try {
    const response = await api.get<{
      status: "success";
      data: SpecializationOption[];
    }>("/doctors/specializations");

    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export interface DoctorAvailabilityResponse {
  status: "success";
  data: {
    doctorFacilityId: string;
    date: string;
    timezone: string;
    windows: Array<{
      startTime: string;
      endTime: string;
    }>;
    onlineBookingEnabled: boolean;
    onlineBookingLimit: number | null;
  };
}

export async function getDoctorAvailability(
  id: string,
  doctorFacilityId: string,
  date: string,
) {
  try {
    const response = await api.get<DoctorAvailabilityResponse>(
      `/doctors/${encodeURIComponent(id)}/available-slots`,
      {
        params: {
          doctorFacilityId,
          date,
        },
      },
    );

    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}


export async function getMyDoctorProfile() {
  try {
    const response = await api.get<{
      status: "success";
      data: MyDoctorProfile;
    }>("/doctors/me");

    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export interface UpdateMyDoctorProfileInput {
  firstName?: string;
  lastName?: string;
  yearsOfExperience?: number;
  about?: string;
}

export async function updateMyDoctorProfile(
  data: UpdateMyDoctorProfileInput,
) {
  try {
    const response = await api.patch<{
      status: "success";
      data: MyDoctorProfile;
    }>("/doctors/me", data);

    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function getMyDoctorApplicationStatus() {
  try {
    const response = await api.get<{
      status: "success";
      data: { licenseVerificationStatus: DoctorApplicationStatus };
    }>("/doctors/application/me");

    return response.data.data;
  } catch (error) {
    handleApiError(error);
  }
}


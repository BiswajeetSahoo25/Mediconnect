import { api, handleApiError } from "../../../services/api";
import type {
  DoctorApplicationStatus,
  DoctorListResponse,
  DoctorSpecialization,
  DoctorPracticeWindowInput,
  DoctorResponse,
  MyDoctorPractice,
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

export async function updateMyDoctorSpecializations(data: {
  specializationIds: string[];
  primarySpecializationId: string | null;
}) {
  try {
    const response = await api.put<{
      status: "success";
      data: DoctorSpecialization[];
    }>("/doctors/me/specializations", data);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export interface CreateDoctorPracticeFacilityInput {
  facilityId: string;
  departmentId: string;
  consultationFee: number;
  consultationMode: "IN_PERSON" | "OFFLINE" | "ONLINE" | "BOTH";
  onlineBookingEnabled: boolean;
  onlineBookingLimit: number | null;
  availability: DoctorPracticeWindowInput[];
}

export type UpdateDoctorPracticeFacilityInput = Partial<
  Omit<CreateDoctorPracticeFacilityInput, "facilityId" | "departmentId">
>;

export async function getMyDoctorPractice() {
  try {
    const response = await api.get<{ status: "success"; data: MyDoctorPractice }>(
      "/doctors/me/practice",
    );
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function addMyDoctorPracticeFacility(
  data: CreateDoctorPracticeFacilityInput,
) {
  try {
    const response = await api.post<{
      status: "success";
      data: MyDoctorPractice["assignments"][number];
    }>("/doctors/me/practice/facilities", data);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function updateMyDoctorPracticeFacility(
  doctorFacilityId: string,
  data: UpdateDoctorPracticeFacilityInput,
) {
  try {
    const response = await api.patch<{
      status: "success";
      data: MyDoctorPractice["assignments"][number];
    }>(
      `/doctors/me/practice/facilities/${encodeURIComponent(doctorFacilityId)}`,
      data,
    );
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


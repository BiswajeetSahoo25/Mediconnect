import { api } from "../../../services/api";
import type { DoctorListResponse, DoctorResponse } from "../types";

export interface GetDoctorsParams {
  page?: number;
  limit?: number;
  search?: string;
  specializationId?: string;
  facilityId?: string;
}

export async function getDoctors(params?: GetDoctorsParams) {
  const response = await api.get<DoctorListResponse>("/doctors", {
    params,
  });

  return response.data;
}

export async function getDoctorById(id: string) {
  const response = await api.get<DoctorResponse>(
    `/doctors/${encodeURIComponent(id)}`,
  );

  return response.data;
}

export interface SpecializationOption {
  id: string;
  name: string;
  description: string | null;
}

export async function getSpecializations() {
  const response = await api.get<{
    status: "success";
    data: SpecializationOption[];
  }>("/doctors/specializations");

  return response.data;
}

export interface DoctorAvailabilityResponse {
  status: "success";
  data: {
    doctorFacilityId: string;
    date: string;
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
}

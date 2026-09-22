import { api, handleApiError } from "./api";
import type {
  AppointmentAvailabilityResponse,
  AppointmentListResponse,
  AppointmentResponse,
  AppointmentStatus,
} from "../types/appointment";

export interface GetAppointmentsParams {
  page?: number;
  limit?: number;
  status?: AppointmentStatus;
  from?: string;
  to?: string;
}

export async function getAppointments(params?: GetAppointmentsParams) {
  try {
    const response = await api.get<AppointmentListResponse>("/appointments/me", {
      params,
    });

    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export interface CreateAppointmentPayload {
  doctorFacilityId: string;
  appointmentType: string;
  appointmentModel: string;
  /**
   * `YYYY-MM-DD`. The backend validates the booking window,
   * leaves, availability and booking limits.
   */
  appointmentDate: string;
  reason?: string;
  patientNotes?: string;
}

export async function createAppointment(payload: CreateAppointmentPayload) {
  try {
    const response = await api.post<AppointmentResponse>(
      "/appointments",
      payload,
    );

    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function getAppointmentById(id: string) {
  try {
    const response = await api.get<AppointmentResponse>(
      `/appointments/${encodeURIComponent(id)}`,
    );

    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function cancelAppointment(id: string, reason: string) {
  try {
    const response = await api.patch<AppointmentResponse>(
      `/appointments/${encodeURIComponent(id)}/cancel`,
      { reason },
    );

    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function getAppointmentAvailability(doctorFacilityId: string) {
  try {
    const response = await api.get<AppointmentAvailabilityResponse>(
      `/appointments/availability/${encodeURIComponent(doctorFacilityId)}`,
    );

    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

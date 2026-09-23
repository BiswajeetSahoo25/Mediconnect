import type { DoctorFacility } from "../doctors/types";

/**
 * Mirrors the Prisma `AppointmentStatus` enum.
 */
export const APPOINTMENT_STATUSES = [
  "SCHEDULED",
  "COMPLETED",
  "CANCELLED",
  "RESCHEDULED",
  "NO_SHOW",
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

/**
 * Mirrors the Prisma `AppointmentType` enum.
 */
export const APPOINTMENT_TYPES = [
  "CONSULTATION",
  "FOLLOW_UP",
  "EMERGENCY",
  "ROUTINE",
  "SPECIALIZED",
] as const;

export type AppointmentType = (typeof APPOINTMENT_TYPES)[number];

/**
 * Mirrors the Prisma `AppointmentModel` enum.
 */
export const APPOINTMENT_MODELS = [
  "IN_PERSON",
  "VIDEO_CALL",
  "PHONE_CALL",
] as const;

export type AppointmentModel = (typeof APPOINTMENT_MODELS)[number];

export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  CONSULTATION: "Consultation",
  FOLLOW_UP: "Follow-up",
  EMERGENCY: "Emergency",
  ROUTINE: "Routine check-up",
  SPECIALIZED: "Specialized",
};

export const APPOINTMENT_MODEL_LABELS: Record<AppointmentModel, string> = {
  IN_PERSON: "In person",
  VIDEO_CALL: "Video call",
  PHONE_CALL: "Phone call",
};

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
  RESCHEDULED: "Rescheduled",
  NO_SHOW: "No show",
};

export interface AppointmentDoctorFacility {
  id: string;
  consultationFee: string;
  consultationMode: string;
  doctor: {
    id: string;
    firstName: string;
    lastName: string | null;
    specializations: Array<{
      specialization: {
        name: string;
      };
    }>;
  };
  facility: {
    id: string;
    name: string;
  };
  department: {
    name: string;
  };
}

export interface Appointment {
  id: string;
  patientId: string;
  doctorFacilityId: string;
  appointmentType: AppointmentType;
  appointmentModel: AppointmentModel;
  appointmentDate: string;
  queueNumber: number;
  status: AppointmentStatus;
  reason: string | null;
  patientNotes: string | null;
  isRescheduled: boolean;
  cancellationReason: string | null;
  cancellationTimestamp: string | null;
  createdAt: string;
  updatedAt: string;
  doctorFacility: AppointmentDoctorFacility;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AppointmentListResponse {
  status: "success";
  data: {
    items: Appointment[];
    pagination: Pagination;
  };
}

export interface AppointmentResponse {
  status: "success";
  data: Appointment;
}

/**
 * Response of `GET /appointments/availability/:doctorFacilityId`.
 * Only the next 7 bookable days are returned by the backend, already
 * filtered for leaves, closed days and exhausted booking limits.
 */
export interface AppointmentAvailabilityResponse {
  status: "success";
  data: {
    doctorFacilityId: string;
    onlineBookingEnabled: boolean;
    dates: Array<{
      date: string;
      windows: Array<{
        startTime: string;
        endTime: string;
      }>;
      remainingBookings: number | null;
    }>;
  };
}

/**
 * Booking draft handed over from the doctor profile page.
 */
export interface BookingDoctorContext {
  doctorId: string;
  doctorName: string;
  specialization: string | null;
  facilities: Pick<
    DoctorFacility,
    | "id"
    | "facilityName"
    | "facilityType"
    | "departmentName"
    | "consultationFee"
    | "consultationMode"
    | "onlineBookingEnabled"
  >[];
}

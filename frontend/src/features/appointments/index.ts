export {
  getAppointments,
  createAppointment,
  getAppointmentById,
  cancelAppointment,
  getAppointmentAvailability,
} from "./services/appointment.service";

export type {
  GetAppointmentsParams,
  CreateAppointmentPayload,
} from "./services/appointment.service";

export type {
  AppointmentStatus,
  AppointmentType,
  AppointmentModel,
  Appointment,
  Pagination,
  AppointmentListResponse,
  AppointmentResponse,
  AppointmentAvailabilityResponse,
  BookingDoctorContext,
} from "./types";

export {
  APPOINTMENT_STATUSES,
  APPOINTMENT_TYPES,
  APPOINTMENT_MODELS,
  APPOINTMENT_TYPE_LABELS,
  APPOINTMENT_MODEL_LABELS,
  APPOINTMENT_STATUS_LABELS,
} from "./types";

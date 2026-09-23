export {
  getDoctors,
  getDoctorById,
  getSpecializations,
  getDoctorAvailability,
} from "./services/doctor.service";

export type { SpecializationOption } from "./services/doctor.service";

export type {
  DoctorSpecialization,
  DoctorAvailability,
  DoctorFacility,
  Doctor,
  DoctorListResponse,
  DoctorResponse,
} from "./types";

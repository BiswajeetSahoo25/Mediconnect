export interface DoctorSpecialization {
  id: string;
  yearsInSpecialization: number | null;
  isPrimary: boolean;
  specialization: {
    id: string;
    name: string;
    description?: string | null;
    createdAt?: string;
    updatedAt?: string;
  };
}

export type DoctorLicenseStatus =
  | "PENDING"
  | "VERIFIED"
  | "EXPIRED"
  | "REVOKED"
  | "SUSPENDED";

export type DoctorApplicationStatus = DoctorLicenseStatus | null;
export interface DoctorAvailability {
  id: string;
  doctorFacilityId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export interface DoctorFacility {
  id: string;
  facilityId: string;
  facility: {
    id: string;
    name: string;
    timezone?: string;
  };
  departmentId: string;
  department: {
    id: string;
    name: string;
  };
  consultationFee: string;
  consultationMode: string;
  onlineBookingEnabled: boolean;
  onlineBookingLimit: number | null;
  joiningDate: string;
  availability?: DoctorAvailability[];
}

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string | null;

  licenseNumber: string;
  licenseAuthority: string | null;
  licenseVerificationStatus: string;

  yearsOfExperience: number | null;
  about: string | null;

  isActive: boolean;

  specializations: DoctorSpecialization[];
  facilities: DoctorFacility[];
}

export interface DoctorListResponse {
  status: "success";
  data: {
    items: Doctor[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface DoctorResponse {
  status: "success";
  data: Doctor;
}

export interface MyDoctorProfile {
  id: string;
  firstName: string;
  lastName: string | null;
  licenseNumber: string;
  licenseAuthority: string | null;
  licenseVerificationStatus: string;
  yearsOfExperience: number | null;
  about: string | null;
  isActive: boolean;
}

export interface DoctorPracticeWindowInput {
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface DoctorPracticeWindow extends DoctorPracticeWindowInput {
  id: string;
  isActive: boolean;
}

export interface DoctorPracticeFacility {
  id: string;
  facilityId: string;
  facility: DoctorFacility["facility"];
  departmentId: string;
  department: DoctorFacility["department"];
  consultationFee: string;
  consultationMode: string;
  onlineBookingEnabled: boolean;
  onlineBookingLimit: number | null;
  joiningDate: string;
  availability: DoctorPracticeWindow[];
}

export interface DoctorPracticeFacilityOption {
  id: string;
  name: string;
  timezone: string;
  departments: Array<{ id: string; name: string }>;
}

export interface MyDoctorPractice {
  facilities: DoctorPracticeFacilityOption[];
  assignments: DoctorPracticeFacility[];
}

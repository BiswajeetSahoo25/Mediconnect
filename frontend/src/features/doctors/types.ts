export interface DoctorSpecialization {
  id: string;
  name: string;
  yearsInSpecialization: number | null;
  isPrimary: boolean;
}
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
  facilityName: string;
  facilityType: string;
  departmentId: string;
  departmentName: string;
  consultationFee: string;
  consultationMode: string;
  onlineBookingEnabled: boolean;
  onlineBookingLimit: number | null;
  joiningDate: string;
  availability?: DoctorAvailability[];
}

export interface Doctor {
  id: string;
  userId: string;
  firstName: string;
  lastName: string | null;

  licenseNumber: string;
  licenseAuthority: string | null;
  licenseVerificationStatus: string;

  yearsOfExperience: number | null;
  about: string | null;

  isActive: boolean;
  createdAt: string;
  updatedAt: string;

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

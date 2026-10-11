import { LicenseStatus, Prisma, UserRole } from "../../generated/prisma/client.js";
import { prisma } from "../../config/prisma.js";
import { mapPrismaError } from "../../errors/error-mapper.js";
import { ConflictError, NotFoundError } from "../../errors/http-errors.js";

const publicDoctorFields = {
  id: true,
  firstName: true,
  lastName: true,
  licenseNumber: true,
  licenseAuthority: true,
  licenseVerificationStatus: true,
  yearsOfExperience: true,
  about: true,
  isActive: true,
  specializations: {
    select: {
      id: true,
      yearsInSpecialization: true,
      isPrimary: true,
      specialization: {
        select: { id: true, name: true, description: true },
      },
    },
  },
} satisfies Prisma.DoctorSelect;

const publicFacilityFilter = {
  isActive: true,
  facility: { isVerified: true, deletedAt: null },
};

const publicDoctorListSelect = {
  ...publicDoctorFields,
  facilities: {
    where: publicFacilityFilter,
    select: {
      id: true,
      facilityId: true,
      departmentId: true,
      consultationFee: true,
      consultationMode: true,
      onlineBookingEnabled: true,
      onlineBookingLimit: true,
      joiningDate: true,
      facility: { select: { id: true, name: true } },
      department: { select: { id: true, name: true } },
    },
  },
} satisfies Prisma.DoctorSelect;

const publicDoctorDetailSelect = {
  ...publicDoctorFields,
  facilities: {
    where: publicFacilityFilter,
    select: {
      id: true,
      facilityId: true,
      departmentId: true,
      consultationFee: true,
      consultationMode: true,
      onlineBookingEnabled: true,
      onlineBookingLimit: true,
      joiningDate: true,
      facility: { select: { id: true, name: true, timezone: true } },
      department: { select: { id: true, name: true } },
      availability: {
        where: { isActive: true },
        select: {
          id: true,
          doctorFacilityId: true,
          dayOfWeek: true,
          startTime: true,
          endTime: true,
          isActive: true,
        },
      },
    },
  },
} satisfies Prisma.DoctorSelect;

export class DoctorRepository {
  async findPendingApplications(skip: number, take: number) {
    const where: Prisma.DoctorWhereInput = {
      licenseVerificationStatus: LicenseStatus.PENDING,
      deletedAt: null,
      user: { isActive: true, deletedAt: null },
    };

    const [items, total] = await prisma.$transaction([
      prisma.doctor.findMany({
        where,
        select: {
          id: true,
          firstName: true,
          lastName: true,
          licenseNumber: true,
          licenseAuthority: true,
          licenseVerificationStatus: true,
          yearsOfExperience: true,
          about: true,
          createdAt: true,
          user: { select: { email: true, phone: true } },
          specializations: {
            select: {
              id: true,
              isPrimary: true,
              specialization: { select: { id: true, name: true } },
            },
          },
        },
        orderBy: { createdAt: "asc" },
        skip,
        take,
      }),
      prisma.doctor.count({ where }),
    ]);

    return { items, total };
  }

  async findMany(where: Prisma.DoctorWhereInput, skip: number, take: number) {
    const [doctors, total] = await prisma.$transaction([
      prisma.doctor.findMany({
        where,
        select: publicDoctorListSelect,
        orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
        skip,
        take,
      }),
      prisma.doctor.count({ where }),
    ]);

    return { doctors, total };
  }

  async findById(id: string) {
    return prisma.doctor.findFirst({
      where: { id, isActive: true, deletedAt: null },
      select: publicDoctorDetailSelect,
    });
  }

  async findPublicById(id: string) {
    return prisma.doctor.findFirst({
      where: {
        id,
        isActive: true,
        deletedAt: null,
        licenseVerificationStatus: LicenseStatus.VERIFIED,
        user: { isActive: true, deletedAt: null },
      },
      select: publicDoctorDetailSelect,
    });
  }
  
  async findByIdIncludingInactive(id: string) {
    return prisma.doctor.findFirst({
      where: {
        id,
        deletedAt: null,
      },
      include: {
        specializations: {
          include: {
            specialization: true,
          },
        },
        facilities: {
          where: {
            isActive: true,
          },
          include: {
            facility: true,
            department: true,
          },
        },
      },
    });
  }

  async findActiveFacilityAssignment(id: string) {
    return prisma.doctorFacility.findFirst({
      where: {
        id,
        isActive: true,
        doctor: {
          isActive: true,
          deletedAt: null,
          licenseVerificationStatus: LicenseStatus.VERIFIED,
          user: { isActive: true, deletedAt: null },
        },
        facility: { isVerified: true, deletedAt: null },
      },
      include: {
        facility: { select: { timezone: true } },
        availability: { where: { isActive: true } },
        leaves: { where: { isApproved: true } },
        doctor: {
          include: {
            leaves: { where: { isApproved: true } },
          },
        },
      },
    });
  }

  async getSpecializations() {
    return prisma.specialization.findMany({
      orderBy: { name: "asc" },
    });
  }

  async createApplication(data: Prisma.DoctorCreateInput) {
    try {
      return await prisma.doctor.create({ data });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async findByUserId(userId: string) {
    return prisma.doctor.findUnique({
      where: { userId },
    });
  }

  async findApplicationStatusByUserId(userId: string) {
    return prisma.doctor.findUnique({
      where: { userId },
      select: { licenseVerificationStatus: true },
    });
  }

  async update(id: string, data: Prisma.DoctorUpdateInput) {
    try {
      return await prisma.doctor.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }
  async approveDoctor(doctorId: string, adminUserId: string) {
    try {
      return await prisma.$transaction(async (tx) => {
        const doctor = await tx.doctor.findUnique({
          where: { id: doctorId },
          include: { user: true },
        });

        if (!doctor) {
          throw new NotFoundError("Doctor not found");
        }

        if (doctor.licenseVerificationStatus !== LicenseStatus.PENDING) {
          throw new ConflictError(
            "Doctor application has already been processed",
          );
        }

        if (
          doctor.deletedAt !== null ||
          !doctor.user.isActive ||
          doctor.user.deletedAt !== null ||
          doctor.user.role !== UserRole.PATIENT
        ) {
          throw new ConflictError(
            "This application is not eligible for approval",
          );
        }

        const now = new Date();

        const updateResult = await tx.doctor.updateMany({
          where: {
            id: doctorId,
            licenseVerificationStatus: LicenseStatus.PENDING,
            isActive: true,
            deletedAt: null,
            user: {
              role: UserRole.PATIENT,
              isActive: true,
              deletedAt: null,
            },
          },
          data: {
            licenseVerificationStatus: LicenseStatus.VERIFIED,
            licenseVerifiedAt: now,
            licenseVerifiedBy: adminUserId,
            updatedBy: adminUserId,
            isActive: true,
          },
        });

        if (updateResult.count !== 1) {
          throw new ConflictError(
            "Doctor application has already been processed",
          );
        }

        const roleUpdate = await tx.user.updateMany({
          where: {
            id: doctor.userId,
            role: UserRole.PATIENT,
            isActive: true,
            deletedAt: null,
          },
          data: {
            role: UserRole.DOCTOR,
          },
        });

        if (roleUpdate.count !== 1) {
          throw new ConflictError(
            "The applicant account changed before approval completed",
          );
        }

        return tx.doctor.findUniqueOrThrow({ where: { id: doctorId } });
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async revokeDoctor(doctorId: string, adminUserId: string, reason?: string) {
    try {
      return await prisma.$transaction(async (tx) => {
        const doctor = await tx.doctor.findUnique({
          where: { id: doctorId },
        });

        if (!doctor) {
          throw new NotFoundError("Doctor not found");
        }

        if (doctor.licenseVerificationStatus !== LicenseStatus.VERIFIED) {
          throw new ConflictError("Only a verified doctor can be revoked");
        }

        const updatedDoctor = await tx.doctor.update({
          where: { id: doctorId },
          data: {
            licenseVerificationStatus: LicenseStatus.REVOKED,
            verificationNotes: reason ?? doctor.verificationNotes,
            isActive: false,
            updatedBy: adminUserId,
          },
        });

        return updatedDoctor;
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }
  async reverifyDoctor(doctorId: string, adminUserId: string) {
    try {
      return await prisma.$transaction(async (tx) => {
        const doctor = await tx.doctor.findUnique({
          where: { id: doctorId },
        });

        if (!doctor) {
          throw new NotFoundError("Doctor not found");
        }

        if (doctor.licenseVerificationStatus !== LicenseStatus.REVOKED) {
          throw new ConflictError("Only a revoked doctor can be re-verified");
        }

        const updatedDoctor = await tx.doctor.update({
          where: { id: doctorId },
          data: {
            licenseVerificationStatus: LicenseStatus.VERIFIED,
            licenseVerifiedAt: new Date(),
            licenseVerifiedBy: adminUserId,
            isActive: true,
            updatedBy: adminUserId,
          },
        });

        return updatedDoctor;
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }
}

import { LicenseStatus, Prisma, UserRole } from "../generated/prisma/client.js";
import { prisma } from "../config/prisma.js";
import { mapPrismaError } from "../errors/error-mapper.js";
import { ConflictError, NotFoundError } from "../errors/http-errors.js";

export class DoctorRepository {
  async findMany(where: Prisma.DoctorWhereInput, skip: number, take: number) {
    const include = {
      specializations: { include: { specialization: true } },
      facilities: {
        where: { isActive: true },
        include: { facility: true, department: true },
      },
    } satisfies Prisma.DoctorInclude;

    const [doctors, total] = await prisma.$transaction([
      prisma.doctor.findMany({
        where,
        include,
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
      include: {
        specializations: { include: { specialization: true } },
        facilities: {
          where: { isActive: true },
          include: {
            facility: true,
            department: true,
            availability: { where: { isActive: true } },
          },
        },
      },
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
        doctor: { isActive: true, deletedAt: null },
      },
      include: {
        availability: { where: { isActive: true } },
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
        });

        if (!doctor) {
          throw new NotFoundError("Doctor not found");
        }

        if (doctor.licenseVerificationStatus !== LicenseStatus.PENDING) {
          throw new ConflictError(
            "Doctor application has already been processed",
          );
        }

        const now = new Date();

        const updatedDoctor = await tx.doctor.update({
          where: { id: doctorId },
          data: {
            licenseVerificationStatus: LicenseStatus.VERIFIED,
            licenseVerifiedAt: now,
            licenseVerifiedBy: adminUserId,
            updatedBy: adminUserId,
            isActive: true,
          },
        });

        await tx.user.update({
          where: { id: doctor.userId },
          data: {
            role: UserRole.DOCTOR,
          },
        });

        return updatedDoctor;
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

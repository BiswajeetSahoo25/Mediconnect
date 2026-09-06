import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../config/prisma.js";
import { mapPrismaError } from "../errors/error-mapper.js";

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

  async findActiveFacilityAssignment(id: string) {
    return prisma.doctorFacility.findFirst({
      where: {
        id,
        isActive: true,
        doctor: { isActive: true, deletedAt: null },
      },
      include: { availability: { where: { isActive: true } } },
    });
  }

  async findScheduledSlots(doctorFacilityId: string, appointmentDate: Date) {
    return prisma.appointment.findMany({
      where: { doctorFacilityId, appointmentDate, status: "SCHEDULED" },
      select: { startTime: true, endTime: true },
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
}

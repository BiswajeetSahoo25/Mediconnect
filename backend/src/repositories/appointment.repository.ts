import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../config/prisma.js";
import { mapPrismaError } from "../errors/error-mapper.js";

const appointmentInclude = {
  doctorFacility: {
    include: {
      doctor: {
        include: { specializations: { include: { specialization: true } } },
      },
      facility: true,
      department: true,
    },
  },
} satisfies Prisma.AppointmentInclude;

export class AppointmentRepository {
  async findPatientByUserId(userId: string) {
    return prisma.patient.findUnique({ where: { userId } });
  }

  async findActiveDoctorFacility(id: string) {
    return prisma.doctorFacility.findFirst({
      where: {
        id,
        isActive: true,
        doctor: { isActive: true, deletedAt: null },
      },
      include: { availability: { where: { isActive: true } } },
    });
  }

  async hasConflict(
    doctorFacilityId: string,
    appointmentDate: Date,
    startTime: Date,
    endTime: Date,
    excludeId?: string,
  ) {
    return prisma.appointment.findFirst({
      where: {
        doctorFacilityId,
        appointmentDate,
        status: "SCHEDULED",
        ...(excludeId ? { id: { not: excludeId } } : {}),
        startTime: { lt: endTime },
        endTime: { gt: startTime },
      },
      select: { id: true },
    });
  }

  async create(data: Prisma.AppointmentCreateInput) {
    try {
      return await prisma.appointment.create({ data, include: appointmentInclude });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async findByIdForPatient(id: string, patientId: string) {
    return prisma.appointment.findFirst({
      where: { id, patientId },
      include: appointmentInclude,
    });
  }

  async findManyForPatient(
    patientId: string,
    where: Prisma.AppointmentWhereInput,
    skip: number,
    take: number,
  ) {
    const scopedWhere: Prisma.AppointmentWhereInput = { patientId, ...where };
    const [appointments, total] = await prisma.$transaction([
      prisma.appointment.findMany({
        where: scopedWhere,
        include: appointmentInclude,
        orderBy: [{ appointmentDate: "desc" }, { startTime: "desc" }],
        skip,
        take,
      }),
      prisma.appointment.count({ where: scopedWhere }),
    ]);

    return { appointments, total };
  }

  async update(id: string, data: Prisma.AppointmentUpdateInput) {
    try {
      return await prisma.appointment.update({
        where: { id },
        data,
        include: appointmentInclude,
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }
}

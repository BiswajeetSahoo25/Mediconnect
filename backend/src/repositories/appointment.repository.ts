import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../config/prisma.js";
import { mapPrismaError } from "../errors/error-mapper.js";

const appointmentInclude = {
  doctorFacility: {
    include: {
      doctor: {
        include: {
          specializations: {
            include: {
              specialization: true,
            },
          },
        },
      },
      facility: true,
      department: true,
    },
  },
} satisfies Prisma.AppointmentInclude;

export class AppointmentRepository {
  async findPatientByUserId(userId: string) {
    return prisma.patient.findUnique({
      where: {
        userId,
      },
    });
  }

  async findActiveDoctorFacility(id: string) {
    return prisma.doctorFacility.findFirst({
      where: {
        id,
        isActive: true,
        doctor: {
          isActive: true,
          deletedAt: null,
          licenseVerificationStatus: "VERIFIED",
        },
        facility: {
          isVerified: true,
          deletedAt: null,
        },
      },
      include: {
        doctor: {
          include: {
            leaves: {
              where: {
                isApproved: true,
              },
            },
          },
        },
        facility: true,
        department: true,
        availability: {
          where: {
            isActive: true,
          },
          orderBy: {
            startTime: "asc",
          },
        },
        leaves: {
          where: {
            isApproved: true,
          },
        },
      },
    });
  }

  async findAppointmentsForDate(
    doctorFacilityId: string,
    appointmentDate: Date,
  ) {
    return prisma.appointment.findMany({
      where: {
        doctorFacilityId,
        appointmentDate,
      },
      orderBy: {
        queueNumber: "asc",
      },
    });
  }

  async getNextQueueNumber(doctorFacilityId: string, appointmentDate: Date) {
    return prisma.$transaction(async (tx) => {
      const counter = await tx.appointmentDailyCounter.upsert({
        where: {
          doctorFacilityId_appointmentDate: {
            doctorFacilityId,
            appointmentDate,
          },
        },
        create: {
          doctorFacility: {
            connect: {
              id: doctorFacilityId,
            },
          },
          appointmentDate,
          lastQueueNumber: 1,
        },
        update: {
          lastQueueNumber: {
            increment: 1,
          },
        },
      });

      return counter.lastQueueNumber;
    });
  }

  async create(data: Prisma.AppointmentCreateInput) {
    try {
      return await prisma.appointment.create({
        data,
        include: appointmentInclude,
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async findByIdForPatient(id: string, patientId: string) {
    return prisma.appointment.findFirst({
      where: {
        id,
        patientId,
      },
      include: appointmentInclude,
    });
  }

  async findManyForPatient(
    patientId: string,
    where: Prisma.AppointmentWhereInput,
    skip: number,
    take: number,
  ) {
    const scopedWhere: Prisma.AppointmentWhereInput = {
      patientId,
      ...where,
    };

    const [appointments, total] = await prisma.$transaction([
      prisma.appointment.findMany({
        where: scopedWhere,
        include: appointmentInclude,
        orderBy: [
          {
            appointmentDate: "desc",
          },
          {
            queueNumber: "desc",
          },
        ],
        skip,
        take,
      }),

      prisma.appointment.count({
        where: scopedWhere,
      }),
    ]);

    return {
      appointments,
      total,
    };
  }

  async update(id: string, data: Prisma.AppointmentUpdateInput) {
    try {
      return await prisma.appointment.update({
        where: {
          id,
        },
        data,
        include: appointmentInclude,
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  
  async findManyForDoctor(
    doctorUserId: string,
    where: Prisma.AppointmentWhereInput,
    skip: number,
    take: number,
  ) {
    const scopedWhere: Prisma.AppointmentWhereInput = {
      doctorFacility: {
        doctor: {
          userId: doctorUserId,
        },
      },
      ...where,
    };

    const [appointments, total] = await prisma.$transaction([
      prisma.appointment.findMany({
        where: scopedWhere,
        include: appointmentInclude,
        orderBy: [
          {
            appointmentDate: "desc",
          },
          {
            queueNumber: "asc",
          },
        ],
        skip,
        take,
      }),

      prisma.appointment.count({
        where: scopedWhere,
      }),
    ]);

    return {
      appointments,
      total,
    };
  }
}

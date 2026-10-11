import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../config/prisma.js";
import { mapPrismaError } from "../../errors/error-mapper.js";

import {
  ConflictError,
  NotFoundError,
} from "../../errors/http-errors.js";

function isUniqueConstraintError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;
  const value = error as {
    code?: unknown;
    message?: unknown;
    meta?: {
      code?: unknown;
      driverAdapterError?: {
        cause?: { code?: unknown; originalCode?: unknown; originalMessage?: unknown };
      };
    };
  };
  const cause = value.meta?.driverAdapterError?.cause;
  return (
    value.code === "P2002" ||
    value.code === "23505" ||
    value.meta?.code === "23505" ||
    cause?.code === "23505" ||
    cause?.originalCode === "23505" ||
    (typeof value.message === "string" &&
      value.message.includes("appointments_active_doctor_facility_start_at_key")) ||
    (typeof value.meta?.driverAdapterError?.cause?.originalMessage === "string" &&
      value.meta.driverAdapterError.cause.originalMessage.includes(
        "appointments_active_doctor_facility_start_at_key",
      ))
  );
}

function isTransactionConflictError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const value = error as {
    code?: unknown;
    meta?: {
      code?: unknown;
      driverAdapterError?: {
        cause?: { code?: unknown; originalCode?: unknown };
      };
    };
  };
  const cause = value.meta?.driverAdapterError?.cause;
  const databaseCodes = [value.code, value.meta?.code, cause?.code, cause?.originalCode];
  return (
    value.code === "P2034" ||
    databaseCodes.some((code) => code === "40001" || code === "40P01")
  );
}

function throwBookingConflictOrMappedError(error: unknown): never {
  if (isUniqueConstraintError(error)) {
    throw new ConflictError(
      "This appointment conflicts with another booking. Please select another time.",
    );
  }
  if (isTransactionConflictError(error)) {
    throw new ConflictError(
      "This booking conflicted with another request. Please try again.",
    );
  }
  throw mapPrismaError(error);
}

const appointmentInclude = {
  id: true,
  patientId: true,
  doctorFacilityId: true,
  appointmentType: true,
  appointmentModel: true,
  appointmentDate: true,
  appointmentStartAt: true,
  queueNumber: true,
  status: true,
  reason: true,
  patientNotes: true,
  isRescheduled: true,
  cancellationReason: true,
  cancellationTimestamp: true,
  createdAt: true,
  updatedAt: true,
  doctorFacility: {
    select: {
      id: true,
      consultationFee: true,
      consultationMode: true,
      doctor: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          specializations: {
            select: { specialization: { select: { name: true } } },
          },
        },
      },
      facility: { select: { id: true, name: true, timezone: true } },
      department: { select: { id: true, name: true } },
    },
  },
} satisfies Prisma.AppointmentSelect;

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
          user: { isActive: true, deletedAt: null },
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

  async findDoctorAppointmentsNearSlots(
    doctorId: string,
    startsAfter: Date,
    startsBefore: Date,
  ) {
    return prisma.appointment.findMany({
      where: {
        status: "SCHEDULED",
        appointmentStartAt: { gt: startsAfter, lt: startsBefore },
        doctorFacility: { doctorId },
      },
      select: { appointmentStartAt: true },
    });
  }

  async createBooking(input: {
    patientId: string;
    doctorId: string;
    doctorFacilityId: string;
    appointmentDate: Date;
    appointmentStartAt: Date;
    onlineBookingLimit: number | null;
    appointmentType: Prisma.AppointmentCreateInput["appointmentType"];
    appointmentModel: Prisma.AppointmentCreateInput["appointmentModel"];
    reason?: string;
    patientNotes?: string;
  }) {
    try {
      return await prisma.$transaction(async (tx) => {
        // A doctor may have multiple facility/department assignments. Lock the
        // owning doctor row so concurrent bookings cannot overlap across them.
        await tx.$queryRaw`
          SELECT "id"
          FROM "doctors"
          WHERE "id" = ${input.doctorId}::uuid
          FOR UPDATE
        `;

        const counter = await tx.appointmentDailyCounter.upsert({
          where: {
            doctorFacilityId_appointmentDate: {
              doctorFacilityId: input.doctorFacilityId,
              appointmentDate: input.appointmentDate,
            },
          },
          create: {
            doctorFacilityId: input.doctorFacilityId,
            appointmentDate: input.appointmentDate,
            lastQueueNumber: 0,
          },
          update: { lastQueueNumber: { increment: 0 } },
        });

        // Serialize bookings for this doctor/facility and local date. The lock
        // makes the capacity count and queue allocation part of one critical
        // section; the partial unique index remains the final slot guard.
        await tx.$queryRaw`
          SELECT "id"
          FROM "appointment_daily_counters"
          WHERE "doctor_facility_id" = ${input.doctorFacilityId}::uuid
            AND "appointment_date" = ${input.appointmentDate.toISOString().slice(0, 10)}::date
          FOR UPDATE
        `;

        const scheduledCount = await tx.appointment.count({
          where: {
            doctorFacilityId: input.doctorFacilityId,
            appointmentDate: input.appointmentDate,
            status: "SCHEDULED",
          },
        });
        if (
          input.onlineBookingLimit !== null &&
          scheduledCount >= input.onlineBookingLimit
        ) {
          throw new ConflictError(
            "Online booking limit has been reached for this date",
          );
        }

        const slotTaken = await tx.appointment.findFirst({
          where: {
            status: "SCHEDULED",
            appointmentStartAt: {
              gt: new Date(input.appointmentStartAt.getTime() - 30 * 60_000),
              lt: new Date(input.appointmentStartAt.getTime() + 30 * 60_000),
            },
            doctorFacility: { doctorId: input.doctorId },
          },
          select: { id: true },
        });
        if (slotTaken) {
          throw new ConflictError("This appointment slot is no longer available");
        }

        const highestQueue = await tx.appointment.aggregate({
          where: {
            doctorFacilityId: input.doctorFacilityId,
            appointmentDate: input.appointmentDate,
          },
          _max: { queueNumber: true },
        });
        const queueNumber =
          Math.max(counter.lastQueueNumber, highestQueue._max.queueNumber ?? 0) + 1;

        await tx.appointmentDailyCounter.update({
          where: { id: counter.id },
          data: { lastQueueNumber: queueNumber },
        });

        return tx.appointment.create({
          data: {
            patient: { connect: { id: input.patientId } },
            doctorFacility: { connect: { id: input.doctorFacilityId } },
            appointmentType: input.appointmentType,
            appointmentModel: input.appointmentModel,
            appointmentDate: input.appointmentDate,
            appointmentStartAt: input.appointmentStartAt,
            queueNumber,
            reason: input.reason,
            patientNotes: input.patientNotes,
          },
          select: appointmentInclude,
        });
      });
    } catch (error) {
      throwBookingConflictOrMappedError(error);
    }
  }

  async cancelIfScheduled(
    id: string,
    patientId: string,
    userId: string,
    reason: string,
  ) {
    try {
      return await prisma.$transaction(async (tx) => {
        const transition = await tx.appointment.updateMany({
          where: { id, patientId, status: "SCHEDULED" },
          data: {
            status: "CANCELLED",
            cancellationReason: reason,
            cancellationTimestamp: new Date(),
            cancelledBy: userId,
            updatedBy: userId,
          },
        });

        if (transition.count !== 1) {
          throw new ConflictError(
            "This appointment is no longer scheduled and cannot be cancelled",
          );
        }

        const appointment = await tx.appointment.findFirst({
          where: { id, patientId },
          select: appointmentInclude,
        });
        if (!appointment) throw new NotFoundError("Appointment not found");
        return appointment;
      });
    } catch (error) {
      throwBookingConflictOrMappedError(error);
    }
  }

  async findByIdForPatient(id: string, patientId: string) {
    return prisma.appointment.findFirst({
      where: {
        id,
        patientId,
      },
      select: appointmentInclude,
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
        select: appointmentInclude,
        orderBy: [
          {
            appointmentDate: "desc",
          },
          {
            appointmentStartAt: { sort: "desc", nulls: "last" },
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
        select: appointmentInclude,
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
        select: appointmentInclude,
        orderBy: [
          {
            appointmentDate: "desc",
          },
          {
            appointmentStartAt: { sort: "desc", nulls: "last" },
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

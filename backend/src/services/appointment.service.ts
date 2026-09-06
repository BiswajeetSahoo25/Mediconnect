import { Prisma } from "../generated/prisma/client.js";
import {
  BadRequestError,
  ConflictError,
  NotFoundError,
} from "../errors/http-errors.js";

import { AppointmentRepository } from "../repositories/appointment.repository.js";

import type {
  CancelAppointmentInput,
  CreateAppointmentInput,
  ListAppointmentsQuery,
} from "../validators/appointment.validator.js";

function startOfDay(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

function addDays(date: Date, days: number) {
  const result = new Date(date);
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function formatTime(time: Date) {
  return time.toISOString().slice(11, 16);
}

function isDateWithinBookingWindow(date: Date) {
  const today = startOfDay(new Date());
  const selectedDate = startOfDay(date);
  const lastBookableDate = addDays(today, 7);

  return selectedDate > today && selectedDate <= lastBookableDate;
}

function isDateOnLeave(
  doctorLeaves: Array<{
    startDate: Date;
    endDate: Date;
  }>,
  facilityLeaves: Array<{
    startDate: Date;
    endDate: Date;
  }>,
  date: Date,
) {
  const targetDate = startOfDay(date);

  return [...doctorLeaves, ...facilityLeaves].some((leave) => {
    const start = startOfDay(leave.startDate);
    const end = startOfDay(leave.endDate);

    return targetDate >= start && targetDate <= end;
  });
}

export class AppointmentService {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  private async getPatientId(userId: string) {
    const patient =
      await this.appointmentRepository.findPatientByUserId(userId);

    if (!patient) {
      throw new NotFoundError(
        "Complete your patient profile before booking an appointment",
      );
    }

    return patient.id;
  }

  private async getBookingAssignment(doctorFacilityId: string) {
    const assignment =
      await this.appointmentRepository.findActiveDoctorFacility(
        doctorFacilityId,
      );

    if (!assignment) {
      throw new NotFoundError("Doctor facility assignment not found");
    }

    if (!assignment.facility.isVerified) {
      throw new BadRequestError(
        "Appointments are not available for this facility",
      );
    }

    return assignment;
  }

  async getAvailability(doctorFacilityId: string) {
    const assignment = await this.getBookingAssignment(doctorFacilityId);

    if (!assignment.onlineBookingEnabled) {
      return {
        doctorFacilityId: assignment.id,
        onlineBookingEnabled: false,
        dates: [],
      };
    }

    const today = startOfDay(new Date());

    const dates: Array<{
      date: Date;
      windows: Array<{
        startTime: string;
        endTime: string;
      }>;
      remainingBookings: number | null;
    }> = [];

    for (let offset = 1; offset <= 7; offset++) {
      const date = addDays(today, offset);

      const onLeave = isDateOnLeave(
        assignment.doctor.leaves,
        assignment.leaves,
        date,
      );

      if (onLeave) {
        continue;
      }

      const dayOfWeek = date.getUTCDay();

      const windows = assignment.availability
        .filter((availability) => availability.dayOfWeek === dayOfWeek)
        .map((availability) => ({
          startTime: formatTime(availability.startTime),
          endTime: formatTime(availability.endTime),
        }));

      if (windows.length === 0) {
        continue;
      }

      let remainingBookings: number | null = null;

      if (assignment.onlineBookingLimit !== null) {
        const appointments =
          await this.appointmentRepository.findAppointmentsForDate(
            assignment.id,
            date,
          );

        const scheduledCount = appointments.filter(
          (appointment) => appointment.status === "SCHEDULED",
        ).length;

        remainingBookings = Math.max(
          assignment.onlineBookingLimit - scheduledCount,
          0,
        );

        if (remainingBookings === 0) {
          continue;
        }
      }

      dates.push({
        date,
        windows,
        remainingBookings,
      });
    }

    return {
      doctorFacilityId: assignment.id,
      onlineBookingEnabled: true,
      dates,
    };
  }

  async create(userId: string, input: CreateAppointmentInput) {
    const patientId = await this.getPatientId(userId);

    const assignment = await this.getBookingAssignment(input.doctorFacilityId);

    if (!assignment.onlineBookingEnabled) {
      throw new BadRequestError("Online booking is currently disabled");
    }

    const appointmentDate = startOfDay(input.appointmentDate);

    if (!isDateWithinBookingWindow(appointmentDate)) {
      throw new BadRequestError(
        "Appointments can only be booked for the next 7 days",
      );
    }

    const onLeave = isDateOnLeave(
      assignment.doctor.leaves,
      assignment.leaves,
      appointmentDate,
    );

    if (onLeave) {
      throw new BadRequestError(
        "The doctor is unavailable on the selected date",
      );
    }

    const dayOfWeek = appointmentDate.getUTCDay();

    const availability = assignment.availability.filter(
      (window) => window.dayOfWeek === dayOfWeek,
    );

    if (availability.length === 0) {
      throw new BadRequestError(
        "The doctor is not available on the selected date",
      );
    }

    if (assignment.onlineBookingLimit !== null) {
      const appointments =
        await this.appointmentRepository.findAppointmentsForDate(
          assignment.id,
          appointmentDate,
        );

      const scheduledCount = appointments.filter(
        (appointment) => appointment.status === "SCHEDULED",
      ).length;

      if (scheduledCount >= assignment.onlineBookingLimit) {
        throw new ConflictError(
          "Online booking limit has been reached for this date",
        );
      }
    }

    const queueNumber = await this.appointmentRepository.getNextQueueNumber(
      assignment.id,
      appointmentDate,
    );

    return this.appointmentRepository.create({
      patient: {
        connect: {
          id: patientId,
        },
      },

      doctorFacility: {
        connect: {
          id: assignment.id,
        },
      },

      appointmentType: input.appointmentType,

      appointmentModel: input.appointmentModel,

      appointmentDate,

      queueNumber,

      reason: input.reason,

      patientNotes: input.patientNotes,
    });
  }

  async getById(userId: string, appointmentId: string) {
    const patientId = await this.getPatientId(userId);

    const appointment = await this.appointmentRepository.findByIdForPatient(
      appointmentId,
      patientId,
    );

    if (!appointment) {
      throw new NotFoundError("Appointment not found");
    }

    return appointment;
  }

  async getMine(userId: string, query: ListAppointmentsQuery) {
    const patientId = await this.getPatientId(userId);

    const { page, limit, status, from, to } = query;

    const where: Prisma.AppointmentWhereInput = {
      ...(status ? { status } : {}),

      ...(from || to
        ? {
            appointmentDate: {
              ...(from
                ? {
                    gte: startOfDay(from),
                  }
                : {}),

              ...(to
                ? {
                    lte: startOfDay(to),
                  }
                : {}),
            },
          }
        : {}),
    };

    const { appointments, total } =
      await this.appointmentRepository.findManyForPatient(
        patientId,
        where,
        (page - 1) * limit,
        limit,
      );

    return {
      items: appointments,

      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async cancel(
    userId: string,
    appointmentId: string,
    input: CancelAppointmentInput,
  ) {
    const appointment = await this.getById(userId, appointmentId);

    if (appointment.status !== "SCHEDULED") {
      throw new BadRequestError("Only scheduled appointments can be cancelled");
    }

    return this.appointmentRepository.update(appointment.id, {
      status: "CANCELLED",

      cancellationReason: input.reason,

      cancellationTimestamp: new Date(),

      cancelledByUser: {
        connect: {
          id: userId,
        },
      },

      updatedByUser: {
        connect: {
          id: userId,
        },
      },
    });
  }

  async getDoctorAppointments(userId: string, query: ListAppointmentsQuery) {
    const { page, limit, status, from, to } = query;

    const where: Prisma.AppointmentWhereInput = {
      ...(status ? { status } : {}),

      ...(from || to
        ? {
            appointmentDate: {
              ...(from
                ? {
                    gte: startOfDay(from),
                  }
                : {}),

              ...(to
                ? {
                    lte: startOfDay(to),
                  }
                : {}),
            },
          }
        : {}),
    };

    const { appointments, total } =
      await this.appointmentRepository.findManyForDoctor(
        userId,
        where,
        (page - 1) * limit,
        limit,
      );

    return {
      items: appointments,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

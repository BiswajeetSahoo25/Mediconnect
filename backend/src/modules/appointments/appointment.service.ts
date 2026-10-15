import { Prisma } from "../../generated/prisma/client.js";
import {
  BadRequestError,
  NotFoundError,
} from "../../errors/http-errors.js";

import { AppointmentRepository } from "./appointment.repository.js";
import {
  addLocalDays,
  assertValidTimeZone,
  buildAppointmentSlots,
  getFacilityLocalDateTime,
  getFacilityBookingDateWindow,
  getWeekdayForLocalDate,
  localDateToDatabaseDate,
} from "./appointment-time.js";

import type {
  CancelAppointmentInput,
  CreateAppointmentInput,
  ListAppointmentsQuery,
} from "./appointment.validation.js";

function dateKeyForDatabaseDate(date: Date) {
  return date.toISOString().slice(0, 10);
}

function isDateOnLeave(
  doctorLeaves: Array<{ startDate: Date; endDate: Date }>,
  facilityLeaves: Array<{ startDate: Date; endDate: Date }>,
  date: string,
) {
  return [...doctorLeaves, ...facilityLeaves].some((leave) => {
    const start = dateKeyForDatabaseDate(leave.startDate);
    const end = dateKeyForDatabaseDate(leave.endDate);
    return date >= start && date <= end;
  });
}

function assertAppointmentModelAllowed(appointmentModel: string, consultationMode: string) {
  const supportedModels =
    consultationMode === "BOTH"
      ? ["IN_PERSON", "VIDEO_CALL", "PHONE_CALL"]
      : consultationMode === "ONLINE"
        ? ["VIDEO_CALL", "PHONE_CALL"]
        : consultationMode === "IN_PERSON" || consultationMode === "OFFLINE"
          ? ["IN_PERSON"]
          : null;

  if (!supportedModels) {
    throw new BadRequestError("This facility has an unsupported consultation mode");
  }
  if (!supportedModels.includes(appointmentModel)) {
    throw new BadRequestError(
      "The selected consultation mode is not available at this facility",
    );
  }
}

function startOfDay(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
}

export class AppointmentService {
  constructor(
    private readonly appointmentRepository: AppointmentRepository,
    private readonly now: () => Date = () => new Date(),
  ) {}

  private async getPatientId(userId: string) {
    const patient = await this.appointmentRepository.findPatientByUserId(userId);
    if (!patient) {
      throw new NotFoundError(
        "Complete your patient profile before booking an appointment",
      );
    }
    return patient.id;
  }

  private async getBookingAssignment(doctorFacilityId: string) {
    const assignment =
      await this.appointmentRepository.findActiveDoctorFacility(doctorFacilityId);
    if (!assignment) {
      throw new NotFoundError("Doctor facility assignment not found");
    }
    if (!assignment.facility.isVerified) {
      throw new BadRequestError("Appointments are not available for this facility");
    }
    assertValidTimeZone(assignment.facility.timezone);
    return assignment;
  }

  async getAvailability(doctorFacilityId: string) {
    const assignment = await this.getBookingAssignment(doctorFacilityId);
    if (!assignment.onlineBookingEnabled) {
      return {
        doctorFacilityId: assignment.id,
        onlineBookingEnabled: false,
        timezone: assignment.facility.timezone,
        dates: [],
      };
    }

    const now = this.now();
    const { today } = getFacilityBookingDateWindow(
      now,
      assignment.facility.timezone,
    );
    const dates: Array<{
      date: string;
      slots: Array<{ startAt: string; startTime: string; endTime: string }>;
      remainingBookings: number | null;
    }> = [];

    for (let offset = 1; offset <= 7; offset++) {
      const date = addLocalDays(today, offset);
      if (
        isDateOnLeave(assignment.doctor.leaves, assignment.leaves, date)
      ) {
        continue;
      }

      const weekday = getWeekdayForLocalDate(date);
      const windows = assignment.availability.filter(
        (window) => window.dayOfWeek === weekday,
      );
      if (windows.length === 0) continue;

      const appointmentDate = localDateToDatabaseDate(date);
      const appointments = await this.appointmentRepository.findAppointmentsForDate(
        assignment.id,
        appointmentDate,
      );
      const scheduled = appointments.filter(
        (appointment) => appointment.status === "SCHEDULED",
      );
      const remainingBookings =
        assignment.onlineBookingLimit === null
          ? null
          : Math.max(assignment.onlineBookingLimit - scheduled.length, 0);
      if (remainingBookings === 0) continue;

      const generatedSlots = buildAppointmentSlots(
        date,
        assignment.facility.timezone,
        windows,
        now,
      );
      if (generatedSlots.length === 0) continue;

      const existingDoctorBookings =
        await this.appointmentRepository.findDoctorAppointmentsNearSlots(
          assignment.doctorId,
          new Date(Date.parse(generatedSlots[0]!.startAt) - 30 * 60_000),
          new Date(
            Date.parse(generatedSlots[generatedSlots.length - 1]!.startAt) +
              30 * 60_000,
          ),
        );
      const existingStarts = existingDoctorBookings
        .map((appointment) => appointment.appointmentStartAt?.getTime())
        .filter((value): value is number => value !== undefined);
      const slots = generatedSlots.filter((slot) => {
        const start = Date.parse(slot.startAt);
        return existingStarts.every(
          (existingStart) => Math.abs(existingStart - start) >= 30 * 60_000,
        );
      });
      if (slots.length === 0) continue;

      dates.push({ date, slots, remainingBookings });
    }

    return {
      doctorFacilityId: assignment.id,
      onlineBookingEnabled: true,
      timezone: assignment.facility.timezone,
      dates,
    };
  }

  async create(userId: string, input: CreateAppointmentInput) {
    const patientId = await this.getPatientId(userId);
    const assignment = await this.getBookingAssignment(input.doctorFacilityId);
    if (!assignment.onlineBookingEnabled) {
      throw new BadRequestError("Online booking is currently disabled");
    }
    assertAppointmentModelAllowed(
      input.appointmentModel,
      assignment.consultationMode,
    );

    const now = this.now();
    const appointmentStartAt = input.appointmentStartAt;
    if (appointmentStartAt <= now) {
      throw new BadRequestError("The selected appointment time is in the past");
    }

    const localStart = getFacilityLocalDateTime(
      appointmentStartAt,
      assignment.facility.timezone,
    );
    const { today, lastDate } = getFacilityBookingDateWindow(
      now,
      assignment.facility.timezone,
    );
    if (localStart.date <= today || localStart.date > lastDate) {
      throw new BadRequestError(
        "Appointments can only be booked for the next 7 local days",
      );
    }
    if (
      isDateOnLeave(assignment.doctor.leaves, assignment.leaves, localStart.date)
    ) {
      throw new BadRequestError("The doctor is unavailable on the selected date");
    }

    const weekday = getWeekdayForLocalDate(localStart.date);
    const windows = assignment.availability.filter(
      (window) => window.dayOfWeek === weekday,
    );
    const validSlots = buildAppointmentSlots(
      localStart.date,
      assignment.facility.timezone,
      windows,
      new Date(0),
    );
    if (
      localStart.second !== 0 ||
      !validSlots.some((slot) => Date.parse(slot.startAt) === appointmentStartAt.getTime())
    ) {
      throw new BadRequestError("The selected time is not an available 30-minute slot");
    }
    const appointmentDate = localDateToDatabaseDate(localStart.date);
    return this.appointmentRepository.createBooking({
      patientId,
      doctorId: assignment.doctorId,
      doctorFacilityId: assignment.id,
      appointmentDate,
      appointmentStartAt,
      onlineBookingLimit: assignment.onlineBookingLimit,
      appointmentType: input.appointmentType,
      appointmentModel: input.appointmentModel,
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
    if (!appointment) throw new NotFoundError("Appointment not found");
    return appointment;
  }

  async getMine(userId: string, query: ListAppointmentsQuery) {
    const patientId = await this.getPatientId(userId);
    const { page, limit, status, from, to } = query;
    const where: Prisma.AppointmentWhereInput = {
      ...(status
        ? {
            status: Array.isArray(status) ? { in: status } : status,
          }
        : {}),
      ...(from || to
        ? {
            appointmentDate: {
              ...(from ? { gte: startOfDay(from) } : {}),
              ...(to ? { lte: startOfDay(to) } : {}),
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
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async cancel(
    userId: string,
    appointmentId: string,
    input: CancelAppointmentInput,
  ) {
    const appointment = await this.getById(userId, appointmentId);
    return this.appointmentRepository.cancelIfScheduled(
      appointment.id,
      appointment.patientId,
      userId,
      input.reason,
    );
  }

  async getDoctorAppointments(userId: string, query: ListAppointmentsQuery) {
    const { page, limit, status, from, to } = query;
    const where: Prisma.AppointmentWhereInput = {
      ...(status
        ? {
            status: Array.isArray(status) ? { in: status } : status,
          }
        : {}),
      ...(from || to
        ? {
            appointmentDate: {
              ...(from ? { gte: startOfDay(from) } : {}),
              ...(to ? { lte: startOfDay(to) } : {}),
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
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }
}

import { Prisma } from "../generated/prisma/client.js";
import { BadRequestError, ConflictError, NotFoundError } from "../errors/http-errors.js";
import { AppointmentRepository } from "../repositories/appointment.repository.js";
import type {
  CancelAppointmentInput,
  CreateAppointmentInput,
  ListAppointmentsQuery,
  RescheduleAppointmentInput,
} from "../validators/appointment.validator.js";

function toTime(time: string) {
  return new Date(`1970-01-01T${time}:00.000Z`);
}

function startOfDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function getDayOfWeek(date: Date) {
  return date.getUTCDay();
}

export class AppointmentService {
  constructor(private readonly appointmentRepository: AppointmentRepository) {}

  private async getPatientId(userId: string) {
    const patient = await this.appointmentRepository.findPatientByUserId(userId);
    if (!patient) {
      throw new NotFoundError("Complete your patient profile before booking an appointment");
    }
    return patient.id;
  }

  private async validateSchedule(
    doctorFacilityId: string,
    appointmentDate: Date,
    startTime: string,
    endTime: string,
    excludeAppointmentId?: string,
  ) {
    const normalizedDate = startOfDay(appointmentDate);
    if (normalizedDate < startOfDay(new Date())) {
      throw new BadRequestError("Appointments cannot be booked in the past");
    }

    const assignment = await this.appointmentRepository.findActiveDoctorFacility(doctorFacilityId);
    if (!assignment) {
      throw new NotFoundError("Doctor facility assignment not found");
    }

    const start = toTime(startTime);
    const end = toTime(endTime);
    const availability = assignment.availability.find(
      (slot) => {
        const slotDuration = slot.slotDurationMinutes * 60_000;
        return (
          slot.dayOfWeek === getDayOfWeek(normalizedDate) &&
          slot.startTime <= start &&
          slot.endTime >= end &&
          end.getTime() - start.getTime() === slotDuration &&
          (start.getTime() - slot.startTime.getTime()) % slotDuration === 0
        );
      },
    );

    if (!availability) {
      throw new BadRequestError("The selected time is not an available appointment slot");
    }

    const conflict = await this.appointmentRepository.hasConflict(
      doctorFacilityId,
      normalizedDate,
      start,
      end,
      excludeAppointmentId,
    );
    if (conflict) {
      throw new ConflictError("The selected appointment slot is no longer available");
    }

    return { appointmentDate: normalizedDate, startTime: start, endTime: end };
  }

  async create(userId: string, input: CreateAppointmentInput) {
    const patientId = await this.getPatientId(userId);
    const schedule = await this.validateSchedule(
      input.doctorFacilityId,
      input.appointmentDate,
      input.startTime,
      input.endTime,
    );

    return this.appointmentRepository.create({
      patient: { connect: { id: patientId } },
      doctorFacility: { connect: { id: input.doctorFacilityId } },
      appointmentType: input.appointmentType,
      reason: input.reason,
      patientNotes: input.patientNotes,
      ...schedule,
    });
  }

  async getById(userId: string, appointmentId: string) {
    const patientId = await this.getPatientId(userId);
    const appointment = await this.appointmentRepository.findByIdForPatient(appointmentId, patientId);
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
      ...((from || to)
        ? {
            appointmentDate: {
              ...(from ? { gte: startOfDay(from) } : {}),
              ...(to ? { lte: startOfDay(to) } : {}),
            },
          }
        : {}),
    };
    const { appointments, total } = await this.appointmentRepository.findManyForPatient(
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

  async cancel(userId: string, appointmentId: string, input: CancelAppointmentInput) {
    const appointment = await this.getById(userId, appointmentId);
    if (appointment.status !== "SCHEDULED") {
      throw new BadRequestError("Only scheduled appointments can be cancelled");
    }

    return this.appointmentRepository.update(appointment.id, {
      status: "CANCELLED",
      cancellationReason: input.reason,
      cancellationTimestamp: new Date(),
      cancelledByUser: { connect: { id: userId } },
      updatedByUser: { connect: { id: userId } },
    });
  }

  async reschedule(userId: string, appointmentId: string, input: RescheduleAppointmentInput) {
    const appointment = await this.getById(userId, appointmentId);
    if (appointment.status !== "SCHEDULED") {
      throw new BadRequestError("Only scheduled appointments can be rescheduled");
    }

    const schedule = await this.validateSchedule(
      appointment.doctorFacilityId,
      input.appointmentDate,
      input.startTime,
      input.endTime,
      appointment.id,
    );

    return this.appointmentRepository.update(appointment.id, {
      ...schedule,
      isRescheduled: true,
      updatedByUser: { connect: { id: userId } },
    });
  }
}

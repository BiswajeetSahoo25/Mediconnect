import { Prisma } from "../generated/prisma/client.js";
import { DoctorRepository } from "../repositories/doctor.repository.js";
import { BadRequestError, NotFoundError } from "../errors/http-errors.js";
import type { AvailableSlotsQuery, ListDoctorsQuery } from "../validators/doctor.validator.js";
import type { CreateDoctorApplicationInput } from "../validators/doctor-application.validator.js";

function startOfDay(date: Date) {
  return new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
}

function formatTime(time: Date) {
  return time.toISOString().slice(11, 16);
}

export class DoctorService {
  constructor(private readonly doctorRepository: DoctorRepository) {}

  async getDoctors(query: ListDoctorsQuery) {
    const { page, limit, specializationId, facilityId, search } = query;
    const where: Prisma.DoctorWhereInput = {
      isActive: true,
      deletedAt: null,
      ...(specializationId
        ? { specializations: { some: { specializationId } } }
        : {}),
      ...(facilityId
        ? { facilities: { some: { facilityId, isActive: true } } }
        : {}),
      ...(search
        ? {
            OR: [
              { firstName: { contains: search, mode: "insensitive" } },
              { lastName: { contains: search, mode: "insensitive" } },
              { licenseNumber: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const { doctors, total } = await this.doctorRepository.findMany(
      where,
      (page - 1) * limit,
      limit,
    );

    return {
      items: doctors,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getDoctor(id: string) {
    return this.doctorRepository.findById(id);
  }

  async getSpecializations() {
    return this.doctorRepository.getSpecializations();
  }

  async createApplication(userId: string, input: CreateDoctorApplicationInput) {
    return this.doctorRepository.createApplication({
      user: { connect: { id: userId } },
      firstName: input.firstName,
      lastName: input.lastName,
      licenseNumber: input.licenseNumber,
      licenseAuthority: input.licenseAuthority,
      yearsOfExperience: input.yearsOfExperience,
      about: input.about,
    });
  }

  async getAvailableSlots(doctorId: string, query: AvailableSlotsQuery) {
    const date = startOfDay(query.date);
    if (date < startOfDay(new Date())) {
      throw new BadRequestError("Availability cannot be requested for a past date");
    }

    const assignment = await this.doctorRepository.findActiveFacilityAssignment(
      query.doctorFacilityId,
    );
    if (!assignment || assignment.doctorId !== doctorId) {
      throw new NotFoundError("Doctor facility assignment not found");
    }

    const bookedSlots = await this.doctorRepository.findScheduledSlots(
      assignment.id,
      date,
    );
    const dayOfWeek = date.getUTCDay();
    const slots = assignment.availability
      .filter((availability) => availability.dayOfWeek === dayOfWeek)
      .flatMap((availability) => {
        const result: Array<{ startTime: string; endTime: string }> = [];
        const duration = availability.slotDurationMinutes * 60_000;

        for (
          let start = availability.startTime.getTime();
          start + duration <= availability.endTime.getTime();
          start += duration
        ) {
          const end = start + duration;
          const isBooked = bookedSlots.some(
            (booked) => booked.startTime.getTime() < end && booked.endTime.getTime() > start,
          );
          if (!isBooked) {
            result.push({
              startTime: formatTime(new Date(start)),
              endTime: formatTime(new Date(end)),
            });
          }
        }
        return result;
      });

    return { doctorFacilityId: assignment.id, date, slots };
  }
}

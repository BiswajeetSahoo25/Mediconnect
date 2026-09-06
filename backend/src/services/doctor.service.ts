import { Prisma } from "../generated/prisma/client.js";
import { DoctorRepository } from "../repositories/doctor.repository.js";
import { BadRequestError, NotFoundError } from "../errors/http-errors.js";
import type {
  ApplyDoctorInput,
  AvailableSlotsQuery,
  ListDoctorsQuery,
  UpdateDoctorProfileInput,
} from "../validators/doctor.validator.js";

function startOfDay(date: Date) {
  return new Date(
    Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()),
  );
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
        ? {
            specializations: {
              some: { specializationId },
            },
          }
        : {}),
      ...(facilityId
        ? {
            facilities: {
              some: {
                facilityId,
                isActive: true,
              },
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              {
                firstName: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                lastName: {
                  contains: search,
                  mode: "insensitive",
                },
              },
              {
                licenseNumber: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    };

    const { doctors, total } =
      await this.doctorRepository.findMany(
        where,
        (page - 1) * limit,
        limit,
      );

    return {
      items: doctors,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getDoctor(id: string) {
    const doctor = await this.doctorRepository.findById(id);

    if (!doctor) {
      throw new NotFoundError("Doctor not found");
    }

    return doctor;
  }

  async getSpecializations() {
    return this.doctorRepository.getSpecializations();
  }

  async createApplication(
    userId: string,
    input: ApplyDoctorInput,
  ) {
    const existingDoctor =
      await this.doctorRepository.findByUserId(userId);

    if (existingDoctor) {
      throw new BadRequestError(
        "Doctor profile already exists for this user",
      );
    }

    return this.doctorRepository.createApplication({
      user: {
        connect: { id: userId },
      },
      firstName: input.firstName,
      lastName: input.lastName,
      licenseNumber: input.licenseNumber,
      licenseAuthority: input.licenseAuthority,
      yearsOfExperience: input.yearsOfExperience,
      about: input.about,
    });
  }

  async getAvailableSlots(
    doctorId: string,
    query: AvailableSlotsQuery,
  ) {
    const date = startOfDay(query.date);
    const today = startOfDay(new Date());

    if (date <= today) {
      throw new BadRequestError(
        "Availability cannot be requested for today or a past date",
      );
    }

    const assignment =
      await this.doctorRepository.findActiveFacilityAssignment(
        query.doctorFacilityId,
      );

    if (!assignment || assignment.doctorId !== doctorId) {
      throw new NotFoundError(
        "Doctor facility assignment not found",
      );
    }

    const dayOfWeek = date.getUTCDay();

    const windows = assignment.availability
      .filter(
        (availability) =>
          availability.dayOfWeek === dayOfWeek,
      )
      .map((availability) => ({
        startTime: formatTime(availability.startTime),
        endTime: formatTime(availability.endTime),
      }));

    return {
      doctorFacilityId: assignment.id,
      date,
      windows,
      onlineBookingEnabled:
        assignment.onlineBookingEnabled,
      onlineBookingLimit:
        assignment.onlineBookingLimit,
    };
  }

  async getMyDoctorProfile(userId: string) {
    const doctor =
      await this.doctorRepository.findByUserId(userId);

    if (!doctor) {
      throw new NotFoundError("Doctor profile not found");
    }

    return doctor;
  }

  async updateMyDoctorProfile(
    userId: string,
    data: UpdateDoctorProfileInput,
  ) {
    const doctor =
      await this.doctorRepository.findByUserId(userId);

    if (!doctor) {
      throw new NotFoundError("Doctor profile not found");
    }

    const updateData: Prisma.DoctorUpdateInput = {};

    if (data.firstName !== undefined) {
      updateData.firstName = data.firstName;
    }

    if (data.lastName !== undefined) {
      updateData.lastName = data.lastName;
    }

    if (data.yearsOfExperience !== undefined) {
      updateData.yearsOfExperience =
        data.yearsOfExperience;
    }

    if (data.about !== undefined) {
      updateData.about = data.about;
    }

    return this.doctorRepository.update(
      doctor.id,
      updateData,
    );
  }
}
import { Prisma } from "../generated/prisma/client.js";
import { PatientRepository } from "../repositories/patient.repository.js";
import type { UpdatePatientInput } from "../validators/patient.validator.js";

export class PatientService {
  constructor(
    private readonly patientRepository: PatientRepository,
  ) {}

  async getPatient(userId: string) {
    return this.patientRepository.findByUserId(userId);
  }

  async updatePatient(
    userId: string,
    data: UpdatePatientInput,
  ) {
    const createData: Prisma.PatientCreateInput = {
      user: {
        connect: {
          id: userId,
        },
      },
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      bloodGroup: data.bloodGroup,
    };

    const updateData: Prisma.PatientUpdateInput = {
      firstName: data.firstName,
      lastName: data.lastName,
      dateOfBirth: data.dateOfBirth,
      gender: data.gender,
      bloodGroup: data.bloodGroup,
    };

    return this.patientRepository.upsertByUserId(
      userId,
      createData,
      updateData,
    );
  }
}
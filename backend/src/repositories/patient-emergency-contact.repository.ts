import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../config/prisma.js";
import { mapPrismaError } from "../errors/error-mapper.js";

export class PatientEmergencyContactRepository {
  async findByPatientId(patientId: string) {
    return prisma.patientEmergencyContact.findMany({
      where: { patientId },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async findById(id: string) {
    return prisma.patientEmergencyContact.findUnique({
      where: { id },
    });
  }

  async countByPatientId(patientId: string) {
    return prisma.patientEmergencyContact.count({
      where: { patientId },
    });
  }

  async create(
    data: Prisma.PatientEmergencyContactCreateInput,
  ) {
    try {
      return await prisma.patientEmergencyContact.create({
        data,
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async update(
    id: string,
    data: Prisma.PatientEmergencyContactUpdateInput,
  ) {
    try {
      return await prisma.patientEmergencyContact.update({
        where: { id },
        data,
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async delete(id: string) {
    try {
      return await prisma.patientEmergencyContact.delete({
        where: { id },
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }
}
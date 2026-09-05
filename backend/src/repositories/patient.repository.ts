import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../config/prisma.js";
import { mapPrismaError } from "../errors/error-mapper.js";

export class PatientRepository {
  async findByUserId(userId: string) {
    return prisma.patient.findUnique({
      where: { userId },
    });
  }

  async upsertByUserId(
    userId: string,
    createData: Prisma.PatientCreateInput,
    updateData: Prisma.PatientUpdateInput,
  ) {
    try {
      return await prisma.patient.upsert({
        where: { userId },
        create: createData,
        update: updateData,
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }
}
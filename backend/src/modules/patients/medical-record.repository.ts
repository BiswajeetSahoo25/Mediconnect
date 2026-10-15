import { Prisma } from "../../generated/prisma/client.js";
import { prisma } from "../../config/prisma.js";
import { mapPrismaError } from "../../errors/error-mapper.js";

const medicalRecordListSelect = {
  id: true,
  patientId: true,
  appointmentId: true,
  documentType: true,
  fileName: true,
  fileUrl: true,
  fileSize: true,
  mimeType: true,
  isVerified: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.MedicalDocumentSelect;

export class MedicalRecordRepository {
  async findManyByPatientId(patientId: string) {
    return prisma.medicalDocument.findMany({
      where: { patientId },
      select: medicalRecordListSelect,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
    });
  }

  async create(data: Prisma.MedicalDocumentCreateInput) {
    try {
      return await prisma.medicalDocument.create({
        data,
        select: medicalRecordListSelect,
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async findFileById(id: string, patientId: string) {
    return prisma.medicalDocument.findFirst({
      where: { id, patientId },
      select: {
        id: true,
        fileName: true,
        mimeType: true,
        fileData: true,
      },
    });
  }

  async deleteOwned(id: string, patientId: string, userId: string) {
    try {
      return await prisma.medicalDocument.deleteMany({
        where: { id, patientId, uploadedBy: userId, isVerified: false },
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async findByIdForOwner(id: string, patientId: string, userId: string) {
    return prisma.medicalDocument.findFirst({
      where: { id, patientId, uploadedBy: userId },
      select: { id: true, isVerified: true },
    });
  }
}

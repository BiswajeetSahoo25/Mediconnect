import { randomUUID } from "node:crypto";
import { Prisma } from "../../generated/prisma/client.js";
import { BadRequestError, NotFoundError } from "../../errors/http-errors.js";
import { PatientRepository } from "./patient.repository.js";
import { MedicalRecordRepository } from "./medical-record.repository.js";
import {
  MAX_MEDICAL_RECORD_BYTES,
  type CreateMedicalRecordInput,
} from "./medical-record.validation.js";

function matchesFileSignature(data: Buffer, mimeType: string) {
  if (mimeType === "application/pdf") {
    return data.subarray(0, 5).toString("ascii") === "%PDF-";
  }
  if (mimeType === "image/jpeg") {
    return data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff;
  }
  if (mimeType === "image/png") {
    return data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  }
  return (
    mimeType === "image/webp" &&
    data.length >= 12 &&
    data.subarray(0, 4).toString("ascii") === "RIFF" &&
    data.subarray(8, 12).toString("ascii") === "WEBP"
  );
}

export class MedicalRecordService {
  constructor(
    private readonly patientRepository: PatientRepository,
    private readonly medicalRecordRepository: MedicalRecordRepository,
  ) {}

  private async getPatientId(userId: string) {
    const patient = await this.patientRepository.findByUserId(userId);
    if (!patient) throw new NotFoundError("Patient not found");
    return patient.id;
  }

  async list(userId: string) {
    const patientId = await this.getPatientId(userId);
    return this.medicalRecordRepository.findManyByPatientId(patientId);
  }

  async create(userId: string, input: CreateMedicalRecordInput) {
    const patientId = await this.getPatientId(userId);
    const fileData = Buffer.from(input.contentBase64, "base64");

    if (
      fileData.length === 0 ||
      fileData.length > MAX_MEDICAL_RECORD_BYTES ||
      fileData.toString("base64") !== input.contentBase64
    ) {
      throw new BadRequestError("The file is empty, too large, or invalid");
    }
    if (!matchesFileSignature(fileData, input.mimeType)) {
      throw new BadRequestError("The selected file does not match its file type");
    }

    const id = randomUUID();
    const fileUrl = `/api/v1/patients/me/medical-records/${id}/file`;
    const data: Prisma.MedicalDocumentCreateInput = {
      id,
      patient: { connect: { id: patientId } },
      uploadedByUser: { connect: { id: userId } },
      documentType: input.documentType,
      fileName: input.fileName,
      fileUrl,
      fileData,
      fileSize: fileData.length,
      mimeType: input.mimeType,
    };

    return this.medicalRecordRepository.create(data);
  }

  async getFile(userId: string, id: string) {
    const patientId = await this.getPatientId(userId);
    const record = await this.medicalRecordRepository.findFileById(id, patientId);
    if (!record || !record.fileData) throw new NotFoundError("Medical record not found");
    return record;
  }

  async delete(userId: string, id: string) {
    const patientId = await this.getPatientId(userId);
    const record = await this.medicalRecordRepository.findByIdForOwner(
      id,
      patientId,
      userId,
    );
    if (!record) throw new NotFoundError("Medical record not found");
    if (record.isVerified) {
      throw new BadRequestError("Verified medical records cannot be deleted");
    }

    const result = await this.medicalRecordRepository.deleteOwned(
      id,
      patientId,
      userId,
    );
    if (result.count !== 1) {
      throw new BadRequestError("This medical record can no longer be deleted");
    }
  }
}

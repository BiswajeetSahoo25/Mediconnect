import type { Request, Response } from "express";
import { NotFoundError, UnauthorizedError } from "../../errors/http-errors.js";
import { PatientRepository } from "./patient.repository.js";
import { MedicalRecordRepository } from "./medical-record.repository.js";
import { MedicalRecordService } from "./medical-record.service.js";
import type {
  CreateMedicalRecordInput,
  MedicalRecordIdInput,
} from "./medical-record.validation.js";

const defaultMedicalRecordService = new MedicalRecordService(
  new PatientRepository(),
  new MedicalRecordRepository(),
);

export class MedicalRecordController {
  constructor(
    private readonly medicalRecordService = defaultMedicalRecordService,
  ) {}

  async list(req: Request, res: Response) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedError("Authentication required");

    const records = await this.medicalRecordService.list(userId);
    res.status(200).json({ status: "success", data: records });
  }

  async create(req: Request, res: Response) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedError("Authentication required");

    const input = req.validated.body as CreateMedicalRecordInput;
    const record = await this.medicalRecordService.create(userId, input);
    res.status(201).json({ status: "success", data: record });
  }

  async download(req: Request, res: Response) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedError("Authentication required");

    const { id } = req.validated.params as MedicalRecordIdInput;
    const record = await this.medicalRecordService.getFile(userId, id);
    if (!record.fileData) throw new NotFoundError("Medical record not found");
    const fileName = record.fileName.replace(/[\r\n"\\]/g, "_");
    const fileData = Buffer.from(record.fileData);

    res
      .status(200)
      .set({
        "Content-Type": record.mimeType ?? "application/octet-stream",
        "Content-Disposition": `attachment; filename*=UTF-8''${encodeURIComponent(fileName)}`,
        "Content-Length": String(fileData.length),
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      })
      .send(fileData);
  }

  async delete(req: Request, res: Response) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedError("Authentication required");

    const { id } = req.validated.params as MedicalRecordIdInput;
    await this.medicalRecordService.delete(userId, id);
    res.status(200).json({
      status: "success",
      message: "Medical record deleted successfully",
    });
  }
}

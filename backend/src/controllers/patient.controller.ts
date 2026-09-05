import type { Request, Response } from "express";
import { PatientService } from "../services/patient.service.js";
import { PatientRepository } from "../repositories/patient.repository.js";
import type { UpdatePatientInput } from "../validators/patient.validator.js";
import { UnauthorizedError, NotFoundError } from "../errors/http-errors.js";

const patientService = new PatientService(
  new PatientRepository(),
);

export class PatientController {
  async getPatient(req: Request, res: Response) {
    const userId = req.user?.sub;

    if (!userId) {
      throw new UnauthorizedError("Authentication required");
    }

    const patient = await patientService.getPatient(userId);

    if (!patient) {
      throw new NotFoundError("Patient not found");
    }

    res.status(200).json({
      status: "success",
      data: patient,
    });
  }

  async updatePatient(req: Request, res: Response) {
    const userId = req.user?.sub;

    if (!userId) {
      throw new UnauthorizedError("Authentication required");
    }

    const data = req.validated.body as UpdatePatientInput;

    const patient = await patientService.updatePatient(
      userId,
      data,
    );

    res.status(200).json({
      status: "success",
      data: patient,
    });
  }
}
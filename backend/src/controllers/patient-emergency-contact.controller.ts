import type { Request, Response } from "express";

import { PatientRepository } from "../repositories/patient.repository.js";
import { PatientEmergencyContactRepository } from "../repositories/patient-emergency-contact.repository.js";
import { PatientEmergencyContactService } from "../services/patient-emergency-contact.service.js";

import type {
  CreateEmergencyContactInput,
  UpdateEmergencyContactInput,
  EmergencyContactIdInput,
} from "../validators/patient-emergency-contact.validator.js";

import { UnauthorizedError } from "../errors/http-errors.js";

const patientService = new PatientEmergencyContactService(
  new PatientRepository(),
  new PatientEmergencyContactRepository(),
);

export class PatientEmergencyContactController {
  async getContacts(req: Request, res: Response) {
    const userId = req.user?.sub;

    if (!userId) {
      throw new UnauthorizedError("Authentication required");
    }

    const contacts = await patientService.getContacts(userId);

    res.status(200).json({
      status: "success",
      data: contacts,
    });
  }

  async createContact(req: Request, res: Response) {
    const userId = req.user?.sub;

    if (!userId) {
      throw new UnauthorizedError("Authentication required");
    }

    const data = req.validated.body as CreateEmergencyContactInput;

    const contact = await patientService.createContact(
      userId,
      data,
    );

    res.status(201).json({
      status: "success",
      data: contact,
    });
  }

  async updateContact(req: Request, res: Response) {
    const userId = req.user?.sub;

    if (!userId) {
      throw new UnauthorizedError("Authentication required");
    }

    const { id } = req.validated.params as EmergencyContactIdInput;

    const data = req.validated.body as UpdateEmergencyContactInput;

    const contact = await patientService.updateContact(
      userId,
      id,
      data,
    );

    res.status(200).json({
      status: "success",
      data: contact,
    });
  }

  async deleteContact(req: Request, res: Response) {
    const userId = req.user?.sub;

    if (!userId) {
      throw new UnauthorizedError("Authentication required");
    }

    const { id } = req.validated.params as EmergencyContactIdInput;

    await patientService.deleteContact(userId, id);

    res.status(200).json({
      status: "success",
      message: "Emergency contact deleted successfully",
    });
  }
}
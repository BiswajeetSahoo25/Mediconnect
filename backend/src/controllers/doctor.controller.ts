import type { Request, Response } from "express";

import { NotFoundError } from "../errors/http-errors.js";
import { DoctorRepository } from "../repositories/doctor.repository.js";
import { DoctorService } from "../services/doctor.service.js";
import type {
  AvailableSlotsQuery,
  DoctorIdInput,
  ListDoctorsQuery,
} from "../validators/doctor.validator.js";
import type { CreateDoctorApplicationInput } from "../validators/doctor-application.validator.js";
import { UnauthorizedError } from "../errors/http-errors.js";

const doctorService = new DoctorService(new DoctorRepository());

export class DoctorController {
  async getDoctors(req: Request, res: Response) {
    const query = req.validated.query as ListDoctorsQuery;
    const result = await doctorService.getDoctors(query);

    return res.status(200).json({ status: "success", data: result });
  }

  async getDoctor(req: Request, res: Response) {
    const { id } = req.validated.params as DoctorIdInput;
    const doctor = await doctorService.getDoctor(id);

    if (!doctor) {
      throw new NotFoundError("Doctor not found");
    }

    return res.status(200).json({ status: "success", data: doctor });
  }

  async getSpecializations(_req: Request, res: Response) {
    const specializations = await doctorService.getSpecializations();
    return res.status(200).json({ status: "success", data: specializations });
  }

  async getAvailableSlots(req: Request, res: Response) {
    const { id } = req.validated.params as DoctorIdInput;
    const slots = await doctorService.getAvailableSlots(
      id,
      req.validated.query as AvailableSlotsQuery,
    );
    return res.status(200).json({ status: "success", data: slots });
  }

  async createApplication(req: Request, res: Response) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedError("Authentication required");
    const application = await doctorService.createApplication(
      userId,
      req.validated.body as CreateDoctorApplicationInput,
    );
    return res.status(201).json({ status: "success", data: application });
  }
}

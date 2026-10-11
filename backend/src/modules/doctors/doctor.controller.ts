import type { Request, Response } from "express";

import { UnauthorizedError } from "../../errors/http-errors.js";

import { DoctorRepository } from "./doctor.repository.js";
import { DoctorService } from "./doctor.service.js";

import type {
  ApplyDoctorInput,
  AvailableSlotsQuery,
  DoctorIdInput,
  ListDoctorsQuery,
  PendingApplicationsQuery,
  RevokeDoctorInput,
  UpdateDoctorProfileInput,
} from "./doctor.validation.js";

const doctorService = new DoctorService(new DoctorRepository());

export class DoctorController {
  async getDoctors(req: Request, res: Response) {
    const query = req.validated.query as ListDoctorsQuery;

    const result = await doctorService.getDoctors(query);

    return res.status(200).json({
      status: "success",
      data: result,
    });
  }

  async getPendingApplications(req: Request, res: Response) {
    const result = await doctorService.getPendingApplications(
      req.validated.query as PendingApplicationsQuery,
    );

    return res.status(200).json({ status: "success", data: result });
  }

  async getDoctor(req: Request, res: Response) {
    const { id } = req.validated.params as DoctorIdInput;

    const doctor = await doctorService.getDoctor(id);

    return res.status(200).json({
      status: "success",
      data: doctor,
    });
  }

  async getSpecializations(_req: Request, res: Response) {
    const specializations = await doctorService.getSpecializations();

    return res.status(200).json({
      status: "success",
      data: specializations,
    });
  }

  async getAvailableSlots(req: Request, res: Response) {
    const { id } = req.validated.params as DoctorIdInput;

    const availability = await doctorService.getAvailableSlots(
      id,
      req.validated.query as AvailableSlotsQuery,
    );

    return res.status(200).json({
      status: "success",
      data: availability,
    });
  }

  async createApplication(req: Request, res: Response) {
    const userId = req.user?.sub;

    if (!userId) {
      throw new UnauthorizedError("Authentication required");
    }

    const application = await doctorService.createApplication(
      userId,
      req.validated.body as ApplyDoctorInput,
    );

    return res.status(201).json({
      status: "success",
      data: application,
    });
  }

  async getMyDoctorProfile(req: Request, res: Response) {
    const userId = req.user?.sub;

    if (!userId) {
      throw new UnauthorizedError("Authentication required");
    }

    const doctor = await doctorService.getMyDoctorProfile(userId);

    return res.status(200).json({
      status: "success",
      data: doctor,
    });
  }

  async getMyApplicationStatus(req: Request, res: Response) {
    const userId = req.user?.sub;

    if (!userId) {
      throw new UnauthorizedError("Authentication required");
    }

    const status = await doctorService.getMyApplicationStatus(userId);

    return res.status(200).json({
      status: "success",
      data: status,
    });
  }

  async updateMyDoctorProfile(req: Request, res: Response) {
    const userId = req.user?.sub;

    if (!userId) {
      throw new UnauthorizedError("Authentication required");
    }

    const data = req.validated.body as UpdateDoctorProfileInput;

    const doctor = await doctorService.updateMyDoctorProfile(userId, data);

    return res.status(200).json({
      status: "success",
      data: doctor,
    });
  }

  async approveDoctor(req: Request, res: Response) {
    const { id: doctorId } = req.validated.params as DoctorIdInput;
    const adminUserId = req.user?.sub;

    if (!adminUserId) {
      throw new UnauthorizedError();
    }

    const doctor = await doctorService.approveDoctor(doctorId, adminUserId);

    return res.status(200).json({
      status: "success",
      data: doctor,
    });
  }

  async revokeDoctor(req: Request, res: Response) {
    const { id: doctorId } = req.validated.params as DoctorIdInput;
    const adminUserId = req.user?.sub;

    if (!adminUserId) {
      throw new UnauthorizedError("Authentication required");
    }

    const { reason } = req.validated.body as RevokeDoctorInput;

    const doctor = await doctorService.revokeDoctor(
      doctorId,
      adminUserId,
      reason,
    );

    return res.status(200).json({
      status: "success",
      data: doctor,
    });
  }
  
  async reverifyDoctor(req: Request, res: Response) {
    const { id: doctorId } = req.validated.params as DoctorIdInput;
    const adminUserId = req.user?.sub;

    if (!adminUserId) {
      throw new UnauthorizedError("Authentication required");
    }

    const doctor = await doctorService.reverifyDoctor(doctorId, adminUserId);

    return res.status(200).json({
      status: "success",
      data: doctor,
    });
  }
}

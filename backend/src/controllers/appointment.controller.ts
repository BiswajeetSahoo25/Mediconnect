import type { Request, Response } from "express";

import { UnauthorizedError } from "../errors/http-errors.js";
import { AppointmentRepository } from "../repositories/appointment.repository.js";
import { AppointmentService } from "../services/appointment.service.js";
import type {
  AppointmentIdInput,
  CancelAppointmentInput,
  CreateAppointmentInput,
  ListAppointmentsQuery,
  RescheduleAppointmentInput,
} from "../validators/appointment.validator.js";

const appointmentService = new AppointmentService(new AppointmentRepository());

export class AppointmentController {
  private getUserId(req: Request) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedError("Authentication required");
    return userId;
  }

  async create(req: Request, res: Response) {
    const appointment = await appointmentService.create(
      this.getUserId(req),
      req.validated.body as CreateAppointmentInput,
    );
    return res.status(201).json({ status: "success", data: appointment });
  }

  async getMine(req: Request, res: Response) {
    const appointments = await appointmentService.getMine(
      this.getUserId(req),
      req.validated.query as ListAppointmentsQuery,
    );
    return res.status(200).json({ status: "success", data: appointments });
  }

  async getById(req: Request, res: Response) {
    const { id } = req.validated.params as AppointmentIdInput;
    const appointment = await appointmentService.getById(this.getUserId(req), id);
    return res.status(200).json({ status: "success", data: appointment });
  }

  async cancel(req: Request, res: Response) {
    const { id } = req.validated.params as AppointmentIdInput;
    const appointment = await appointmentService.cancel(
      this.getUserId(req),
      id,
      req.validated.body as CancelAppointmentInput,
    );
    return res.status(200).json({ status: "success", data: appointment });
  }

  async reschedule(req: Request, res: Response) {
    const { id } = req.validated.params as AppointmentIdInput;
    const appointment = await appointmentService.reschedule(
      this.getUserId(req),
      id,
      req.validated.body as RescheduleAppointmentInput,
    );
    return res.status(200).json({ status: "success", data: appointment });
  }
}

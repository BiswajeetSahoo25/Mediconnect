import { Router } from "express";

import { AppointmentController } from "../controllers/appointment.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

import {
  appointmentIdSchema,
  cancelAppointmentSchema,
  createAppointmentSchema,
  listAppointmentsQuerySchema,
} from "../validators/appointment.validator.js";

const router = Router();

const appointmentController = new AppointmentController();

router.use(requireAuth);

router.get(
  "/me",
  validate({ query: listAppointmentsQuerySchema }),
  appointmentController.getMine.bind(appointmentController),
);

router.post(
  "/",
  validate({ body: createAppointmentSchema }),
  appointmentController.create.bind(appointmentController),
);

router.get(
  "/:id",
  validate({ params: appointmentIdSchema }),
  appointmentController.getById.bind(appointmentController),
);

router.patch(
  "/:id/cancel",
  validate({
    params: appointmentIdSchema,
    body: cancelAppointmentSchema,
  }),
  appointmentController.cancel.bind(appointmentController),
);

export default router;

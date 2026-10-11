import { Router } from "express";

import { UserRole } from "../../generated/prisma/client.js";

import { AppointmentController } from "./appointment.controller.js";

import { requireAuth } from "../../middleware/auth.middleware.js";
import { requireRole } from "../../middleware/role.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { requireVerifiedDoctor } from "../../middleware/verified-doctor.middleware.js";

import {
  appointmentIdSchema,
  cancelAppointmentSchema,
  createAppointmentSchema,
  doctorFacilityIdSchema,
  listAppointmentsQuerySchema,
} from "./appointment.validation.js";

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

// Bookable dates + time windows for a doctor facility assignment
// (respects availability, leaves, booking window and booking limits).
// Registered before "/:id" so "availability" is not treated as an id.
router.get(
  "/availability/:doctorFacilityId",
  validate({ params: doctorFacilityIdSchema }),
  appointmentController.getAvailability.bind(appointmentController),
);

// Doctor's own appointments
router.get(
  "/doctor/me",
  requireRole(UserRole.DOCTOR),
  requireVerifiedDoctor,
  validate({ query: listAppointmentsQuerySchema }),
  appointmentController.getDoctorAppointments.bind(appointmentController),
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

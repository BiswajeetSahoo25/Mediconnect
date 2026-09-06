import { Router } from "express";

import { DoctorController } from "../controllers/doctor.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

import {
  applyDoctorSchema,
  availableSlotsQuerySchema,
  doctorIdSchema,
  listDoctorsQuerySchema,
  updateDoctorProfileSchema,
} from "../validators/doctor.validator.js";

const router = Router();

const doctorController = new DoctorController();

// Public doctor discovery
router.get(
  "/",
  validate({ query: listDoctorsQuerySchema }),
  doctorController.getDoctors.bind(doctorController),
);

// Public specializations
router.get(
  "/specializations",
  doctorController.getSpecializations.bind(doctorController),
);

// Authenticated doctor's own profile
router.get(
  "/me",
  requireAuth,
  doctorController.getMyDoctorProfile.bind(doctorController),
);

router.patch(
  "/me",
  requireAuth,
  validate({ body: updateDoctorProfileSchema }),
  doctorController.updateMyDoctorProfile.bind(doctorController),
);

// Doctor application
router.post(
  "/apply",
  requireAuth,
  validate({ body: applyDoctorSchema }),
  doctorController.createApplication.bind(doctorController),
);

// Public doctor details
router.get(
  "/:id",
  validate({ params: doctorIdSchema }),
  doctorController.getDoctor.bind(doctorController),
);

// Public doctor availability
router.get(
  "/:id/available-slots",
  validate({
    params: doctorIdSchema,
    query: availableSlotsQuerySchema,
  }),
  doctorController.getAvailableSlots.bind(doctorController),
);

export default router;
import { Router } from "express";

import { UserRole } from "../generated/prisma/client.js";

import { DoctorController } from "../controllers/doctor.controller.js";

import { requireAuth } from "../middleware/auth.middleware.js";
import { requireRole } from "../middleware/role.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

import {
  applyDoctorSchema,
  availableSlotsQuerySchema,
  doctorIdSchema,
  listDoctorsQuerySchema,
  revokeDoctorSchema,
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

// Admin-only doctor application approval
router.patch(
  "/applications/:id/approve",
  requireAuth,
  requireRole(UserRole.ADMIN),
  validate({ params: doctorIdSchema }),
  doctorController.approveDoctor.bind(doctorController),
);

// Admin-only doctor application revocation
router.patch(
  "/applications/:id/revoke",
  requireAuth,
  requireRole(UserRole.ADMIN),
  validate({
    params: doctorIdSchema,
    body: revokeDoctorSchema,
  }),
  doctorController.revokeDoctor.bind(doctorController),
);

// Admin-only doctor re-verification
router.patch(
  "/applications/:id/reverify",
  requireAuth,
  requireRole(UserRole.ADMIN),
  validate({ params: doctorIdSchema }),
  doctorController.reverifyDoctor.bind(doctorController),
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

import { Router } from "express";

import { UserRole } from "../../generated/prisma/client.js";

import { DoctorController } from "./doctor.controller.js";

import { requireAuth } from "../../middleware/auth.middleware.js";
import { requireRole } from "../../middleware/role.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { requireVerifiedDoctor } from "../../middleware/verified-doctor.middleware.js";

import {
  applyDoctorSchema,
  availableSlotsQuerySchema,
  createDoctorPracticeFacilitySchema,
  doctorFacilityAssignmentIdSchema,
  doctorIdSchema,
  listDoctorsQuerySchema,
  pendingApplicationsQuerySchema,
  revokeDoctorSchema,
  updateDoctorPracticeFacilitySchema,
  updateDoctorProfileSchema,
  updateDoctorSpecializationsSchema,
} from "./doctor.validation.js";

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

// Admin-only pending doctor application queue.
router.get(
  "/applications",
  requireAuth,
  requireRole(UserRole.ADMIN),
  validate({ query: pendingApplicationsQuerySchema }),
  doctorController.getPendingApplications.bind(doctorController),
);

// Authenticated doctor's own profile
router.get(
  "/application/me",
  requireAuth,
  doctorController.getMyApplicationStatus.bind(doctorController),
);

router.get(
  "/me",
  requireAuth,
  requireRole(UserRole.DOCTOR),
  requireVerifiedDoctor,
  doctorController.getMyDoctorProfile.bind(doctorController),
);

router.patch(
  "/me",
  requireAuth,
  requireRole(UserRole.DOCTOR),
  requireVerifiedDoctor,
  validate({ body: updateDoctorProfileSchema }),
  doctorController.updateMyDoctorProfile.bind(doctorController),
);

router.get(
  "/me/practice",
  requireAuth,
  requireRole(UserRole.DOCTOR),
  requireVerifiedDoctor,
  doctorController.getMyPractice.bind(doctorController),
);

router.post(
  "/me/practice/facilities",
  requireAuth,
  requireRole(UserRole.DOCTOR),
  requireVerifiedDoctor,
  validate({ body: createDoctorPracticeFacilitySchema }),
  doctorController.addMyPracticeFacility.bind(doctorController),
);

router.patch(
  "/me/practice/facilities/:doctorFacilityId",
  requireAuth,
  requireRole(UserRole.DOCTOR),
  requireVerifiedDoctor,
  validate({
    params: doctorFacilityAssignmentIdSchema,
    body: updateDoctorPracticeFacilitySchema,
  }),
  doctorController.updateMyPracticeFacility.bind(doctorController),
);

router.put(
  "/me/specializations",
  requireAuth,
  requireRole(UserRole.DOCTOR),
  requireVerifiedDoctor,
  validate({ body: updateDoctorSpecializationsSchema }),
  doctorController.updateMySpecializations.bind(doctorController),
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
  requireRole(UserRole.PATIENT),
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

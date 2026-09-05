import { Router } from "express";

import { PatientEmergencyContactController } from "../controllers/patient-emergency-contact.controller.js";

import { validate } from "../middleware/validate.middleware.js";

import {
  createEmergencyContactSchema,
  updateEmergencyContactSchema,
  emergencyContactIdSchema,
} from "../validators/patient-emergency-contact.validator.js";

import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

const emergencyContactController =
  new PatientEmergencyContactController();

router.get(
  "/",
  requireAuth,
  emergencyContactController.getContacts.bind(
    emergencyContactController,
  ),
);

router.post(
  "/",
  requireAuth,
  validate({
    body: createEmergencyContactSchema,
  }),
  emergencyContactController.createContact.bind(
    emergencyContactController,
  ),
);

router.patch(
  "/:id",
  requireAuth,
  validate({
    params: emergencyContactIdSchema,
    body: updateEmergencyContactSchema,
  }),
  emergencyContactController.updateContact.bind(
    emergencyContactController,
  ),
);

router.delete(
  "/:id",
  requireAuth,
  validate({
    params: emergencyContactIdSchema,
  }),
  emergencyContactController.deleteContact.bind(
    emergencyContactController,
  ),
);

export default router;
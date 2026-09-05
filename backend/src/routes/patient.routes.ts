import { Router } from "express";
import { PatientController } from "../controllers/patient.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { updatePatientSchema } from "../validators/patient.validator.js";
import { requireAuth } from "../middleware/auth.middleware.js";

const router = Router();

const patientController = new PatientController();

router.get(
  "/me",
  requireAuth,
  patientController.getPatient.bind(patientController),
);

router.patch(
  "/me",
  requireAuth,
  validate({
    body: updatePatientSchema,
  }),
  patientController.updatePatient.bind(patientController),
);

export default router;

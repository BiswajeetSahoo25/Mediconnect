import { Router } from "express";
import { requireAuth } from "../../middleware/auth.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { MedicalRecordController } from "./medical-record.controller.js";
import {
  createMedicalRecordSchema,
  medicalRecordIdSchema,
} from "./medical-record.validation.js";

const router = Router();
const medicalRecordController = new MedicalRecordController();

router.use(requireAuth);

router.get("/", medicalRecordController.list.bind(medicalRecordController));

router.post(
  "/",
  validate({ body: createMedicalRecordSchema }),
  medicalRecordController.create.bind(medicalRecordController),
);

router.get(
  "/:id/file",
  validate({ params: medicalRecordIdSchema }),
  medicalRecordController.download.bind(medicalRecordController),
);

router.delete(
  "/:id",
  validate({ params: medicalRecordIdSchema }),
  medicalRecordController.delete.bind(medicalRecordController),
);

export default router;

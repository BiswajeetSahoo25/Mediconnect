import { Router } from "express";

import { DoctorController } from "../controllers/doctor.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { createDoctorApplicationSchema } from "../validators/doctor-application.validator.js";

const router = Router();
const doctorController = new DoctorController();

router.post(
  "/",
  requireAuth,
  validate({ body: createDoctorApplicationSchema }),
  doctorController.createApplication.bind(doctorController),
);

export default router;

import { Router } from "express";

import { DoctorController } from "../controllers/doctor.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  availableSlotsQuerySchema,
  doctorIdSchema,
  listDoctorsQuerySchema,
} from "../validators/doctor.validator.js";

const router = Router();
const doctorController = new DoctorController();

router.get("/", validate({ query: listDoctorsQuerySchema }), doctorController.getDoctors.bind(doctorController));
router.get("/:id/available-slots", validate({ params: doctorIdSchema, query: availableSlotsQuerySchema }), doctorController.getAvailableSlots.bind(doctorController));
router.get("/:id", validate({ params: doctorIdSchema }), doctorController.getDoctor.bind(doctorController));

export default router;

import { Router } from "express";

import { DoctorController } from "./doctor.controller.js";

const router = Router();
const doctorController = new DoctorController();

router.get("/", doctorController.getSpecializations.bind(doctorController));

export default router;

import { Router } from "express";

import medicineController from "../controllers/medicine.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import {
  listMedicinesQuerySchema,
  medicineIdSchema,
} from "../validators/medicine.validator.js";

const router = Router();

router.get(
  "/",
  validate({ query: listMedicinesQuerySchema }),
  medicineController.getMedicines.bind(medicineController),
);

router.get(
  "/:id",
  validate({ params: medicineIdSchema }),
  medicineController.getMedicineById.bind(medicineController),
);

export default router;

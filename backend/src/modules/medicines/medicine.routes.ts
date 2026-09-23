import { Router } from "express";

import medicineController from "./medicine.controller.js";
import { validate } from "../../middleware/validate.middleware.js";
import {
  listMedicinesQuerySchema,
  medicineIdSchema,
} from "./medicine.validation.js";

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

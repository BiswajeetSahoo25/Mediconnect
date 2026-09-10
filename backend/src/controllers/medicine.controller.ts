import type { NextFunction, Request, Response } from "express";

import medicineService from "../services/medicine.service.js";

import type { ListMedicinesQuery, MedicineIdInput } from "../validators/medicine.validator.js";

export class MedicineController {
  async getMedicines(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.validated.query as ListMedicinesQuery;

      const result = await medicineService.searchMedicines(query);

      return res.status(200).json({
        success: true,
        data: result.data,
        pagination: result.pagination,
      });
    } catch (error) {
      next(error);
    }
  }

  async getMedicineById(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.validated.params as MedicineIdInput;

      const medicine = await medicineService.getMedicineById(id);

      return res.status(200).json({
        success: true,
        data: medicine,
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new MedicineController();

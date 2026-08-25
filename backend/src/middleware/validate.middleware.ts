import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";

type ValidationSchemas = {
  body?: ZodType;
  params?: ZodType;
  query?: ZodType;
};

export function validate(schemas: ValidationSchemas) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);

      if (!result.success) {
        res.status(400).json({
          status: "error",
          message: "Invalid request body",
          errors: result.error.issues,
        });
        return;
      }
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);

      if (!result.success) {
        res.status(400).json({
          status: "error",
          message: "Invalid request parameters",
          errors: result.error.issues,
        });
        return;
      }
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);

      if (!result.success) {
        res.status(400).json({
          status: "error",
          message: "Invalid query parameters",
          errors: result.error.issues,
        });
        return;
      }
    }

    next();
  };
}

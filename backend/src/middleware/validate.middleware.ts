import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { ValidationError } from "../errors/http-errors.js";

type ValidationSchemas<TBody = unknown, TParams = unknown, TQuery = unknown> = {
  body?: ZodType<TBody>;
  params?: ZodType<TParams>;
  query?: ZodType<TQuery>;
};

export function validate<TBody = unknown, TParams = unknown, TQuery = unknown>(
  schemas: ValidationSchemas<TBody, TParams, TQuery>,
) {
  return (req: Request, _res: Response, next: NextFunction) => {
    req.validated = {};

    if (schemas.body) {
      const result = schemas.body.safeParse(req.body);

      if (!result.success) {
        throw new ValidationError("Invalid request body", result.error.issues);
      }

      req.validated.body = result.data;
    }

    if (schemas.params) {
      const result = schemas.params.safeParse(req.params);

      if (!result.success) {
        throw new ValidationError(
          "Invalid request parameters",
          result.error.issues,
        );
      }

      req.validated.params = result.data;
    }

    if (schemas.query) {
      const result = schemas.query.safeParse(req.query);

      if (!result.success) {
        throw new ValidationError(
          "Invalid query parameters",
          result.error.issues,
        );
      }

      req.validated.query = result.data;
    }

    next();
  };
}

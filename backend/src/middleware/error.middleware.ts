import type { NextFunction, Request, Response } from "express";
import { AppError } from "../errors/app-error.js";
import { ValidationError } from "../errors/http-errors.js";

export function errorMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof ValidationError) {
    res.status(error.statusCode).json({
      status: "error",
      message: error.message,
      errors: error.errors,
    });
    return;
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      status: "error",
      message: error.message,
    });
    return;
  }

  console.error(error);

  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
}
import type { NextFunction, Request, Response } from "express";

import { AppError } from "../errors/app-error.js";

export function errorMiddleware(
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      status: "error",
      message: error.message,
      details: error.details,
    });

    return;
  }

  console.error(error);

  res.status(500).json({
    status: "error",
    message: "Internal server error",
    // error : error
  });
}

import type { NextFunction, Request, Response } from "express";

import { AppError } from "../errors/app-error.js";

export function errorMiddleware(
  error: unknown,
  req: Request,
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

  if (error instanceof Error) {
    console.error("Unhandled request error", {
      method: req.method,
      path: req.path,
      errorName: error.name,
      message: error.message,
      stack: error.stack,
    });
  } else {
    const thrownType =
      error === null ? "null" : Array.isArray(error) ? "array" : typeof error;

    console.error("Unhandled non-Error value", {
      method: req.method,
      path: req.path,
      errorName: "NonErrorThrownValue",
      message: `Non-Error thrown value (type: ${thrownType})`,
    });
  }

  res.status(500).json({
    status: "error",
    message: "Internal server error",
  });
}

import type { Request, Response, NextFunction } from "express";

import { NotFoundError } from "../errors/http-errors.js";

export function notFoundMiddleware(
  _req: Request,
  _res: Response,
  next: NextFunction,
) {
  next(new NotFoundError("Route not found"));
}
import type { Request, Response, NextFunction } from "express";

import { UserRole } from "../generated/prisma/client.js";
import { ForbiddenError, UnauthorizedError } from "../errors/http-errors.js";

export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new UnauthorizedError();
    }

    const userRole = req.user.role;

    if (
      typeof userRole !== "string" ||
      !allowedRoles.includes(userRole as UserRole)
    ) {
      throw new ForbiddenError();
    }

    next();
  };
}

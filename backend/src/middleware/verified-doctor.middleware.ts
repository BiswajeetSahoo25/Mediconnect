import type { Request, Response, NextFunction } from "express";
import { LicenseStatus } from "../generated/prisma/client.js";
import { prisma } from "../config/prisma.js";
import { ForbiddenError, UnauthorizedError } from "../errors/http-errors.js";

export async function requireVerifiedDoctor(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const userId = req.user?.sub;

  if (typeof userId !== "string") {
    throw new UnauthorizedError();
  }

  const doctor = await prisma.doctor.findUnique({
    where: { userId },
    select: {
      isActive: true,
      deletedAt: true,
      licenseVerificationStatus: true,
      user: { select: { isActive: true, deletedAt: true } },
    },
  });

  if (
    !doctor ||
    !doctor.isActive ||
    doctor.deletedAt !== null ||
    doctor.licenseVerificationStatus !== LicenseStatus.VERIFIED ||
    !doctor.user.isActive ||
    doctor.user.deletedAt !== null
  ) {
    throw new ForbiddenError("An active, verified doctor account is required");
  }

  next();
}

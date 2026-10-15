import type { Request, Response, NextFunction } from "express";
import { LicenseStatus } from "../generated/prisma/client.js";
import { prisma } from "../config/prisma.js";
import { ForbiddenError, UnauthorizedError } from "../errors/http-errors.js";

type DoctorEligibility = {
  isActive: boolean;
  deletedAt: Date | null;
  licenseVerificationStatus: string;
  user: { isActive: boolean; deletedAt: Date | null };
};

export function createRequireVerifiedDoctor(
  findDoctor: (userId: string) => Promise<DoctorEligibility | null>,
) {
  return async function requireVerifiedDoctor(
    req: Request,
    _res: Response,
    next: NextFunction,
  ) {
    const userId = req.user?.sub;

    if (typeof userId !== "string") {
      throw new UnauthorizedError();
    }

    const doctor = await findDoctor(userId);

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
  };
}

export const requireVerifiedDoctor = createRequireVerifiedDoctor((userId) =>
  prisma.doctor.findUnique({
    where: { userId },
    select: {
      isActive: true,
      deletedAt: true,
      licenseVerificationStatus: true,
      user: { select: { isActive: true, deletedAt: true } },
    },
  }),
);

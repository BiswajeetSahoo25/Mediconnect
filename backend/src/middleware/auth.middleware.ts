import type { Request, Response, NextFunction } from "express";

import { UnauthorizedError } from "../errors/http-errors.js";
import { verifyAccessToken } from "../auth/utils/access-token.js";

export async function requireAuth(
  req: Request,
  _res: Response,
  next: NextFunction,
) {
  const accessToken = req.cookies.accessToken;

  if (!accessToken) {
    throw new UnauthorizedError();
  }

  try {
    const payload = await verifyAccessToken(accessToken);

    req.user = payload;

    next();
  } catch (error) {
    throw new UnauthorizedError();
  }
}

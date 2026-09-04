import "express";
import type { JWTPayload } from "jose";

declare global {
  namespace Express {
    interface Request {
      validated: {
        body?: unknown;
        params?: unknown;
        query?: unknown;
      };
    }
  }
}

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

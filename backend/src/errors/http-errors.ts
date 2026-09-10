import { AppError } from "./app-error.js";

export class BadRequestError extends AppError {
  constructor(message = "Bad request", details: unknown | null = null) {
    super(message, 400, true, details);
    this.name = "BadRequestError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", details: unknown | null = null) {
    super(message, 404, true, details);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(
    message = "Resource already exists",
    fields: string[] | null = null,
  ) {
    super(message, 409, true, fields === null ? null : { fields });

    this.name = "ConflictError";
  }
}

export class ValidationError extends AppError {
  constructor(message = "Validation failed", errors: unknown | null = null) {
    super(message, 400, true, errors === null ? null : { errors });

    this.name = "ValidationError";
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Invalid credentials") {
    super(message, 401);
    this.name = "UnauthorizedError";
  }
}
export class ForbiddenError extends AppError {
  constructor(message = "Forbidden") {
    super(message, 403);
  }
}
export class ServiceError extends AppError {
  constructor(
    message = "Service unavailable",
    statusCode = 503,
    cause: Error | null = null,
  ) {
    super(message, statusCode, true);
    this.name = "ServiceError";
    if (cause) {
      this.stack = cause.stack;
    }
  }
}

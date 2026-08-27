import { AppError } from "./app-error.js";

export class BadRequestError extends AppError {
  constructor(message = "Bad request") {
    super(message, 400);
    this.name = "BadRequestError";
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found") {
    super(message, 404);
    this.name = "NotFoundError";
  }
}

export class ConflictError extends AppError {
  constructor(message = "Resource already exists") {
    super(message, 409);
    this.name = "ConflictError";
  }
}

export class ValidationError extends AppError {
  public readonly errors: unknown;

  constructor(message = "Validation failed", errors: unknown = []) {
    super(message, 400);
    this.name = "ValidationError";
    this.errors = errors;
  }
}
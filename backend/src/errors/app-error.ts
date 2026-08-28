export class AppError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details: unknown | null;

  constructor(
    message: string,
    statusCode: number,
    isOperational = true,
    details: unknown | null = null,
  ) {
    super(message);

    this.name = "AppError";
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.details = details;

    Error.captureStackTrace(this, this.constructor);
  }
}
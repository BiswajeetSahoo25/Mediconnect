import { ConflictError } from "./http-errors.js";

type PrismaErrorLike = {
  code?: unknown;
  meta?: {
    driverAdapterError?: {
      cause?: {
        constraint?: {
          fields?: unknown;
        };
      };
    };
  };
};

function isPrismaError(error: unknown): error is PrismaErrorLike {
  return typeof error === "object" && error !== null;
}

export function mapPrismaError(error: unknown): unknown {
  if (!isPrismaError(error)) {
    return error;
  }

  if (error.code === "P2002") {
    const fields = Array.isArray(
      error.meta?.driverAdapterError?.cause?.constraint?.fields,
    )
      ? error.meta.driverAdapterError.cause.constraint.fields.filter(
          (field): field is string => typeof field === "string",
        )
      : [];

    return new ConflictError(
      "Resource already exists",
      fields.length > 0 ? fields : null,
    );
  }

  return error;
}

import type { SignupFormData } from "../validators/signup.validator";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

type ApiErrorResponse = {
  status: "error";
  message: string;
  details: {
    fields?: string[] | null;
    errors?: unknown | null;
  } | null;
};

export class ApiError extends Error {
  public readonly statusCode: number;
  public readonly details: ApiErrorResponse["details"];

  constructor(
    message: string,
    statusCode: number,
    details: ApiErrorResponse["details"],
  ) {
    super(message);

    this.name = "ApiError";
    this.statusCode = statusCode;
    this.details = details;
  }
}

export async function createUser(data: SignupFormData) {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const result: unknown = await response.json();

  if (!response.ok) {
    if (
      typeof result === "object" &&
      result !== null &&
      "message" in result &&
      typeof result.message === "string"
    ) {
      const details =
        "details" in result &&
        (typeof result.details === "object" || result.details === null)
          ? result.details
          : null;

      throw new ApiError(result.message, response.status, details);
    }

    throw new ApiError("Something went wrong", response.status, null);
  }

  return result;
}

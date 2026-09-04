import axios, { type InternalAxiosRequestConfig } from "axios";

import type { SignupFormData } from "../validators/signup.validator";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

type ApiErrorResponse = {
  status: "error";
  message: string;
  details: {
    fields?: string[] | null;
    errors?: unknown | null;
  } | null;
};

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _retry?: boolean;
};
let refreshPromise: Promise<unknown> | null = null;

api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config as RetryableRequestConfig;

    if (
      error.response?.status !== 401 ||
      originalRequest.url === "/auth/refresh" ||
      originalRequest._retry
    ) {
      throw error;
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = api.post("/auth/refresh").finally(() => {
          refreshPromise = null;
        });
      }

      await refreshPromise;

      return api.request(originalRequest);
    } catch {
      window.dispatchEvent(new Event("auth:failed"));

      throw error;
    }
  },
);

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

function handleApiError(error: unknown): never {
  if (axios.isAxiosError<ApiErrorResponse>(error)) {
    const result = error.response?.data;

    if (result?.message) {
      throw new ApiError(
        result.message,
        error.response?.status ?? 500,
        result.details ?? null,
      );
    }

    throw new ApiError(
      "Something went wrong",
      error.response?.status ?? 500,
      null,
    );
  }

  throw error;
}

export async function createUser(data: SignupFormData) {
  try {
    const response = await api.post("/auth/signup", data);

    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function getCurrentUser() {
  try {
    const response = await api.get("/auth/me");

    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function logoutUser() {
  try {
    const response = await api.post("/auth/logout");

    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

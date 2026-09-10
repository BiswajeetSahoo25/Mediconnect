import { api } from "./api";

export interface CurrentUser {
  id: string;
  email: string;
  phone: string | null;
  role: string;
  isVerified: boolean;
  isActive: boolean;
  lastLoginAt: string | null;
  onboardingCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CurrentUserResponse {
  status: "success";
  data: CurrentUser;
}

export interface UpdateCurrentUserInput {
  email?: string;
  phone?: string | null;
}

export async function getCurrentUser(): Promise<CurrentUserResponse> {
  const response = await api.get<CurrentUserResponse>("/users/me");

  return response.data;
}

export async function updateCurrentUser(
  data: UpdateCurrentUserInput,
): Promise<CurrentUserResponse> {
  const response = await api.patch<CurrentUserResponse>("/users/me", data);

  return response.data;
}

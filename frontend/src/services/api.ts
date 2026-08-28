import type { SignupFormData } from "../validators/signup.validator";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function createUser(data: SignupFormData) {
  const response = await fetch(`${API_BASE_URL}/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error("Failed to create user");
  }

  return response.json();
}

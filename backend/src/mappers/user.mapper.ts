import type { User } from "../generated/prisma/client.js";

export function toUserResponse(user: User) {
  return {
    id: user.id,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isVerified: user.isVerified,
    isActive: user.isActive,
    lastLoginAt: user.lastLoginAt,
    onboardingCompletedAt: user.onboardingCompletedAt,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

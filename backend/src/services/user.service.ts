import argon2 from "argon2";
import { UserRepository } from "../repositories/user.repository.js";
import { CreateUserInput, UpdateCurrentUserInput } from "../validators/user.validator.js";

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUserById(id: string) {
    return this.userRepository.findById(id);
  }

  async getUserByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async createUser(data: CreateUserInput) {

    const passwordHash = await argon2.hash(data.password);

    return this.userRepository.create({
      email: data.email,
      passwordHash,
      ...(data.phone !== undefined && {
        phone: data.phone,
      }),
    });
  }

  async updateCurrentUser(id: string, data: UpdateCurrentUserInput) {
    return this.userRepository.update(id, {
      ...(data.email !== undefined ? { email: data.email } : {}),
      ...(data.phone !== undefined ? { phone: data.phone } : {}),
    });
  }

  async completeOnboarding(id: string) {
    return this.userRepository.update(id, { onboardingCompletedAt: new Date() });
  }
}

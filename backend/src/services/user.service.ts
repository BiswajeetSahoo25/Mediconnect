import argon2 from "argon2";
import { ConflictError } from "../errors/http-errors.js";
import { UserRepository } from "../repositories/user.repository.js";

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUserById(id: string) {
    return this.userRepository.findById(id);
  }

  async getUserByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async createUser(data: { email: string; phone?: string; password: string }) {
    const existingUserByEmail = await this.userRepository.findByEmail(
      data.email,
    );

    if (existingUserByEmail) {
      throw new ConflictError("User with this email already exists");
    }

    const passwordHash = await argon2.hash(data.password);

    return this.userRepository.create({
      email: data.email,
      passwordHash,
      ...(data.phone !== undefined && {
        phone: data.phone,
      }),
    });
  }
}

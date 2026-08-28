import argon2 from "argon2";
import { UserRepository } from "../repositories/user.repository.js";
import { CreateUserInput } from "../validators/user.validator.js";

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
}

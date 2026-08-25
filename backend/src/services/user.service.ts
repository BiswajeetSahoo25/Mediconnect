import { UserRepository } from "../repositories/user.repository.js";

export class UserService {
  constructor(private readonly userRepository: UserRepository) {}

  async getUserById(id: string) {
    return this.userRepository.findById(id);
  }

  async getUserByEmail(email: string) {
    return this.userRepository.findByEmail(email);
  }

  async createUser(data: {
    email: string;
    phone: string;
    passwordHash: string;
    role: "PATIENT" | "DOCTOR" | "ADMIN" | "FACILITY_STAFF" | "FACILITY_ADMIN";
  }) {
    const existingUserByEmail = await this.userRepository.findByEmail(
      data.email,
    );

    if (existingUserByEmail) {
      throw new Error("User with this email already exists");
    }

    return this.userRepository.create(data);
  }
}
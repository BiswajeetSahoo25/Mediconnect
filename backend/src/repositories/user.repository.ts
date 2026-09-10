import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../config/prisma.js";
import { mapPrismaError } from "../errors/error-mapper.js";

export class UserRepository {
  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
    });
  }

  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: Prisma.UserCreateInput) {
    try {
      return await prisma.user.create({
        data,
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }
  
  async updateLastLogin(id: string) {
    return prisma.user.update({
      where: { id },
      data: {
        lastLoginAt: new Date(),
      },
    });
  }

  async update(id: string, data: Prisma.UserUpdateInput) {
    try {
      return await prisma.user.update({ where: { id }, data });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }
}

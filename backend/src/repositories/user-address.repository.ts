import { Prisma } from "../generated/prisma/client.js";
import { prisma } from "../config/prisma.js";
import { mapPrismaError } from "../errors/error-mapper.js";

export class UserAddressRepository {
  async findByUserId(userId: string) {
    return prisma.userAddress.findMany({
      where: { userId },
      include: {
        address: true,
      },
      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async findById(id: string) {
    return prisma.userAddress.findUnique({
      where: { id },
      include: {
        address: true,
      },
    });
  }

  async countByUserId(userId: string) {
    return prisma.userAddress.count({
      where: { userId },
    });
  }

  async findDefaultByUserId(userId: string) {
    return prisma.userAddress.findFirst({
      where: {
        userId,
        isDefault: true,
      },
    });
  }

  async create(data: Prisma.UserAddressCreateInput) {
    try {
      return await prisma.userAddress.create({
        data,
        include: {
          address: true,
        },
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async update(id: string, data: Prisma.UserAddressUpdateInput) {
    try {
      return await prisma.userAddress.update({
        where: { id },
        data,
        include: {
          address: true,
        },
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }

  async delete(id: string) {
    try {
      return await prisma.userAddress.delete({
        where: { id },
        include: {
          address: true,
        },
      });
    } catch (error) {
      throw mapPrismaError(error);
    }
  }
}

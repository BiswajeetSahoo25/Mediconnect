import { Prisma } from "../generated/prisma/client.js";

import { UserAddressRepository } from "../repositories/user-address.repository.js";

import type {
  CreateUserAddressInput,
  UpdateUserAddressInput,
} from "../validators/user-address.validator.js";

import { NotFoundError } from "../errors/http-errors.js";

export class UserAddressService {
  constructor(private readonly userAddressRepository: UserAddressRepository) {}

  async getAddresses(userId: string) {
    return this.userAddressRepository.findByUserId(userId);
  }

  async createAddress(userId: string, data: CreateUserAddressInput) {
    const addressCount = await this.userAddressRepository.countByUserId(userId);

    const isDefault = data.isDefault ?? addressCount === 0;

    const createData: Prisma.UserAddressCreateInput = {
      user: {
        connect: {
          id: userId,
        },
      },

      address: {
        create: {
          addressLine1: data.addressLine1,
          addressLine2: data.addressLine2,
          landmark: data.landmark,
          city: data.city,
          state: data.state,
          country: data.country,
          pincode: data.pincode,
          latitude: data.latitude,
          longitude: data.longitude,
        },
      },

      addressType: data.addressType,
      isDefault,
    };

    if (isDefault) {
      const existingDefault =
        await this.userAddressRepository.findDefaultByUserId(userId);

      if (existingDefault) {
        await this.userAddressRepository.update(existingDefault.id, {
          isDefault: false,
        });
      }
    }

    return this.userAddressRepository.create(createData);
  }

  async updateAddress(
    userId: string,
    addressId: string,
    data: UpdateUserAddressInput,
  ) {
    const userAddress = await this.userAddressRepository.findById(addressId);

    if (!userAddress || userAddress.userId !== userId) {
      throw new NotFoundError("Address not found");
    }

    if (data.isDefault === true) {
      const existingDefault =
        await this.userAddressRepository.findDefaultByUserId(userId);

      if (existingDefault && existingDefault.id !== addressId) {
        await this.userAddressRepository.update(existingDefault.id, {
          isDefault: false,
        });
      }
    }

    const userAddressData: Prisma.UserAddressUpdateInput = {
      addressType: data.addressType,
      isDefault: data.isDefault,
    };

    const addressData: Prisma.AddressUpdateInput = {
      addressLine1: data.addressLine1,
      addressLine2: data.addressLine2,
      landmark: data.landmark,
      city: data.city,
      state: data.state,
      country: data.country,
      pincode: data.pincode,
      latitude: data.latitude,
      longitude: data.longitude,
    };

    return this.userAddressRepository.update(addressId, {
      ...userAddressData,
      address: {
        update: addressData,
      },
    });
  }

  async deleteAddress(userId: string, addressId: string) {
    const userAddress = await this.userAddressRepository.findById(addressId);

    if (!userAddress || userAddress.userId !== userId) {
      throw new NotFoundError("Address not found");
    }

    await this.userAddressRepository.delete(addressId);

    return {
      message: "Address deleted successfully",
    };
  }
}

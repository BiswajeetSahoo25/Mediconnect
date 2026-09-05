import type { Request, Response } from "express";

import { UserAddressRepository } from "../repositories/user-address.repository.js";
import { UserAddressService } from "../services/user-address.service.js";

import type {
  CreateUserAddressInput,
  UpdateUserAddressInput,
  UserAddressIdInput,
} from "../validators/user-address.validator.js";

import { UnauthorizedError } from "../errors/http-errors.js";

const userAddressService = new UserAddressService(new UserAddressRepository());

export class UserAddressController {
  async getAddresses(req: Request, res: Response) {
    const userId = req.user?.sub;

    if (!userId) {
      throw new UnauthorizedError("Authentication required");
    }

    const addresses = await userAddressService.getAddresses(userId);

    res.status(200).json({
      status: "success",
      data: addresses,
    });
  }

  async createAddress(req: Request, res: Response) {
    const userId = req.user?.sub;

    if (!userId) {
      throw new UnauthorizedError("Authentication required");
    }

    const data = req.validated.body as CreateUserAddressInput;

    const address = await userAddressService.createAddress(userId, data);

    res.status(201).json({
      status: "success",
      data: address,
    });
  }

  async updateAddress(req: Request, res: Response) {
    const userId = req.user?.sub;

    if (!userId) {
      throw new UnauthorizedError("Authentication required");
    }

    const { id } = req.validated.params as UserAddressIdInput;

    const data = req.validated.body as UpdateUserAddressInput;

    const address = await userAddressService.updateAddress(userId, id, data);

    res.status(200).json({
      status: "success",
      data: address,
    });
  }

  async deleteAddress(req: Request, res: Response) {
    const userId = req.user?.sub;

    if (!userId) {
      throw new UnauthorizedError("Authentication required");
    }

    const { id } = req.validated.params as UserAddressIdInput;

    await userAddressService.deleteAddress(userId, id);

    res.status(200).json({
      status: "success",
      message: "Address deleted successfully",
    });
  }
}

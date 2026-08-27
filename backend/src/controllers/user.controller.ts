import type { Request, Response } from "express";
import { UserService } from "../services/user.service.js";
import { UserRepository } from "../repositories/user.repository.js";
import { NotFoundError } from "../errors/http-errors.js";
import { UserIdInput } from "../validators/user.validator.js";

const userService = new UserService(new UserRepository());

export class UserController {
  async getById(req: Request, res: Response) {
    const { id } = req.validated.params as UserIdInput;

    const user = await userService.getUserById(id);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    res.status(200).json({
      status: "success",
      data: user,
    });
  }

  async create(req: Request, res: Response) {
    const { email, phone, password } = req.body;

    const user = await userService.createUser({
      email,
      phone,
      password,
    });

    res.status(200).json({
      status: "success",
      data: user,
    });
  }
}

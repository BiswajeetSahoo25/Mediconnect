import type { Request, Response } from "express";
import { UserService } from "../services/user.service.js";
import { UserRepository } from "../repositories/user.repository.js";

const userService = new UserService(new UserRepository());

export class UserController {
  async getById(req: Request, res: Response) {
    const { id } = req.params;

    if (typeof id != "string") {
      res.status(400).json({
        status: "error",
        message: "Invalid user id",
      });
      return;
    }
    const user = await userService.getUserById(id);

    if (!user) {
      res.status(404).json({
        status: "error",
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      status: "success",
      data: user,
    });
  }
}

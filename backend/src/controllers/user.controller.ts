import type { Request, Response } from "express";
import { UserService } from "../services/user.service.js";
import { UserRepository } from "../repositories/user.repository.js";
import { NotFoundError, UnauthorizedError } from "../errors/http-errors.js";
import { CreateUserInput, UpdateCurrentUserInput, UserIdInput } from "../validators/user.validator.js";
import { toUserResponse } from "../mappers/user.mapper.js";

const userService = new UserService(new UserRepository());

export class UserController {
  private getCurrentUserId(req: Request) {
    const userId = req.user?.sub;
    if (!userId) throw new UnauthorizedError("Authentication required");
    return userId;
  }

  async getCurrentUser(req: Request, res: Response) {
    const user = await userService.getUserById(this.getCurrentUserId(req));
    if (!user) throw new NotFoundError("User not found");
    return res.status(200).json({ status: "success", data: toUserResponse(user) });
  }

  async updateCurrentUser(req: Request, res: Response) {
    const user = await userService.updateCurrentUser(
      this.getCurrentUserId(req),
      req.validated.body as UpdateCurrentUserInput,
    );
    return res.status(200).json({ status: "success", data: toUserResponse(user) });
  }

  async completeOnboarding(req: Request, res: Response) {
    const user = await userService.completeOnboarding(this.getCurrentUserId(req));
    return res.status(200).json({ status: "success", data: toUserResponse(user) });
  }

  async getById(req: Request, res: Response) {
    const { id } = req.validated.params as UserIdInput;

    const user = await userService.getUserById(id);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    res.status(200).json({
      status: "success",
      data: toUserResponse(user),
    });
  }

  async create(req: Request, res: Response) {
    const data = req.validated.body as CreateUserInput;

    const user = await userService.createUser(data);

    res.status(200).json({
      status: "success",
      data: toUserResponse(user),
    });
  }
}

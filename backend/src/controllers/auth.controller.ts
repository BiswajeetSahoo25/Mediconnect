import type { Request, Response } from "express";

import { env } from "../config/env.js";
import { AuthService } from "../services/auth.service.js";
import { UnauthorizedError } from "../errors/http-errors.js";
import type { CreateUserInput } from "../validators/user.validator.js";

export class AuthController {
  private readonly authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  private setAuthCookies(
    res: Response,
    accessToken: string,
    refreshToken: string,
  ) {
    const isProduction = env.nodeEnv === "production";

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? ("none" as const) : ("lax" as const),
    };

    res.cookie("accessToken", accessToken, cookieOptions);
    res.cookie("refreshToken", refreshToken, cookieOptions);
  }

  async signup(req: Request, res: Response) {
    const result = await this.authService.signup(
      req.validated.body as CreateUserInput,
    );

    this.setAuthCookies(res, result.accessToken, result.refreshToken);

    return res.status(201).json({
      success: true,
      data: {
        user: result.user,
      },
    });
  }

  async login(req: Request, res: Response) {
    const { email, password } = req.body;

    const result = await this.authService.login(email, password);

    this.setAuthCookies(res, result.accessToken, result.refreshToken);

    return res.status(200).json({
      success: true,
      data: {
        user: result.user,
      },
    });
  }

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      throw new UnauthorizedError();
    }

    const result = await this.authService.refresh(refreshToken);

    this.setAuthCookies(res, result.accessToken, result.refreshToken);

    return res.status(200).json({
      success: true,
      data: {
        user: result.user,
      },
    });
  }

  async logout(req: Request, res: Response) {
    const refreshToken = req.cookies.refreshToken;

    if (refreshToken) {
      await this.authService.logout(refreshToken);
    }

    const isProduction = env.nodeEnv === "production";

    const cookieOptions = {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? ("none" as const) : ("lax" as const),
    };

    res.clearCookie("accessToken", cookieOptions);
    res.clearCookie("refreshToken", cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Logged out successfully",
    });
  }

  async me(req: Request, res: Response) {
    const userId = req.user?.sub;

    if (!userId) {
      throw new UnauthorizedError();
    }

    const user = await this.authService.me(userId);

    return res.status(200).json({
      success: true,
      data: {
        user,
      },
    });
  }
}

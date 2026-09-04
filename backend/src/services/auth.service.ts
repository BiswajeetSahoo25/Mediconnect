import argon2 from "argon2";

import { env } from "../config/env.js";
import { UnauthorizedError } from "../errors/http-errors.js";
import { UserRepository } from "../repositories/user.repository.js";
import { RefreshTokenRepository } from "../repositories/refresh-token.repository.js";
import { generateAccessToken } from "../auth/utils/access-token.js";
import {
  generateRefreshToken,
  hashRefreshToken,
} from "../auth/utils/refresh-token.js";
import { toUserResponse } from "../mappers/user.mapper.js";

export class AuthService {
  private readonly userRepository: UserRepository;
  private readonly refreshTokenRepository: RefreshTokenRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.refreshTokenRepository = new RefreshTokenRepository();
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findByEmail(email);

    if (!user) {
      throw new UnauthorizedError();
    }

    const isPasswordValid = await argon2.verify(user.passwordHash, password);

    if (!isPasswordValid) {
      throw new UnauthorizedError();
    }

    await this.userRepository.updateLastLogin(user.id);

    const accessToken = await generateAccessToken(user.id, user.role);

    const refreshToken = generateRefreshToken();

    const tokenHash = hashRefreshToken(refreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + env.refreshTokenExpiresInDays);

    await this.refreshTokenRepository.create({
      tokenHash,
      expiresAt,

      user: {
        connect: {
          id: user.id,
        },
      },
    });

    return {
      user: toUserResponse(user),
      accessToken,
      refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    const tokenHash = hashRefreshToken(refreshToken);

    const storedToken =
      await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (
      !storedToken ||
      storedToken.revokedAt !== null ||
      storedToken.expiresAt <= new Date()
    ) {
      throw new UnauthorizedError();
    }

    const user = await this.userRepository.findById(storedToken.userId);

    if (!user) {
      throw new UnauthorizedError();
    }

    await this.refreshTokenRepository.revoke(storedToken.id);

    const newRefreshToken = generateRefreshToken();

    const newTokenHash = hashRefreshToken(newRefreshToken);

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + env.refreshTokenExpiresInDays);

    await this.refreshTokenRepository.create({
      tokenHash: newTokenHash,
      expiresAt,
      user: {
        connect: {
          id: user.id,
        },
      },
    });

    const accessToken = await generateAccessToken(user.id, user.role);

    return {
      accessToken,
      refreshToken: newRefreshToken,
      user: toUserResponse(user),
    };
  }

  async logout(refreshToken: string) {
    const tokenHash = hashRefreshToken(refreshToken);

    const storedToken =
      await this.refreshTokenRepository.findByTokenHash(tokenHash);

    if (!storedToken || storedToken.revokedAt !== null) {
      return;
    }

    await this.refreshTokenRepository.revoke(storedToken.id);
  }

  async me(userId: string) {
    const user = await this.userRepository.findById(userId);

    if(!user) {
      throw new UnauthorizedError();
    }

    return toUserResponse(user);
  }
}

import { jwtVerify, SignJWT } from "jose";

import { env } from "../../config/env.js";

const secret = new TextEncoder().encode(env.jwtAccessSecret);

export async function generateAccessToken(userId: string, role: string) {
  return new SignJWT({
    role,
  })
    .setProtectedHeader({
      alg: "HS256",
      typ: "JWT",
    })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(env.jwtAccessExpiresIn)
    .sign(secret);
}

export async function verifyAccessToken(token: string) {
  const { payload } = await jwtVerify(token, secret);

  return payload;
}

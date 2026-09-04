import "dotenv/config";

function getRequiredEnv(variable: string): string {
  const value = process.env[variable];

  if (!value) {
    throw new Error(`Missing required environment variable: ${variable}`);
  }

  return value;
}

export const env = {
  nodeEnv: getRequiredEnv("NODE_ENV"),
  port: Number(getRequiredEnv("PORT")),
  databaseUrl: getRequiredEnv("DATABASE_URL"),

  frontendUrl: getRequiredEnv("FRONTEND_URL"),

  jwtAccessSecret: getRequiredEnv("JWT_ACCESS_SECRET"),
  jwtAccessExpiresIn: getRequiredEnv("JWT_ACCESS_EXPIRES_IN"),
  refreshTokenExpiresInDays: Number(
    getRequiredEnv("REFRESH_TOKEN_EXPIRES_IN_DAYS"),
  ),
};

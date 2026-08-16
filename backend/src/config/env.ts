import "dotenv/config";

const requiredEnvVariables = ["NODE_ENV", "PORT"] as const;

for (const variable of requiredEnvVariables) {
  if (!process.env[variable]) {
    throw new Error(`Missing required environment variable: ${variable}`);
  }
}

export const env = {
  nodeEnv: process.env.NODE_ENV,
  port: Number(process.env.PORT)
};
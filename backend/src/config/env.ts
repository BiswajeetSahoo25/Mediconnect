import "dotenv/config";
import { validateEnvironment } from "./env-validation.js";

export const env = validateEnvironment(process.env);

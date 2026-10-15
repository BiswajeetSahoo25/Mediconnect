import assert from "node:assert/strict";
import test from "node:test";

import { validateEnvironment } from "../src/config/env-validation.ts";

function validEnvironment(overrides = {}) {
  return {
    NODE_ENV: "development",
    PORT: "3000",
    DATABASE_URL: "postgresql://postgres:local-pass@localhost:5432/mediconnect",
    FRONTEND_URL: "http://localhost:5173",
    JWT_ACCESS_SECRET: "local-development-secret-for-tests-only",
    JWT_ACCESS_EXPIRES_IN: "15m",
    REFRESH_TOKEN_EXPIRES_IN_DAYS: "30",
    GEOAPIFY_API_KEY: "local-geofacility-key",
    ...overrides,
  };
}

test("parses valid ports and days-based refresh token expiry", () => {
  const env = validateEnvironment(
    validEnvironment({ PORT: "65535", REFRESH_TOKEN_EXPIRES_IN_DAYS: "1" }),
  );

  assert.equal(env.port, 65535);
  assert.equal(env.refreshTokenExpiresInDays, 1);
});

test("rejects invalid PORT values with an actionable message", async (t) => {
  for (const port of ["0", "65536", "-1", "3.5", "3e3", "NaN"]) {
    await t.test(JSON.stringify(port), () => {
      assert.throws(
        () => validateEnvironment(validEnvironment({ PORT: port })),
        /Invalid environment variable PORT: expected an integer from 1 to 65535/,
      );
    });
  }
});

test("rejects invalid REFRESH_TOKEN_EXPIRES_IN_DAYS values", async (t) => {
  for (const days of ["0", "-1", "1.5", "1e2", "NaN", "Infinity"]) {
    await t.test(JSON.stringify(days), () => {
      assert.throws(
        () =>
          validateEnvironment(
            validEnvironment({ REFRESH_TOKEN_EXPIRES_IN_DAYS: days }),
          ),
        /Invalid environment variable REFRESH_TOKEN_EXPIRES_IN_DAYS: expected an integer greater than or equal to 1/,
      );
    });
  }
});

test("rejects invalid JWT_ACCESS_EXPIRES_IN values at startup", async (t) => {
  for (const expiry of ["0s", "-15m", "1 month", "not-a-duration", "0.001s"]) {
    await t.test(expiry, () => {
      assert.throws(
        () =>
          validateEnvironment(validEnvironment({ JWT_ACCESS_EXPIRES_IN: expiry })),
        /Invalid environment variable JWT_ACCESS_EXPIRES_IN: expected a positive time span/,
      );
    });
  }
});

test("rejects missing and whitespace-only required variables", async (t) => {
  for (const name of [
    "NODE_ENV",
    "PORT",
    "DATABASE_URL",
    "FRONTEND_URL",
    "JWT_ACCESS_SECRET",
    "JWT_ACCESS_EXPIRES_IN",
    "REFRESH_TOKEN_EXPIRES_IN_DAYS",
    "GEOAPIFY_API_KEY",
  ]) {
    await t.test(name, () => {
      const missing = validEnvironment();
      delete missing[name];
      assert.throws(
        () => validateEnvironment(missing),
        new RegExp(`Missing or empty required environment variable ${name}`),
      );

      assert.throws(
        () => validateEnvironment(validEnvironment({ [name]: "   " })),
        new RegExp(`Missing or empty required environment variable ${name}`),
      );
    });
  }
});

test("accepts test mode and leaves local secret policy unchanged", () => {
  const env = validateEnvironment(
    validEnvironment({
      NODE_ENV: "test",
      JWT_ACCESS_SECRET: "short test secret",
    }),
  );

  assert.equal(env.nodeEnv, "test");
  assert.equal(env.jwtAccessSecret, "short test secret");
});

test("rejects placeholder and weak JWT secrets in production", async (t) => {
  for (const secret of [
    "replace_with_a_strong_random_secret",
    "a-secret-that-is-too-short",
    "a".repeat(48),
    "local-development-secret-for-tests-only",
  ]) {
    await t.test(secret, () => {
      assert.throws(
        () =>
          validateEnvironment(
            validEnvironment({ NODE_ENV: "production", JWT_ACCESS_SECRET: secret }),
          ),
        /JWT_ACCESS_SECRET/,
      );
    });
  }
});

test("rejects placeholder production credentials", () => {
  assert.throws(
    () =>
      validateEnvironment(
        validEnvironment({
          NODE_ENV: "production",
          JWT_ACCESS_SECRET: "Q7uN9pL2vR5xK8mC4wT1zA6bD3eF0gHjPqYkMsVnXcBwErUi",
          GEOAPIFY_API_KEY: "your_actual_geoapify_api_key_here",
        }),
      ),
    /GEOAPIFY_API_KEY.*placeholder/,
  );
});

test("rejects unsupported NODE_ENV values", () => {
  assert.throws(
    () => validateEnvironment(validEnvironment({ NODE_ENV: "staging" })),
    /Invalid environment variable NODE_ENV: use one of development, test, production/,
  );
});

export type EnvironmentSource = Record<string, string | undefined>;

const supportedNodeEnvironments = ["development", "test", "production"] as const;
type NodeEnvironment = (typeof supportedNodeEnvironments)[number];

export type Environment = {
  nodeEnv: NodeEnvironment;
  port: number;
  databaseUrl: string;
  frontendUrl: string;
  jwtAccessSecret: string;
  jwtAccessExpiresIn: string;
  refreshTokenExpiresInDays: number;
  geoapifyApiKey: string;
  openfdaApiKey: string;
};

function getRequiredString(source: EnvironmentSource, name: string): string {
  const value = source[name]?.trim();

  if (!value) {
    throw new Error(
      `Missing or empty required environment variable ${name}. Set a non-empty value in backend/.env or your deployment environment.`,
    );
  }

  return value;
}

function parseInteger(
  source: EnvironmentSource,
  name: string,
  minimum: number,
  maximum?: number,
): number {
  const value = getRequiredString(source, name);
  const inRange = (parsed: number) =>
    Number.isSafeInteger(parsed) &&
    parsed >= minimum &&
    (maximum === undefined || parsed <= maximum);
  const rangeDescription =
    maximum === undefined
      ? `an integer greater than or equal to ${minimum}`
      : `an integer from ${minimum} to ${maximum}`;

  if (!/^\d+$/.test(value)) {
    throw new Error(
      `Invalid environment variable ${name}: expected ${rangeDescription}. Update backend/.env or the deployment setting.`,
    );
  }

  const parsed = Number(value);
  if (!inRange(parsed)) {
    throw new Error(
      `Invalid environment variable ${name}: expected ${rangeDescription}. Update backend/.env or the deployment setting.`,
    );
  }

  return parsed;
}

function looksLikePlaceholder(value: string): boolean {
  return /replace[_ -]?with|your[_ -]?(?:actual[_ -]?)?|placeholder|example|sample|change[_ -]?me|changeme|dummy|todo|insert[_ -]?value/i.test(
    value,
  );
}

function getJwtAccessExpiry(source: EnvironmentSource): string {
  const value = getRequiredString(source, "JWT_ACCESS_EXPIRES_IN");
  const matched = /^(\d+(?:\.\d+)?)\s?(seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)$/i.exec(
    value,
  );
  const amount = matched ? Number(matched[1]) : Number.NaN;
  const unit = matched?.[2]?.[0]?.toLowerCase();
  const secondsPerUnit: Record<string, number> = {
    s: 1,
    m: 60,
    h: 60 * 60,
    d: 24 * 60 * 60,
    w: 7 * 24 * 60 * 60,
    y: 365.25 * 24 * 60 * 60,
  };
  const multiplier = unit ? secondsPerUnit[unit] : undefined;
  const durationSeconds =
    multiplier === undefined ? Number.NaN : amount * multiplier;

  if (
    !Number.isFinite(durationSeconds) ||
    Math.round(durationSeconds) < 1 ||
    !Number.isSafeInteger(Math.round(durationSeconds))
  ) {
    throw new Error(
      "Invalid environment variable JWT_ACCESS_EXPIRES_IN: expected a positive time span such as 15m, 2 hours, or 1 day.",
    );
  }

  return value;
}

function isUnsafeDefaultJwtSecret(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return (
    /^(?:secret|password|changeme|change_me|test|development|default)$/.test(
      normalized,
    ) ||
    /local[_ -]?development|test[_ -]?only|demo[_ -]?secret|default[_ -]?secret/.test(
      normalized,
    )
  );
}

function validateProductionCredentials(source: EnvironmentSource, jwtSecret: string) {
  if (Buffer.byteLength(jwtSecret, "utf8") < 32) {
    throw new Error(
      "Invalid environment variable JWT_ACCESS_SECRET: production requires at least 32 UTF-8 bytes. Generate a unique random secret and store it in your deployment secret manager.",
    );
  }

  if (new Set(jwtSecret).size < 8) {
    throw new Error(
      "Invalid environment variable JWT_ACCESS_SECRET: production secret has too little character variety. Generate a unique random secret and store it in your deployment secret manager.",
    );
  }

  if (isUnsafeDefaultJwtSecret(jwtSecret)) {
    throw new Error(
      "Invalid environment variable JWT_ACCESS_SECRET: production cannot use a development, test, or common default secret. Generate a unique random secret and store it in your deployment secret manager.",
    );
  }

  const credentialNames = [
    "JWT_ACCESS_SECRET",
    "DATABASE_URL",
    "GEOAPIFY_API_KEY",
    "OPENFDA_API_KEY",
  ];
  for (const name of credentialNames) {
    const value = source[name]?.trim();
    if (value && looksLikePlaceholder(value)) {
      throw new Error(
        `Invalid production environment variable ${name}: it appears to contain a placeholder. Replace it with a real credential or leave an optional credential unset.`,
      );
    }
  }
}

export function validateEnvironment(source: EnvironmentSource): Environment {
  const nodeEnv = getRequiredString(source, "NODE_ENV");
  if (!supportedNodeEnvironments.includes(nodeEnv as NodeEnvironment)) {
    throw new Error(
      `Invalid environment variable NODE_ENV: use one of ${supportedNodeEnvironments.join(", ")}.`,
    );
  }

  const jwtAccessSecret = getRequiredString(source, "JWT_ACCESS_SECRET");
  if (nodeEnv === "production") {
    validateProductionCredentials(source, jwtAccessSecret);
  }

  return {
    nodeEnv: nodeEnv as NodeEnvironment,
    port: parseInteger(source, "PORT", 1, 65535),
    databaseUrl: getRequiredString(source, "DATABASE_URL"),
    frontendUrl: getRequiredString(source, "FRONTEND_URL"),
    jwtAccessSecret,
    jwtAccessExpiresIn: getJwtAccessExpiry(source),
    refreshTokenExpiresInDays: parseInteger(
      source,
      "REFRESH_TOKEN_EXPIRES_IN_DAYS",
      1,
    ),
    geoapifyApiKey: getRequiredString(source, "GEOAPIFY_API_KEY"),
    openfdaApiKey: source.OPENFDA_API_KEY?.trim() ?? "",
  };
}

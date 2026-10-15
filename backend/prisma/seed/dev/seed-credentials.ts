export function requireSeedCredential(name: string) {
  const value = process.env[name]?.trim();
  if (!value || /replace[_ -]?with|placeholder|change[_ -]?me|changeme/i.test(value)) {
    throw new Error(
      `${name} must be set to a private local value before running development seeds`,
    );
  }
  return value;
}

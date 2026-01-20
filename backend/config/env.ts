export const env = {
  PORT: Number(process.env.PORT ?? 3000),

  PGHOST: must("PGHOST"),
  PGPORT: Number(process.env.PGPORT ?? "5432"),
  PGUSER: must("PGUSER"),
  PGPASSWORD: must("PGPASSWORD"),
  PGDATABASE: must("PGDATABASE"),

  STORAGE_MODE: (process.env.STORAGE_MODE ?? "local") as "local" | "aws",

  AWS_REGION: process.env.AWS_REGION ?? "",
  FILES_BUCKET_NAME: process.env.FILES_BUCKET_NAME ?? "",
  PRESIGN_EXPIRES_SECONDS: Number(process.env.PRESIGN_EXPIRES_SECONDS ?? "600"),

  ALLOWED_FILE_TYPES: new Set(
    (process.env.ALLOWED_FILE_TYPES ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
  ),
  MAX_FILE_SIZE_BYTES: Number(process.env.MAX_FILE_SIZE_BYTES ?? "52428800"),
};

function must(name: string) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing env var: ${name}`);
  return v;
}

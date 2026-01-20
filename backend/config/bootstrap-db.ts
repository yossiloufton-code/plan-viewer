import { DataSource } from "typeorm";

const BOOTSTRAP_SQL = `
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS files (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  original_name text NOT NULL,
  file_type text NOT NULL,
  mime_type text NOT NULL,
  size_bytes integer NOT NULL,
  storage_key text NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  uploaded_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_files_project_type_created
  ON files (project_id, file_type, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_files_project_id
  ON files (project_id, id);
`;

export async function bootstrapDb(ds: DataSource) {
  // In AWS (RDS/Aurora) need to use "pgcrypto" instead.
  // Alternative: use gen_random_uuid() from pgcrypto instead of uuid-ossp.

  const runner = ds.createQueryRunner();
  await runner.connect();

  try {
    await runner.startTransaction();
    await runner.query(BOOTSTRAP_SQL);
    await runner.commitTransaction();
  } catch (err) {
    await runner.rollbackTransaction();
    throw err;
  } finally {
    await runner.release();
  }
}

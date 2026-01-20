import { Client } from "pg";
import { env } from "./env";

export async function ensureDatabaseExists() {
  // Connect to default DB first
  const adminDb = process.env.PGADMIN_DB ?? "postgres";

  const client = new Client({
    host: env.PGHOST,
    port: env.PGPORT,
    user: env.PGUSER,
    password: env.PGPASSWORD,
    database: adminDb,
  });

  await client.connect();

  try {
    const dbName = env.PGDATABASE;

    // check if exists
    const exists = await client.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [dbName]
    );

    if (exists.rowCount === 0) {
      // CREATE DATABASE cannot run inside a transaction
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Created database: ${dbName}`);
    } else {
      console.log(`Database already exists: ${dbName}`);
    }
  } finally {
    await client.end();
  }
}

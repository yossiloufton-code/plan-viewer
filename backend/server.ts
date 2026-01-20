import "dotenv/config";
import "reflect-metadata";

import { createApp } from "./app";
import { env } from "./config/env";
import { ensureDatabaseExists } from "./config/create-database";
import { AppDataSource } from "./config/data-source";
import { bootstrapDb } from "./config/bootstrap-db";

async function main() {
  await ensureDatabaseExists();

  await AppDataSource.initialize();
  console.log("[DB] TypeORM connected");

  await bootstrapDb(AppDataSource);
  console.log("[DB] Bootstrap SQL completed");

  const app = createApp();

  app.listen(env.PORT, () => {
    console.log(`API running on http://localhost:${env.PORT}`);
    console.log(`STORAGE_MODE=${env.STORAGE_MODE}`);
    console.log(`PG: ${env.PGHOST}:${env.PGPORT}/${env.PGDATABASE}`);
  });
}

main().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});

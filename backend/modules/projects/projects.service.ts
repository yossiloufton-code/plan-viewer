import { db } from "../../config/db";

export async function createProject(name: string) {
  const { rows } = await db.query(
    "INSERT INTO projects(name) VALUES($1) RETURNING id, name, created_at",
    [name]
  );
  return rows[0];
}

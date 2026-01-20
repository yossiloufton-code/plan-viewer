import "reflect-metadata";
import { DataSource } from "typeorm";
import { Project } from "../entities/Project";
import { FileEntity } from "../entities/FileEntity";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT ?? 5432),
  username: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  database: process.env.PGDATABASE,

  entities: [Project, FileEntity],

  synchronize: false,
  logging: false,
});

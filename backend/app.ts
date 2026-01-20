import express from "express";
import cors from "cors";

import { projectsRouter } from "./modules/projects/projects.routes";
import { filesRouter } from "./modules/files/files.routes";
import { errorMiddleware } from "./middlewares/error.middleware";

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => res.json({ ok: true }));

  app.use("/projects", projectsRouter);
  app.use("/projects", filesRouter);

  app.use(errorMiddleware);
  return app;
}

import type { Request, Response } from "express";
import { createProject } from "./projects.service";

export async function createProjectController(req: Request, res: Response) {
  const { name } = req.body ?? {};
  if (!name) return res.status(400).json({ message: "name required" });

  const project = await createProject(name);
  return res.json(project);
}

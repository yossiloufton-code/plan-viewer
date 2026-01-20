import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import { createProjectController } from "./projects.controller";

export const projectsRouter = Router();
projectsRouter.post("/", asyncHandler(createProjectController));

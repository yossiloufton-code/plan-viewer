import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import {
  presignUploadController,
  listFilesController,
  presignDownloadController,
  localUploadFileController,
  localDownloadFileController,
} from "./files.controller";

export const filesRouter = Router();

filesRouter.post("/:projectId/files/presign-upload", asyncHandler(presignUploadController));
filesRouter.get("/:projectId/files", asyncHandler(listFilesController));
filesRouter.post("/:projectId/files/presign-download", asyncHandler(presignDownloadController));

// Local storage endpoints (only used when STORAGE_MODE=local)
filesRouter.put("/:projectId/files/:fileId/upload", asyncHandler(localUploadFileController));
filesRouter.get("/:projectId/files/:fileId/download", asyncHandler(localDownloadFileController));

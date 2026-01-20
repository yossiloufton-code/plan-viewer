import { z } from "zod";

export const presignUploadSchema = z.object({
  files: z.array(
    z.object({
      originalName: z.string().min(1),
      fileType: z.string().min(1),
      mimeType: z.string().min(1),
      sizeBytes: z.number().positive(),
    })
  ).min(1),
});

export const presignDownloadSchema = z.object({
  type: z.string().optional(),
  fileIds: z.array(z.string()).optional(),
});

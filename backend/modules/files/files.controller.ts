import type { Request, Response } from "express";
import { presignUploadSchema, presignDownloadSchema } from "./files.validators";
import { presignUploads, listFiles, presignDownloads } from "./files.service";
import { localWriteFile, localReadFile } from "../../config/storage";
import { db } from "../../config/db";
import { env } from "../../config/env";

export async function presignUploadController(req: Request, res: Response) {
  const projectId = req.params.projectId as string;
  const parsed = presignUploadSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const out = await presignUploads(projectId, parsed.data.files);
  return res.json(out);
}

export async function listFilesController(req: Request, res: Response) {
  const projectId = req.params.projectId as string;
  const type = req.query.type as string | undefined;
  const out = await listFiles(projectId, type);
  return res.json(out);
}

export async function presignDownloadController(req: Request, res: Response) {
  const projectId = req.params.projectId as string;
  const parsed = presignDownloadSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json(parsed.error.flatten());

  const out = await presignDownloads(projectId, parsed.data.type, parsed.data.fileIds);
  return res.json(out);
}

/**
 * LOCAL MODE ONLY:
 * Upload file bytes to backend -> store under /uploads/<storageKey>
 * In AWS mode, you upload directly to S3 using presigned URL instead.
 */
export async function localUploadFileController(req: Request, res: Response) {
  if (env.STORAGE_MODE !== "local") return res.status(400).json({ message: "Not in local storage mode" });

  const { projectId, fileId } = req.params as any;

  // find file record to get storage_key
  const q = await db.query(`SELECT storage_key FROM files WHERE project_id=$1 AND id=$2`, [projectId, fileId]);
  if (q.rowCount === 0) return res.status(404).json({ message: "File not found" });

  const storageKey = q.rows[0].storage_key as string;

  // read raw body
  const chunks: Buffer[] = [];
  req.on("data", (c) => chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c)));
  req.on("end", async () => {
    const buf = Buffer.concat(chunks);
    localWriteFile(storageKey, buf);

    await db.query(`UPDATE files SET status='uploaded', uploaded_at=now() WHERE project_id=$1 AND id=$2`, [
      projectId,
      fileId,
    ]);

    res.json({ ok: true, storedAs: storageKey, sizeBytes: buf.length });
  });
}

/**
 * LOCAL MODE ONLY:
 * Download file from backend filesystem.
 * In AWS mode, you download directly from S3 using presigned URL instead.
 */
export async function localDownloadFileController(req: Request, res: Response) {
  if (env.STORAGE_MODE !== "local") return res.status(400).json({ message: "Not in local storage mode" });

  const { projectId, fileId } = req.params as any;

  const q = await db.query(
    `SELECT storage_key, original_name, mime_type FROM files WHERE project_id=$1 AND id=$2`,
    [projectId, fileId]
  );
  if (q.rowCount === 0) return res.status(404).json({ message: "File not found" });

  const { storage_key, original_name, mime_type } = q.rows[0];
  const filePath = localReadFile(storage_key);

  if (!filePath) return res.status(404).json({ message: "File not uploaded yet" });

  res.setHeader("Content-Type", mime_type);
  res.setHeader("Content-Disposition", `attachment; filename="${encodeURIComponent(original_name)}"`);
  return res.sendFile(filePath);
}

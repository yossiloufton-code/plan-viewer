import { db } from "../../config/db";
import { env } from "../../config/env";
import { createUploadTarget, createDownloadUrl } from "../../config/storage";
import { randomUUID } from "crypto";

export async function presignUploads(projectId: string, files: any[]) {
  // ensure project exists
  const proj = await db.query("SELECT id FROM projects WHERE id=$1", [projectId]);
  if (proj.rowCount === 0) {
    const err: any = new Error("Project not found");
    err.statusCode = 404;
    throw err;
  }

  const items = [];

  for (const f of files) {
    if (env.ALLOWED_FILE_TYPES.size && !env.ALLOWED_FILE_TYPES.has(f.fileType)) {
      const err: any = new Error(`File type ${f.fileType} not allowed`);
      err.statusCode = 400;
      throw err;
    }
    if (f.sizeBytes > env.MAX_FILE_SIZE_BYTES) {
      const err: any = new Error(`File too large`);
      err.statusCode = 400;
      throw err;
    }

    const fileId = randomUUID();

    const target = await createUploadTarget({
      projectId,
      fileType: f.fileType,
      originalName: f.originalName,
      mimeType: f.mimeType,
      fileId,
    });

    await db.query(
      `INSERT INTO files
        (id, project_id, original_name, file_type, mime_type, size_bytes, storage_key, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'pending')`,
      [fileId, projectId, f.originalName, f.fileType, f.mimeType, f.sizeBytes, target.storageKey]
    );

    items.push({ fileId, storageKey: target.storageKey, uploadUrl: target.uploadUrl, mode: target.mode });
  }

  return { expiresInSeconds: env.PRESIGN_EXPIRES_SECONDS, items };
}

export async function listFiles(projectId: string, type?: string) {
  const params: any[] = [projectId];
  let sql = `SELECT * FROM files WHERE project_id=$1`;
  if (type) {
    params.push(type);
    sql += ` AND file_type=$2`;
  }
  sql += ` ORDER BY created_at DESC`;
  const { rows } = await db.query(sql, params);
  return rows;
}

export async function presignDownloads(projectId: string, type?: string, fileIds?: string[]) {
  let rows: any[] = [];

  if (fileIds?.length) {
    const { rows: r } = await db.query(
      `SELECT * FROM files WHERE project_id=$1 AND id = ANY($2::uuid[])`,
      [projectId, fileIds]
    );
    rows = r;
  } else if (type) {
    const { rows: r } = await db.query(
      `SELECT * FROM files WHERE project_id=$1 AND file_type=$2 ORDER BY created_at DESC`,
      [projectId, type]
    );
    rows = r;
  } else {
    const err: any = new Error("Provide either type or fileIds");
    err.statusCode = 400;
    throw err;
  }

  if (!rows.length) {
    const err: any = new Error("No files found");
    err.statusCode = 404;
    throw err;
  }

  const items = await Promise.all(
    rows.map(async (f) => {
      const d = await createDownloadUrl({
        storageKey: f.storage_key,
        originalName: f.original_name,
        projectId,
        fileId: f.id,
      });
      return {
        fileId: f.id,
        originalName: f.original_name,
        fileType: f.file_type,
        downloadUrl: d.downloadUrl,
        mode: d.mode,
      };
    })
  );

  return { expiresInSeconds: env.PRESIGN_EXPIRES_SECONDS, items };
}

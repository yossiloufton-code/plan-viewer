import fs from "fs";
import path from "path";
import { env } from "./env";

// AWS SDK (used only if STORAGE_MODE=aws)
// In production you would NOT use access keys locally; you'd use IAM Role on Lambda/ECS.
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const uploadsDir = path.resolve(process.cwd(), "uploads");

function ensureUploadsDir() {
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
}

function safeName(name: string) {
  return name.replace(/[^\w.\-() ]/g, "_");
}

// --- AWS presign (works locally ONLY if you have AWS credentials configured)
const s3 =
  env.STORAGE_MODE === "aws"
    ? new S3Client({
        region: env.AWS_REGION,
        /*
          Local dev:
          - credentials come from ~/.aws/credentials or env vars.
          AWS production:
          - remove explicit credentials
          - use IAM Role attached to Lambda/ECS
        */
      })
    : null;

export async function createUploadTarget(params: {
  projectId: string;
  fileType: string;
  originalName: string;
  mimeType: string;
  fileId: string;
}) {
  const key = `projects/${params.projectId}/${params.fileType}/${params.fileId}__${safeName(
    params.originalName
  )}`;

  if (env.STORAGE_MODE === "aws") {
    // --- AWS WAY: direct-to-S3 upload via presigned PUT
    // In real AWS: bucket is private + blocked public access
    // Also recommended: SSE-KMS, object tagging, lifecycle rules
    const uploadUrl = await getSignedUrl(
      s3!,
      new PutObjectCommand({
        Bucket: env.FILES_BUCKET_NAME,
        Key: key,
        ContentType: params.mimeType,
      }),
      { expiresIn: env.PRESIGN_EXPIRES_SECONDS }
    );

    return { storageKey: key, uploadUrl, mode: "aws" as const };
  }

  // --- LOCAL WAY (works without AWS): upload through API to /uploads/<key>
  ensureUploadsDir();
  return {
    storageKey: key,
    uploadUrl: `/projects/${params.projectId}/files/${params.fileId}/upload`, // our local upload endpoint
    mode: "local" as const,
  };
}

export async function createDownloadUrl(params: {
  storageKey: string;
  originalName: string;
  projectId: string;
  fileId: string;
}) {
  if (env.STORAGE_MODE === "aws") {
    const downloadUrl = await getSignedUrl(
      s3!,
      new GetObjectCommand({
        Bucket: env.FILES_BUCKET_NAME,
        Key: params.storageKey,
        ResponseContentDisposition: `attachment; filename="${encodeURIComponent(params.originalName)}"`,
      }),
      { expiresIn: env.PRESIGN_EXPIRES_SECONDS }
    );
    return { downloadUrl, mode: "aws" as const };
  }

  // LOCAL: download via API
  return {
    downloadUrl: `/projects/${params.projectId}/files/${params.fileId}/download`,
    mode: "local" as const,
  };
}

export function localWriteFile(storageKey: string, buffer: Buffer) {
  ensureUploadsDir();
  const filePath = path.join(uploadsDir, storageKey);
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(filePath, buffer);
  return filePath;
}

export function localReadFile(storageKey: string) {
  const filePath = path.join(uploadsDir, storageKey);
  if (!fs.existsSync(filePath)) return null;
  return filePath;
}

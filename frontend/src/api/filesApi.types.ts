export type CreateProjectRes = { id: string; name: string; created_at: string };

export type PresignUploadReq = {
  files: { originalName: string; fileType: string; mimeType: string; sizeBytes: number }[];
};

export type PresignUploadRes = {
  expiresInSeconds: number;
  items: { fileId: string; storageKey: string; uploadUrl: string; mode: "aws" | "local" }[];
};

export type FileRow = {
  id: string;
  project_id: string;
  original_name: string;
  file_type: string;
  mime_type: string;
  size_bytes: number;
  storage_key: string;
  status: string;
  created_at: string;
  uploaded_at: string | null;
};

export type PresignDownloadReq = { type?: string; fileIds?: string[] };

export type PresignDownloadRes = {
  expiresInSeconds: number;
  items: { fileId: string; originalName: string; fileType: string; downloadUrl: string; mode: "aws" | "local" }[];
};

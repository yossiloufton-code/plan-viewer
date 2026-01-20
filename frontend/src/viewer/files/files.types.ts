export type StorageMode = "aws" | "local";

export type Project = {
  id: string;
  name: string;
  created_at: string;
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

export type PresignedUploadItem = {
  fileId: string;
  storageKey: string;
  uploadUrl: string;
  mode: StorageMode;
};

export type PresignedDownloadItem = {
  fileId: string;
  originalName: string;
  fileType: string;
  downloadUrl: string;
  mode: StorageMode;
};

export type FilesState = {
  projectId: string;
  projectName: string;
  filterType: string;
  files: FileRow[];
  busy: boolean;
  error: string | null;
};

import { api } from "./http";
import type {
  CreateProjectRes,
  PresignUploadReq,
  PresignUploadRes,
  FileRow,
  PresignDownloadReq,
  PresignDownloadRes,
} from "./filesApi.types";

export const filesApi = {
  createProject(name: string) {
    return api<CreateProjectRes>("/projects", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
  },

  presignUpload(projectId: string, body: PresignUploadReq) {
    return api<PresignUploadRes>(`/projects/${projectId}/files/presign-upload`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  listFiles(projectId: string, type?: string) {
    const q = type ? `?type=${encodeURIComponent(type)}` : "";
    return api<FileRow[]>(`/projects/${projectId}/files${q}`);
  },

  presignDownload(projectId: string, body: PresignDownloadReq) {
    return api<PresignDownloadRes>(`/projects/${projectId}/files/presign-download`, {
      method: "POST",
      body: JSON.stringify(body),
    });
  },
};

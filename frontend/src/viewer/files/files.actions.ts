import { filesApi } from "../../api/filesApi";
import { putBinary } from "../../api/http";
import type { PresignedDownloadItem, PresignedUploadItem } from "./files.types";

function guessTypeFromName(name: string) {
  const parts = name.split(".");
  return (parts.length > 1 ? parts[parts.length - 1] : "bin").toLowerCase();
}

export async function actionCreateProject(projectName: string) {
  return filesApi.createProject(projectName);
}

export async function actionRefreshFiles(projectId: string, filterType?: string) {
  return filesApi.listFiles(projectId, filterType || undefined);
}

export async function actionPresignAndUpload(
  projectId: string,
  pickedFiles: FileList
): Promise<{ uploaded: number }> {
  const filesArray = Array.from(pickedFiles);

  const presigned = await filesApi.presignUpload(projectId, {
    files: filesArray.map((f) => ({
      originalName: f.name,
      fileType: guessTypeFromName(f.name),
      mimeType: f.type || "application/octet-stream",
      sizeBytes: f.size,
    })),
  });

  // Upload each file (works for aws + local)
  for (let i = 0; i < presigned.items.length; i++) {
    const item: PresignedUploadItem = presigned.items[i];
    const file = filesArray[i];
    await putBinary(item.uploadUrl, file);
  }

  return { uploaded: presigned.items.length };
}

export async function actionDownloadByType(
  projectId: string,
  filterType: string
): Promise<PresignedDownloadItem[]> {
  const resp = await filesApi.presignDownload(projectId, { type: filterType });
  return resp.items;
}

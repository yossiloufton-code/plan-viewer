import React, { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { FilesState } from "./files.types";
import {
  actionCreateProject,
  actionDownloadByType,
  actionPresignAndUpload,
  actionRefreshFiles,
} from "./files.actions";

type FilesContextValue = FilesState & {
  setProjectName: (v: string) => void;
  setProjectId: (v: string) => void;
  setFilterType: (v: string) => void;

  createProject: () => Promise<void>;
  refreshFiles: () => Promise<void>;
  uploadFiles: (files: FileList | null) => Promise<void>;
  downloadByType: () => Promise<void>;
  clearError: () => void;
};

const FilesContext = createContext<FilesContextValue | null>(null);

const initialState: FilesState = {
  projectId: "",
  projectName: "Project A",
  filterType: "",
  files: [],
  busy: false,
  error: null,
};

export function FilesProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<FilesState>(initialState);

  const setProjectName = useCallback((v: string) => setState((s) => ({ ...s, projectName: v })), []);
  const setProjectId = useCallback((v: string) => setState((s) => ({ ...s, projectId: v })), []);
  const setFilterType = useCallback((v: string) => setState((s) => ({ ...s, filterType: v })), []);
  const clearError = useCallback(() => setState((s) => ({ ...s, error: null })), []);

  const withBusy = async (fn: () => Promise<void>) => {
    setState((s) => ({ ...s, busy: true, error: null }));
    try {
      await fn();
    } catch (e: any) {
      setState((s) => ({ ...s, error: e?.message ?? String(e) }));
    } finally {
      setState((s) => ({ ...s, busy: false }));
    }
  };

  const createProject = useCallback(async () => {
    await withBusy(async () => {
      const p = await actionCreateProject(state.projectName);
      setState((s) => ({ ...s, projectId: p.id }));
    });
  }, [state.projectName]);

  const refreshFiles = useCallback(async () => {
    if (!state.projectId) return;
    await withBusy(async () => {
      const rows = await actionRefreshFiles(state.projectId, state.filterType);
      setState((s) => ({ ...s, files: rows }));
    });
  }, [state.projectId, state.filterType]);

  const uploadFiles = useCallback(
    async (files: FileList | null) => {
      if (!files?.length || !state.projectId) return;
      await withBusy(async () => {
        await actionPresignAndUpload(state.projectId, files);
        const rows = await actionRefreshFiles(state.projectId, state.filterType);
        setState((s) => ({ ...s, files: rows }));
      });
    },
    [state.projectId, state.filterType]
  );

  const downloadByType = useCallback(async () => {
    if (!state.projectId || !state.filterType) return;
    await withBusy(async () => {
      const items = await actionDownloadByType(state.projectId, state.filterType);
      for (const it of items) {
        const isAbs = /^https?:\/\//i.test(it.downloadUrl);
        const url = isAbs ? it.downloadUrl : `${import.meta.env.VITE_API_BASE_URL}${it.downloadUrl}`;
        window.open(url, "_blank");
      }
    });
  }, [state.projectId, state.filterType]);

  const value = useMemo<FilesContextValue>(
    () => ({
      ...state,
      setProjectName,
      setProjectId,
      setFilterType,
      createProject,
      refreshFiles,
      uploadFiles,
      downloadByType,
      clearError,
    }),
    [state, setProjectName, setProjectId, setFilterType, createProject, refreshFiles, uploadFiles, downloadByType, clearError]
  );

  return <FilesContext.Provider value={value}>{children}</FilesContext.Provider>;
}

export function useFilesContext() {
  const ctx = useContext(FilesContext);
  if (!ctx) throw new Error("useFilesContext must be used inside FilesProvider");
  return ctx;
}

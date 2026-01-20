import React, { createContext, useCallback, useMemo, useRef, useState } from "react";
import type { ImageSize, LogEntry, ViewerTransform } from "./types";

type ViewerContextValue = {
  // transform
  transform: ViewerTransform;
  setTransform: React.Dispatch<React.SetStateAction<ViewerTransform>>;

  // image + viewport sizes
  imageSize: ImageSize | null;
  setImageSize: React.Dispatch<React.SetStateAction<ImageSize | null>>;
  viewportSize: { width: number; height: number };
  setViewportSize: React.Dispatch<React.SetStateAction<{ width: number; height: number }>>;

  // logs
  logs: LogEntry[];
  addLog: (entry: Omit<LogEntry, "id" | "timestamp"> & { timestamp?: number }) => void;
  clearLogs: () => void;

  // helpers
  resetCenter: () => void;

  // pan bookkeeping (so we can log delta)
  panSessionRef: React.MutableRefObject<{
    active: boolean;
    startX: number;
    startY: number;
    startTx: number;
    startTy: number;
  }>;
};

export const ViewerContext = createContext<ViewerContextValue | null>(null);

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

export function ViewerProvider({ children }: { children: React.ReactNode }) {
  const [transform, setTransform] = useState<ViewerTransform>({ scale: 1, tx: 0, ty: 0 });
  const [imageSize, setImageSize] = useState<ImageSize | null>(null);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });
  const [logs, setLogs] = useState<LogEntry[]>([]);

  const panSessionRef = useRef({
    active: false,
    startX: 0,
    startY: 0,
    startTx: 0,
    startTy: 0,
  });

  const addLog = useCallback(
    (entry: Omit<LogEntry, "id" | "timestamp"> & { timestamp?: number }) => {
      const ts = entry.timestamp ?? Date.now();
      const id = `${ts}-${Math.random().toString(16).slice(2)}`;
      setLogs((prev) => [{ id, timestamp: ts, type: entry.type, details: entry.details }, ...prev]);
    },
    []
  );

  const clearLogs = useCallback(() => setLogs([]), []);

  const resetCenter = useCallback(() => {
    setTransform((prev) => {
      const s = 1;

      if (!imageSize || viewportSize.width === 0 || viewportSize.height === 0) {
        // fallback: just reset transform
        return { scale: s, tx: 0, ty: 0 };
      }

      const tx = (viewportSize.width - imageSize.width * s) / 2;
      const ty = (viewportSize.height - imageSize.height * s) / 2;
      return { scale: s, tx, ty };
    });

    addLog({ type: "reset_center", details: "Reset view to centered (scale=1)" });
  }, [addLog, imageSize, viewportSize.height, viewportSize.width]);

  const value = useMemo(
    () => ({
      transform,
      setTransform,
      imageSize,
      setImageSize,
      viewportSize,
      setViewportSize,
      logs,
      addLog,
      clearLogs,
      resetCenter,
      panSessionRef,
    }),
    [transform, imageSize, viewportSize, logs, addLog, clearLogs, resetCenter]
  );

  return <ViewerContext.Provider value={value}>{children}</ViewerContext.Provider>;
}

export const viewerClamp = clamp;

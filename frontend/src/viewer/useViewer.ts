import { useContext } from "react";
import { ViewerContext } from "./ViewerContext";

export function useViewer() {
  const ctx = useContext(ViewerContext);
  if (!ctx) throw new Error("useViewer must be used within <ViewerProvider />");
  return ctx;
}

import React from "react";
import { ViewerProvider } from "../../viewer/ViewerContext";
import { FilesProvider } from "../../viewer/files/FilesContext";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <ViewerProvider>
      <FilesProvider>{children}</FilesProvider>
    </ViewerProvider>
  );
}

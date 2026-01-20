export type ActionType = "zoom_in" | "zoom_out" | "pan_start" | "pan_end" | "reset_center";

export type LogEntry = {
  id: string;
  timestamp: number;
  type: ActionType;
  details?: string;
};

export type ViewerTransform = {
  scale: number;
  tx: number;
  ty: number;
};

export type ImageSize = {
  width: number;
  height: number;
};

import type { Request, Response, NextFunction } from "express";

export function errorMiddleware(err: any, _req: Request, res: Response, _next: NextFunction) {
  res.status(err.statusCode ?? 500).json({ message: err.message ?? "Internal Server Error" });
}

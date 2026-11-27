import type { ErrorRequestHandler, RequestHandler } from "express";

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({
    success: false,
    error: { code: "ROUTE_NOT_FOUND", message: "The requested resource was not found." }
  });
};

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  const candidate = error as { statusCode?: number; code?: string; message?: string };
  const status = Number.isInteger(candidate?.statusCode) && (candidate.statusCode as number) >= 400
    ? candidate.statusCode as number
    : 500;
  const code = status === 500 ? "INTERNAL_SERVER_ERROR" : candidate.code ?? "REQUEST_FAILED";
  const message = status === 500 ? "An unexpected error occurred." : candidate.message ?? "The request could not be completed.";
  res.status(status).json({ success: false, error: { code, message } });
};

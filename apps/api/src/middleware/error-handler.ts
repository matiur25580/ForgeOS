import type { ErrorRequestHandler, RequestHandler } from "express";
import { ZodError } from "zod";

export const notFoundHandler: RequestHandler = (_req, res) => {
  res.status(404).json({ success: false, error: { code: "ROUTE_NOT_FOUND", message: "The requested resource was not found." } });
};

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, next) => {
  if (res.headersSent) { next(error); return; }
  if (typeof error === "object" && error !== null && "code" in error && error.code === 11000) {
    res.status(409).json({ success: false, error: { code: "RESOURCE_CONFLICT", message: "A record with that unique value already exists." } });
    return;
  }
  if (error instanceof ZodError) {
    res.status(400).json({ success: false, error: { code: "VALIDATION_ERROR", message: "The request contains invalid or unsupported fields.", issues: error.issues.map(issue => ({ path: issue.path.join("."), message: issue.message })) } });
    return;
  }
  if (typeof error === "object" && error !== null && "name" in error && error.name === "ValidationError") {
    res.status(400).json({ success: false, error: { code: "MODEL_VALIDATION_ERROR", message: "The supplied data failed validation." } });
    return;
  }
  const candidate = error as { status?: number; statusCode?: number; code?: string; message?: string };
  const candidateStatus = candidate?.status ?? candidate?.statusCode;
  const status = Number.isInteger(candidateStatus) && (candidateStatus as number) >= 400 && (candidateStatus as number) <= 599 ? candidateStatus as number : 500;
  const code = status === 500 ? "INTERNAL_SERVER_ERROR" : candidate.code ?? "REQUEST_FAILED";
  const message = status >= 500 ? "An unexpected error occurred." : candidate.message ?? "The request could not be completed.";
  res.status(status).json({ success: false, error: { code, message } });
};

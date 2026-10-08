import type { Response } from "express";

export interface ApiResponseSuccess<T = any> {
  success: true;
  data: T;
  meta?: {
    total?: number;
    page?: number;
    limit?: number;
    count?: number;
    timestamp?: string;
  };
}

export interface ApiResponseError {
  success: false;
  error: {
    code: string;
    message: string;
    details?: any;
    timestamp: string;
  };
}

export function sendSuccess<T = any>(
  res: Response,
  data: T,
  meta?: ApiResponseSuccess<T>["meta"],
  statusCode: number = 200
) {
  const payload: ApiResponseSuccess<T> = {
    success: true,
    data,
    meta: {
      ...meta,
      timestamp: new Date().toISOString()
    }
  };
  return res.status(statusCode).json(payload);
}

export function sendError(
  res: Response,
  code: string,
  message: string,
  statusCode: number = 400,
  details?: any
) {
  const payload: ApiResponseError = {
    success: false,
    error: {
      code,
      message,
      ...(details ? { details } : {}),
      timestamp: new Date().toISOString()
    }
  };
  return res.status(statusCode).json(payload);
}

export function sendValidationError(res: Response, errors: string[] | Record<string, string>) {
  return sendError(
    res,
    "VALIDATION_ERROR",
    Array.isArray(errors) ? errors.join("; ") : "Input validation failed",
    422,
    errors
  );
}

export function sendUnauthorized(res: Response, message: string = "Authentication required") {
  return sendError(res, "UNAUTHORIZED", message, 401);
}

export function sendForbidden(res: Response, message: string = "Access denied") {
  return sendError(res, "FORBIDDEN", message, 403);
}

export function sendNotFound(res: Response, resource: string = "Resource") {
  return sendError(res, "NOT_FOUND", `${resource} not found`, 404);
}

export function sendInternalError(res: Response, message: string = "An internal server error occurred") {
  return sendError(res, "INTERNAL_SERVER_ERROR", message, 500);
}

import Elysia from "elysia";
import z from "zod";
import { logger } from "@coordinator/plugins/logger";

class CustomError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public data?: any,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const ErrorResponseSchema = z.object({
  error: z.string().optional(),
  message: z.string(),
  statusCode: z.number(),
  errorCode: z.string().nullish(),
  data: z.unknown().nullish(),
  timestamp: z.iso.datetime({ offset: true }),
  path: z.string(),
});

export const standartErrorResPlugin = new Elysia({
  name: "@nonpolar/globalStandardErrorRes",
}).macro({
  withStandardErrors: {
    response: {
      400: ErrorResponseSchema,
      401: ErrorResponseSchema,
      403: ErrorResponseSchema,
      404: ErrorResponseSchema,
      500: ErrorResponseSchema,
      422: ErrorResponseSchema,
    },
  },
});

export const errorPlugin = new Elysia({ name: "@nonpolar/globalErrorHandler" })
  .error("CUSTOM_ERROR", CustomError)
  .onError({ as: "global" }, ({ code, set, error, path }) => {
    logger.error({ code, error, path });
    switch (code) {
      case "CUSTOM_ERROR":
        set.status = error.statusCode;
        return {
          error: error.name,
          message: error.message,
          statusCode: error.statusCode,
          data: error.data,
          timestamp: new Date().toISOString(),
          path: path,
        };
      case "NOT_FOUND":
        set.status = error.status;
        return {
          error: "NotFound",
          message: `Cannot get ${path}`,
          statusCode: error.status,
          timestamp: new Date().toISOString(),
          path: path,
        };
      case "INTERNAL_SERVER_ERROR":
        set.status = error.status;
        return {
          error: error.name,
          message: error.message,
          statusCode: error.status,
          timestamp: new Date().toISOString(),
          path: path,
        };
      case "VALIDATION": {
        set.status = error.status;
        return {
          error: error.name,
          message: error.detail(error.message, true), // validate the effect of exposing this in prod
          statusCode: error.status,
          timestamp: new Date().toISOString(),
          path: path,
        };
      }
      case "UNKNOWN": {
        set.status = 500;
        return {
          error: error.name,
          message: error.message,
          statusCode: 500,
          timestamp: new Date().toISOString(),
          path: path,
        };
      }
      case "PARSE": {
        set.status = error.status;
        return {
          error: error.name,
          message: error.message,
          statusCode: error.status,
          timestamp: new Date().toISOString(),
          path: path,
        };
      }
      case "INVALID_COOKIE_SIGNATURE": {
        set.status = error.status;
        return {
          error: error.name,
          message: error.message,
          statusCode: error.status,
          timestamp: new Date().toISOString(),
          path: path,
        };
      }
      case "INVALID_FILE_TYPE": {
        set.status = error.status;
        return {
          error: error.name,
          message: error.message,
          statusCode: error.status,
          timestamp: new Date().toISOString(),
          path: path,
        };
      }
      default: {
        set.status = error.code;
        return {
          message: error.response,
          statusCode: error.code,
          timestamp: new Date().toISOString(),
          path: path,
        };
      }
    }
  });

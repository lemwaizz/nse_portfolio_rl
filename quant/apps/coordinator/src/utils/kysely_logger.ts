import type { LogEvent } from "kysely";
import type { Logger } from "pino";

export const kyselyLogger = (
  event: LogEvent,
  logger: Logger,
  logParams = false,
) => {
  if (event.level === "error") {
    logger.error({
      message: "Query failed",
      durationMs: event.queryDurationMillis,
      error: event.error,
      sql: event.query.sql,
      ...(logParams && { params: event.query.parameters }),
    });
  } else {
    logger.trace({
      message: "Query executed",
      durationMs: event.queryDurationMillis,
      sql: event.query.sql,
      // Add https://www.npmjs.com/package/maskdata to mask sensitive data
      ...(logParams && { params: event.query.parameters }),
    });
  }
};

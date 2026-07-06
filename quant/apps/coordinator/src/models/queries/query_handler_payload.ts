import type { Logger } from "pino";
import { QuantDb } from "@coordinator/prisma/kysely/database";

export type BaseQueryHandlerPayload<T> = {
  data: T;
  db: QuantDb.DatabaseConnection;
  log?: Logger;
};

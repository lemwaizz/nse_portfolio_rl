import Elysia from "elysia";
import { Pool } from "pg";
import { QuantDb } from "@coordinator/prisma/kysely/database";
import { PostgresDialect } from "kysely";
import { envConfigPlugin, logger } from "@coordinator/plugins";
import { kyselyLogger } from "@coordinator/utils/kysely_logger";

export const mainPool = new Pool({
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DB,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
});

export const pgPoolPlugin = new Elysia({ name: "@nonpolar/pg_pool" }).decorate(
  () => {
    return {
      pgPool: mainPool,
    };
  },
);

export const kyselyDbPlugin = new Elysia({ name: "@nonpolar/kysely_db" })
  .use(envConfigPlugin)
  .decorate(({ env }) => {
    return {
      db: new QuantDb.DatabaseAdapter({
        log: (event) =>
          kyselyLogger(event, logger, env.NODE_ENV === "development"),
        dialect: new PostgresDialect({
          pool: mainPool,
        }),
      }),
    };
  });

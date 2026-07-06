import cors from "@elysiajs/cors";
import { Elysia } from "elysia";
import { apiModule } from "@coordinator/api/api.module";
import { authMountPlugin } from "@coordinator/services/auth/server_auth";
import { logger } from "@coordinator/plugins";
import { errorPlugin } from "@coordinator/error/error_plugin";

const app = new Elysia()
  .use(errorPlugin)
  .use(
    cors({
      origin: [
        "http://192.168.100.54:6060/",
        "http://localhost:3000",
        "http://localhost:3020",
        "http://localhost:3030",
      ],
      credentials: true,
    }),
  )
  .use(authMountPlugin)
  // .use(apiModule)
  .group("/api", (app) => app.use(apiModule))
  .onStart(async ({ decorator: {} }) => {
    logger.info("MAIN MODULE INITIALIZED");
  })
  .onStop(async ({ decorator: {} }) => {
    logger.info(`ENDING`);
  })
  .listen(3010);

export type App = typeof app;

logger.info(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);

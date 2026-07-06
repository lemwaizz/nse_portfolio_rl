import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "src/prisma/schema",
  migrations: {
    path: "src/prisma/schema/migrations",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});

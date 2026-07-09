import { env } from "@yolk-oss/elysia-env";
import { t } from "elysia";

export const envConfigPlugin = env(
  {
    POSTGRES_HOST: t.String(),
    POSTGRES_PORT: t.String(),
    POSTGRES_USER: t.String(),
    POSTGRES_PASSWORD: t.String(),
    POSTGRES_DB: t.String(),

    NODE_ENV: t.Optional(t.String()),

    BETTER_AUTH_SECRET: t.Optional(t.String()),

    GOOGLE_GEMINI_API_KEY: t.String(),
    QUANT_RECOMMENDER_ENDPOINT: t.String(),
    BETTER_AUTH_URL: t.String(),
    GOOGLE_CLIENT_ID: t.String(),
    GOOGLE_CLIENT_SECRET: t.String(),
    OPENAI_API_KEY: t.String(),
  },
  {
    onSuccess: (env) => {
      if (env.NODE_ENV === "development")
        console.log("Successfully loaded environment variables:", env);
    },
  },
);

import { betterAuth } from "better-auth";
import { admin, openAPI } from "better-auth/plugins";
import { Elysia } from "elysia";
import { mainPool } from "@coordinator/services/persistence/main_pg_db.provider";

export const auth = betterAuth({
  database: mainPool,
  baseURL: process.env.BETTER_AUTH_URL,
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
      redirectURI: `${process.env.BETTER_AUTH_URL}/api/auth/v1/callback/google`,
    },
  },
  basePath: "/v1",
  trustedOrigins: [
    "http://192.168.100.54:6060",
    "http://localhost:3000",
    "http://localhost:3020",
    "http://localhost:3030",
    "https://quant.lewynation.dev",
  ],
  emailAndPassword: {
    enabled: true,
  },
  telemetry: {
    enabled: false,
  },
  advanced: {
    cookiePrefix: "quant-auth",
    crossSubDomainCookies: {
      enabled: false,
    },
    useSecureCookies: false, // TODO: Change in prod
    defaultCookieAttributes: {
      path: "/",
      httpOnly: true,
      secure: false, // change in prod
    },
  },
  plugins: [openAPI({ theme: "kepler" }), admin()],
});

export const authMountPlugin = new Elysia({
  name: "@quant/authHandlers",
}).mount("/api/auth", auth.handler);

export const authInjectionPlugin = new Elysia({
  name: "@quant/authInjection",
}).decorate("auth", auth);

export const authGuardPlugin = new Elysia({ name: "@quant/authGuard" })
  .use(authInjectionPlugin)
  .macro({
    auth: {
      async resolve({ status, request: { headers }, auth }) {
        const session = await auth.api.getSession({
          headers,
        });
        if (!session) return status(401);
        return {
          user: session.user,
          session: session.session,
        };
      },
    },
  });

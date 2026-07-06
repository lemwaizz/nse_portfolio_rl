import { createAuthClient } from "better-auth/react";
import { adminClient } from "better-auth/client/plugins";
import { nextCookies } from "better-auth/next-js";

const isServerComponent = typeof window === "undefined";
const isLocalDev =
  process.env.NEXT_PUBLIC_IS_LOCAL_DEV != undefined
    ? Boolean(process.env.NEXT_PUBLIC_IS_LOCAL_DEV)
    : false;

export const authClient = createAuthClient({
  baseURL: isServerComponent
    ? "http://localhost:3010/api/auth/v1"
    : isLocalDev
      ? "http://localhost:3010/api/auth/v1"
      : `${window.location.origin}/api/auth/v1`,
  plugins: [adminClient(), nextCookies()],
});

import type { App } from "@coordinator/index";
import { treaty } from "@elysiajs/eden";

const isServerComponent = typeof window === "undefined";
const isLocalDev =
  process.env.NEXT_PUBLIC_IS_LOCAL_DEV != undefined
    ? Boolean(process.env.NEXT_PUBLIC_IS_LOCAL_DEV)
    : false;

export const apiClient = isServerComponent
  ? treaty<App>("localhost:3010", {
      fetch: {
        credentials: "include",
      },
    })
  : treaty<App>(isLocalDev ? "localhost:3010" : `${window.location.origin}`, {
      fetch: {
        credentials: "include",
      },
    });

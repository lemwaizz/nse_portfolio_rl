"use client";

import dynamic from "next/dynamic";
// import { ThemeProvider as NextThemesProvider } from "@teispace/next-themes";
import { type ThemeProviderProps } from "@teispace/next-themes";

const NextThemesProvider = dynamic(
  () => import("@teispace/next-themes").then((e) => e.ThemeProvider),
  {
    ssr: false,
  },
);

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

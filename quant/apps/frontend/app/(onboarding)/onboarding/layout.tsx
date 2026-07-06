import { authClient } from "@clients/index";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";

const Layout = async ({ children }: { children: React.ReactNode }) => {
  const { data } = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });
  if (!data?.user) {
    redirect("/");
  }
  return (
    <>
      <>{children}</>
    </>
  );
};

export default Layout;

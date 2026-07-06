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
  if (data?.user.role != "admin") {
    redirect("/dashboard");
  }
  return (
    <>
      <>{children}</>
    </>
  );
};

export default Layout;

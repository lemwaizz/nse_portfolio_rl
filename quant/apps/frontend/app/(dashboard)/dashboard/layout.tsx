import { AppSidebar } from "@frontend/components/layout/side_bar";
import NavigationBreadcrumbs from "@frontend/components/layout/bread_crumbs";
import { Separator } from "@frontend/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@frontend/components/ui/sidebar";
import { authClient } from "@clients/index";
import { redirect } from "next/navigation";
import { headers } from "next/headers";
import Footer from "@/apps/frontend/components/shared/footer";

const DashboardPageLayout = async ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data } = await authClient.getSession({
    fetchOptions: {
      headers: await headers(),
    },
  });
  if (!data?.user) {
    redirect("/");
  }
  return (
    <SidebarProvider>
      <AppSidebar
        user={{
          name: data.user.name,
          email: data.user.email,
          image: data.user.image,
          role: data.user.role,
        }}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <NavigationBreadcrumbs />
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4">
          <div className="p-4 pt-0 mb-4">{children}</div>
          <Footer />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default DashboardPageLayout;

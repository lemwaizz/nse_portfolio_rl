"use client";

import * as React from "react";
import {
  Building2,
  DatabasePlus,
  ReplyAll,
  ThumbsUp,
  UserRoundPen,
  Wallet,
} from "lucide-react";

import { NavMain } from "@frontend/components/layout/nav_main";
import { NavUser } from "@frontend/components/layout/nav_user";
import { TeamSwitcher } from "@frontend/components/layout/team_switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@frontend/components/ui/sidebar";

const data = {
  navMain: [
    {
      title: "Portfolio",
      url: "",
      icon: Wallet,
      isActive: true,
    },
    {
      title: "Risk Profile",
      url: "risk-profile",
      icon: UserRoundPen,
    },
    {
      title: "Feedback",
      url: "feedback",
      icon: ThumbsUp,
    },
  ],
  navAdmin: [
    {
      title: "Companies",
      url: "companies",
      icon: Building2,
    },
    {
      title: "Feedback Responses",
      url: "feed-responses",
      icon: ReplyAll,
    },
    {
      title: "Dataset",
      url: "data",
      icon: DatabasePlus,
    },
  ],
};

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar> & {
  user: {
    name: string;
    image?: string | null;
    email: string;
    role?: string | null;
  };
}) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <TeamSwitcher />
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} navTitle="Platform" />
        {props.user.role === "admin" && (
          <NavMain items={data.navAdmin} navTitle="Admin" />
        )}
      </SidebarContent>
      <SidebarFooter>
        <NavUser
          user={{
            name: props.user.name,
            email: props.user.email,
            avatar: props.user.image,
          }}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

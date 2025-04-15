"use client"

import {
  Command,
  EllipsisVerticalIcon,
  Users
} from "lucide-react";
import * as React from "react";

import { NavUser } from "@/components/sidebar/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator
} from "@/components/ui/sidebar";

import Link from "next/link";
import NavChats from "./nav-chats";
import { Button } from "../ui/button";
import { ResizablePanel } from "../ui/resizable";
import { PromtuzLogo } from "../logo";
import SidebarLink from "./sidebar-link";

export function AppSidebar({ ...props }: React.ComponentProps<typeof ResizablePanel> & React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar variant="inset" {...props}>
      <SidebarHeader>
        <div className="py-3 px-2 flex items-center gap-3.5">
          <div className="flex aspect-square size-7 items-center justify-center">
            {/* <Command className="size-4" /> */}
            <PromtuzLogo />
          </div>
          <Link className="flex-1" href="/app">
            <div className="grid text-center text-lg">
              <span className="truncate font-black">Promtuz</span>
            </div>
          </Link>
          <Button size="icon" variant={'ghost'} className="rounded-2xl">
            <EllipsisVerticalIcon />
          </Button>
        </div>
      </SidebarHeader>
      {/* <SidebarRail /> */}
      <SidebarContent>
        {/* <SidebarSearch /> */}

        <NavChats />

        <SidebarGroup className="mt-auto">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                asChild
                className="justify-between rounded-md [&_svg]:size-3.5"
              >
                <SidebarLink href={'/app/friends'}>
                  <Users />

                  <span className="text-xs font-medium mr-auto">FRIENDS</span>
                </SidebarLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

      </SidebarContent>
      <SidebarFooter>
        <SidebarSeparator />
        <NavUser />
      </SidebarFooter>
    </Sidebar>
  )
}


export function RightSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  // return <ResizablePanel>
  return <Sidebar variant="inset" className="w-96 flex" {...props}>
    <div className="p-2 w-full h-screen flex items-center justify-center">
      <h1>Usefull Stuff comes here</h1>
    </div>
  </Sidebar>
  {/* </ResizablePanel> */ }
}
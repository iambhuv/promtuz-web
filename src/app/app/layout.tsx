// "use client";

import Notifications from "@/components/notification";
import NotitificationCounter from "@/components/notification-counter";
import { AppSidebar, RightSidebar } from "@/components/sidebar/app-sidebar";
import StoreLoader from "@/components/store-loader";
import {
  SidebarInset,
  SidebarProvider
} from "@/components/ui/sidebar";


import { cookies, headers } from "next/headers";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookie = await cookies();
  const pathname = (await headers()).get('x-pathname')!

  return <StoreLoader token={cookie.get("token")?.value}>
    <SidebarProvider defaultMobile={pathname == "/app"}>
      <Notifications />
      <NotitificationCounter />
      <AppSidebar />
      <SidebarInset>
        {children}
      </SidebarInset>
      <RightSidebar side="right" collapsible="none" className="w-96 max-2xl:hidden" />
    </SidebarProvider>
  </StoreLoader >
}

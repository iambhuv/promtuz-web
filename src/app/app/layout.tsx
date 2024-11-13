// "use client";

import { AppSidebar, RightSidebar } from "@/components/sidebar/app-sidebar";
import StoreLoader from "@/components/store-loader";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "@/components/ui/resizable";
import {
  SidebarInset,
  SidebarProvider
} from "@/components/ui/sidebar";


import { cookies } from "next/headers";

export default async function AppLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookie = await cookies();

  return <StoreLoader token={cookie.get("token")?.value}>
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        {children}
      </SidebarInset>
      <RightSidebar side="right" collapsible="none" className="w-96 max-2xl:hidden" />
    </SidebarProvider>
  </StoreLoader >
}

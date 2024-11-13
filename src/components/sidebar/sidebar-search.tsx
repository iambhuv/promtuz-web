"use client";

import { Input } from "../ui/input";
import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuItem } from "../ui/sidebar";

const SidebarSearch = () => {
  return <SidebarGroup>
    <SidebarGroupContent>
      <SidebarMenu>
        <SidebarMenuItem>
          <Input placeholder="Search messages..." />
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroupContent>
  </SidebarGroup>
}


export default SidebarSearch;
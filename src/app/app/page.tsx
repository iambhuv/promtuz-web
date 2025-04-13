"use client";

import { Separator } from "@/components/ui/separator";
import {
  SidebarTrigger
} from "@/components/ui/sidebar";
// Import the functions you need from the SDKs you need


export default function App() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0 items-center justify-center">
        <h1 className="text-3xl font-semibold">Quite Lonely?</h1>
        <h2 className="text-2xl font-semibold">Select any friend to chat!</h2>
      </div>
    </>
  )
}

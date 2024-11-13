import React from 'react'
import { SidebarTrigger } from '../ui/sidebar'
import { Separator } from '../ui/separator'
import { User } from '@/store/store'

export const ChatHeader = ({ user }: { user: User }) => {
  return (
    <header className="flex h-12 shrink-0 gap-2 border-b">
      <div className="flex items-center gap-2 px-4">
        {/* <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" /> */}
        <h1 className="font-medium flex gap-3 items-baseline">
          <span>{user.display_name}</span>
          <span className='text-muted-foreground cursor-pointer text-sm'>@{user.username}</span>
        </h1>
      </div>
    </header>
  )
}

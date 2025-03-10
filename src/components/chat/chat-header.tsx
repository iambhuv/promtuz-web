import React from 'react'
import { SidebarTrigger } from '../ui/sidebar'
import { Separator } from '../ui/separator'
import { User } from '@/store/store'
import { useStore } from '@/store'
import { beautifyLastSeen } from '@/lib/utils'

export const ChatHeader = ({ user }: { user: User }) => {
  const presence = useStore(store => store.presence.get(user.id));

  return (
    <header className="flex h-16 shrink-0 gap-2 border-b z-[9999]">
      <div className="flex items-center gap-2 px-4">
        {/* <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" /> */}
        <h1 className="font-medium flex flex-col   items-baseline">
          <span className='text-lg'>{user.display_name}</span>
          <span className='text-muted-foreground text-xs'>@{user.username} {presence && (presence.presence !== "OFFLINE" ? '• Online' : presence.lastSeen && `• Last Seen ${beautifyLastSeen(presence.lastSeen)}`)}</span>
        </h1>
      </div>
    </header>
  )
}

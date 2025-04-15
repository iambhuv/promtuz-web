import React, { useEffect, useMemo, useState } from 'react'
import { SidebarTrigger, useSidebar } from '../ui/sidebar'
import { Separator } from '../ui/separator'
import { Channel, User, UserID } from '@/types/store'
import { useStore } from '@/store'
import { beautifyLastSeen, createFallbackAvatar } from '@/lib/utils'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { motion, PanInfo, useDragControls } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { useIsMobile } from '@/hooks/useMobile'
import clsx from 'clsx'
import SwipeToBack from '../swipe-to-back'

export const ChatHeader = ({ channel }: { channel: Channel }) => {
  return channel.type == "DIRECT_MESSAGES" ? <DMChatHeader channel={channel} /> : <GroupChatHeader channel={channel} />
}


const DMChatHeader = ({ channel }: { channel: Channel }) => {
  const user = useStore(store => store.users.get(channel.members.find(m => m !== store.me.id) || ''));
  if (!user) return null;


  const presence = useStore(store => store.presence.get(user.id));


  return (
    <header className="flex h-16 shrink-0 gap-2 border-b z-99 items-center overflow-clip">
      <SwipeToBack className="flex items-center gap-2 px-3 flex-1 relative bg-background">
        <Avatar className="h-10 w-10 rounded-sm relative overflow-visible">
          {/* <AvatarImage src={user.avatar} alt={user.name} /> */}
          <AvatarFallback className="rounded-sm text-lg font-semibold text-muted-foreground">{createFallbackAvatar(user.display_name)}</AvatarFallback>
        </Avatar>
        <h1 className="font-medium flex flex-col items-baseline">
          <span className='text-lg'>{user.display_name}</span>
          <span className='text-muted-foreground text-xs'>@{user.username} {presence && (presence.presence !== "OFFLINE" ? '• Online' : presence.lastSeen && `• Last Seen ${beautifyLastSeen(presence.lastSeen)}`)}</span>
        </h1>
      </SwipeToBack>
    </header>
  )
}

const GroupChatHeader = ({ channel }: { channel: Channel }) => {
  const me = useStore(store => store.me)
  // const user_entries = useStore(store => channel.members.map(member => [member, store.users.get(member)!]));
  const users = useStore(store => store.users);

  const members = useMemo(() => channel.members.map(member => users.get(member)!), [users]);

  return (
    <header className="flex h-16 shrink-0 gap-2 border-b z-99 items-center overflow-clip">
      <SwipeToBack className="flex items-center gap-3 px-3.5">
        <Avatar className="h-10 w-10 rounded-sm relative overflow-visible">
          {/* <AvatarImage src={user.avatar} alt={user.name} /> */}
          <AvatarFallback className="rounded-sm text-lg font-semibold text-muted-foreground">{createFallbackAvatar(channel.name)}</AvatarFallback>
        </Avatar>
        <h1 className="font-medium flex flex-col items-baseline">
          <span className='text-lg'>{channel.name}</span>
          <span className='text-muted-foreground text-xs'>
            {/* {members.map(member => `@${member.username}`)} */}
            {members.map(member => `${member?.display_name}`).join(", ")}
          </span>
        </h1>
      </SwipeToBack>
    </header>
  )
}
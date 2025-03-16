import { cn, createFallbackAvatar, parseMessageDate, shouldMessageShowTime } from '@/lib/utils'
import { useStore } from '@/store'
import Link from 'next/link'
import React, { memo, useCallback, useEffect, useMemo } from 'react'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '../ui/context-menu'
import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '../ui/sidebar'
import { Channel } from '@/store/store'
import { Skeleton } from '../ui/skeleton'
import { useChatStore } from '@/store/chat'
import { serializeToString } from '../chat/chat-input'

const NavChats = () => {
  const messages = useStore(store => store.messages);
  const channels = useStore(store => store.channels);

  const sortChannelsByCreatedAt = useCallback((ch1: Channel, ch2: Channel) => {
    // Get first message more efficiently
    const ch1Messages = messages?.[ch1.id];
    const ch2Messages = messages?.[ch2.id];

    const ch1_latest = ch1Messages && Object.values(ch1Messages)[0]?.created_at;
    const ch2_latest = ch2Messages && Object.values(ch2Messages)[0]?.created_at;

    // Cache dates to avoid multiple conversions
    const date1 = new Date(ch1_latest || ch1.last_message?.created_at || ch1.created_at).getTime();
    const date2 = new Date(ch2_latest || ch2.last_message?.created_at || ch2.created_at).getTime();

    return date2 - date1;
  }, [messages, channels])


  const channelsArray = useMemo(() => Object.values(channels || {}), [channels]);
  const channel_list = useMemo(() => channelsArray.sort(sortChannelsByCreatedAt), [channels, messages]);

  return (
    <SidebarGroup style={{ '--custom-scrollbar-bg': 'hsl(var(--sidebar-background))' } as React.CSSProperties} className='overflow-y-auto sidebar-inset-scrollarea flex-1'>
      <SidebarMenu className='gap-0.5'>
        {channel_list.map((channel) => {
          return <SidebarMenuItem key={channel.id}><NavChat channel={channel} /></SidebarMenuItem>
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

const NavChat = memo(({ channel }: { channel: Channel }) => {
  const me = useStore(store => store.me)

  // @ts-expect-error
  const user_id = channel.members.find(id => (id?.id || id) !== me.id);
  
  if (!user_id) return;
  
  // @ts-expect-error
  const user = useStore(store => store.users.get(user_id?.id || user_id))
  
  if (!user) return;

  const latest_last_message = useStore(store => store.messages?.[channel.id]?.[Object.keys(store.messages[channel.id])[0]!]);
  const last_message = latest_last_message || channel.last_message;

  const status = useStore(store => store.chat_status[channel.id]?.[user_id])
  const activeChannel = useStore(store => store.activeChannel)

  const draft = serializeToString(useChatStore(state => state.getInputContent(channel.id)));


  const presence = useStore(store => store.presence.get(user_id))

  return <ContextMenu modal={false}>
    <ContextMenuTrigger asChild>
      <SidebarMenuButton
        size="default"
        asChild
        className='p-1 box-content h-8'
      >
        <Link href={`/app/chats/${channel.id}`} className='data-[state="open"]:bg-sidebar-accent'>
          <Avatar className="h-8 w-8 rounded-sm relative overflow-visible">
            {/* <AvatarImage src={user.avatar} alt={user.name} /> */}
            <AvatarFallback className="rounded-sm text-sm font-semibold text-muted-foreground">{createFallbackAvatar(user.display_name)}</AvatarFallback>

            {presence && presence.presence !== 'OFFLINE' && <span className="size-2 bg-[#23a55a] rounded-full absolute bottom-0 right-0"></span>}
          </Avatar>
          <div className="grid flex-1 text-left leading-tight">
            <div className={cn('truncate text-[0.8rem] font-semibold', !channel.unread_message_count && 'text-muted-foreground')}>{user.display_name}
              {channel.unread_message_count > 0 ?
                <div className='size-5 float-right text-[.55rem] truncate font-medium rounded-full flex items-center justify-center bg-primary'>
                  <span className='pt-[1px]'>{channel.unread_message_count > 99 ? '99+' : channel.unread_message_count}</span>
                </div>
                : null}
            </div>

            {
              status == 'TYPING' ?
                <div className={cn('flex items-center gap-1.5 text-[.65rem]', !channel.unread_message_count && 'text-muted-foreground')}>
                  <span className="flex gap-0.5">
                    <Skeleton className='size-1 rounded-full bg-white/50' />
                    <Skeleton className='size-1 rounded-full bg-white/50' />
                    <Skeleton className='size-1 rounded-full bg-white/50' />
                  </span>
                  Typing...</div>
                : <span className={cn('truncate text-[.65rem]', !channel.unread_message_count && 'text-muted-foreground')}>
                  {
                    draft && activeChannel !== channel.id ?
                      <span><strong>DRAFT:</strong> {draft}</span>
                      : last_message?.content || ((last_message && !last_message?.content)
                        ? <i>Sent an Attachment</i> : '')}
                </span>
            }
          </div>
        </Link>
      </SidebarMenuButton>
    </ContextMenuTrigger>
    <ContextMenuContent className="w-44">
      <ContextMenuItem>Profile</ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem>Copy User ID</ContextMenuItem>
      <ContextMenuItem>Copy Channel ID</ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
})

export default NavChats
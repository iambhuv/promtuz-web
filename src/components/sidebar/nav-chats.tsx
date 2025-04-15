import { cn, createFallbackAvatar } from '@/lib/utils'
import { useStore } from '@/store'
import { useChatStore } from '@/store/chat'
import { Channel, User, UserID } from '@/types/store'
import Link from 'next/link'
import React, { memo, useCallback, useEffect, useMemo, useRef } from 'react'
import { serializeToString } from '../chat/chat-input'
import { Avatar, AvatarFallback } from '../ui/avatar'
import { ContextMenu, ContextMenuContent, ContextMenuItem, ContextMenuSeparator, ContextMenuTrigger } from '../ui/context-menu'
import { SidebarGroup, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '../ui/sidebar'
import { Skeleton } from '../ui/skeleton'
import { usePathname, useRouter } from 'next/navigation'
import { useIsMobile } from '@/hooks/useMobile'
import SidebarLink from './sidebar-link'

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


  // const channelsArray = useMemo(() => Object.values(channels || {}), [channels]);
  const channel_list = useMemo(() => [...channels.values()].sort(sortChannelsByCreatedAt), [channels, messages]);



  const path = usePathname();
  const prevPathRef = useRef(path);
  const sidebar = useSidebar();

  useEffect(() => {
    if (prevPathRef.current !== path) {
      prevPathRef.current = path;
      if (sidebar.isMobile && sidebar.open) {
        console.log("UPDAET");

        sidebar.setOpenMobile(false)
      }
    }
  }, [path])


  return (
    <SidebarGroup style={{ '--custom-scrollbar-bg': 'hsl(var(--sidebar-background))' } as React.CSSProperties} className='overflow-y-auto sidebar-inset-scrollarea flex-1 flex flex-col'>
      <SidebarMenu className='gap-0.5 flex-1'>
        {!channel_list.length ? <div className="flex items-center justify-center h-full flex-1 flex-col">
          <svg width="280" height="280" viewBox="0 0 280 280" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M101.791 242.485C116.648 251.44 127.247 247.723 131.304 240.542C139.151 226.655 165.241 198.258 206.587 188.66C261.347 175.948 249.912 142.196 216.248 124.484C182.585 106.773 157.414 82.2652 161.224 55.6178C165.033 28.9703 127.288 19.7841 110.502 71.0448C99.6544 104.171 80.215 113.046 67.8188 115.179C56.1357 117.19 43.3558 119.713 37.1237 129.797C29.5615 142.033 32.2003 154.411 63.8617 162.9C108.729 174.93 68.491 222.413 101.791 242.485Z" fill="#1B222C" />
            <path d="M63.1905 184.424C63.8193 184.064 70.9156 181.06 106.219 197.518C106.116 197.658 106.072 197.724 106.072 197.724C106.072 197.724 69.3711 210.084 62.1803 194.858C60.033 190.325 60.6483 187.203 63.1292 184.459L63.1905 184.424Z" fill="#29384E" />
            <path d="M181.846 190.652C174.177 197.1 162.148 201.78 150.542 195.557C152.376 194.385 154.271 193.178 156.203 191.929C167.858 184.44 178.125 189.451 181.846 190.652Z" fill="#29384E" />
            <path d="M195.585 111.349C203.421 176.601 184.799 188.443 182.726 190.242C182.125 190.763 181.882 190.725 180.975 190.491L180.959 190.5C177.118 189.482 167.859 184.44 156.203 191.928C154.271 193.177 152.376 194.384 150.542 195.556C138.652 203.097 129.05 208.411 122.133 205.327C116.265 202.333 110.975 199.743 106.219 197.518C70.9157 181.06 63.8194 184.064 63.1907 184.424C63.9202 184.027 70.6126 180.317 79.6239 173.793C79.6545 173.776 79.6852 173.758 79.6918 173.734C91.7365 165.005 107.867 151.249 119.461 133.554C127.354 121.521 135.076 91.0171 149.975 85.0318C180.594 73.6092 194.314 98.0763 195.585 111.349Z" fill="#40649C" />
            <path d="M161.728 110.204C162.679 107.694 162.586 105.333 161.521 104.93C160.457 104.526 158.823 106.234 157.873 108.744C156.922 111.254 157.015 113.615 158.079 114.018C159.144 114.422 160.778 112.714 161.728 110.204Z" fill="black" />
            <path d="M181.224 113.406C181.898 110.808 181.551 108.471 180.449 108.185C179.346 107.899 177.907 109.774 177.233 112.371C176.56 114.969 176.907 117.307 178.009 117.593C179.111 117.878 180.551 116.004 181.224 113.406Z" fill="black" />
            <path d="M169.357 122.945C169.197 122.944 169.042 122.89 168.918 122.789C168.794 122.689 168.708 122.549 168.674 122.393C168.549 121.828 167.994 120.156 167.113 119.908C166.233 119.659 164.506 120.624 163.807 121.13C163.657 121.239 163.47 121.284 163.286 121.254C163.103 121.225 162.939 121.124 162.83 120.974C162.721 120.823 162.676 120.636 162.706 120.453C162.735 120.269 162.836 120.105 162.986 119.996C163.262 119.797 165.728 118.062 167.493 118.56C169.335 119.08 169.975 121.788 170.041 122.095C170.064 122.198 170.063 122.304 170.039 122.406C170.015 122.507 169.968 122.603 169.902 122.684C169.837 122.765 169.754 122.831 169.659 122.876C169.565 122.921 169.461 122.945 169.357 122.945H169.357Z" fill="black" />
          </svg>
          <span className='text-primary-foreground/65'>Make some friends bruh</span>
        </div> : ''}
        {channel_list.map((channel) => {
          return <SidebarMenuItem key={channel.id}>
            {channel.type == "DIRECT_MESSAGES" ? <NavDMChat channel={channel} /> : <NavGroupChat channel={channel} />}
          </SidebarMenuItem>
        })}
      </SidebarMenu>
    </SidebarGroup>
  )
}

const NavDMChat = memo(({ channel }: { channel: Channel }) => {
  const me = useStore(store => store.me)

  // @ts-expect-error
  const user_id = channel.members.find(id => (id?.id || id) !== me.id);

  if (!user_id) return;

  // @ts-expect-error
  const user = useStore(store => store.users.get(user_id?.id || user_id))

  if (!user) return;

  const latest_last_message = useStore(store => store.messages?.[channel.id]?.[Object.keys(store.messages[channel.id])[0]!]);
  const last_message = latest_last_message || channel.last_message;

  const status = useStore(store => store.chatStatus[channel.id]?.[user_id])
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
        <SidebarLink href={`/app/chats/${channel.id}`} className='data-[state="open"]:bg-sidebar-accent'>
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
        </SidebarLink>
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

const NavGroupChat = memo(({ channel }: { channel: Channel }) => {
  const my_user_id = useStore(store => store.me.id);

  const latest_last_message = useStore(store => store.messages?.[channel.id]?.[Object.keys(store.messages[channel.id])[0]!]);

  const activeChannel = useStore(store => store.activeChannel)
  const draft = serializeToString(useChatStore(state => state.getInputContent(channel.id)));
  const last_message = latest_last_message || channel.last_message;
  const last_message_author = useStore(store => store.users.get(last_message?.author_id))

  return <ContextMenu modal={false}>
    <ContextMenuTrigger asChild>
      <SidebarMenuButton
        size="default"
        asChild
        className='p-1 box-content h-8'
      >
        <SidebarLink href={`/app/chats/${channel.id}`} className='data-[state="open"]:bg-sidebar-accent'>
          <Avatar className="h-8 w-8 rounded-sm relative overflow-visible">
            {/* <AvatarImage src={user.avatar} alt={user.name} /> */}
            <AvatarFallback className="rounded-sm text-sm font-semibold text-muted-foreground">{createFallbackAvatar(channel.name)}</AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left leading-tight">
            <div className={cn('truncate text-[0.8rem] font-semibold', !channel.unread_message_count && 'text-muted-foreground')}>{channel.name}
              {channel.unread_message_count > 0 ?
                <div className='size-5 float-right text-[.55rem] truncate font-medium rounded-full flex items-center justify-center bg-primary'>
                  <span className='pt-[1px]'>{channel.unread_message_count > 99 ? '99+' : channel.unread_message_count}</span>
                </div>
                : null}
            </div>

            <span className={cn('truncate text-[.65rem]', !channel.unread_message_count && 'text-muted-foreground')}>
              {
                draft && activeChannel !== channel.id ?
                  <span><strong>DRAFT:</strong> {draft}</span>
                  :
                  <span>
                    {last_message && last_message_author && <strong>{last_message.author_id === my_user_id ? "You" : last_message_author.display_name}: </strong>}

                    {
                      last_message?.content ||
                      ((last_message && !last_message?.content) ? <i>Sent an Attachment</i> : '')
                    }
                  </span>

              }
            </span>
          </div>
        </SidebarLink>
      </SidebarMenuButton>
    </ContextMenuTrigger>
    <ContextMenuContent className="w-44">
      <ContextMenuItem>Details</ContextMenuItem>
      <ContextMenuSeparator />
      <ContextMenuItem>Copy Channel ID</ContextMenuItem>
    </ContextMenuContent>
  </ContextMenu>
})

export default NavChats
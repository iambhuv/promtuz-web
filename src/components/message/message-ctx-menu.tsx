import React, { memo } from 'react'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger
} from '@/components/ui/context-menu';
import { Copy, Edit3, LucideIcon, Reply, Trash } from 'lucide-react';
import type { Message } from '@/store/store';
import { useStore } from '@/store';
import { useToast } from '@/hooks/useToast';
import { motion } from "framer-motion"
import { useChatStore } from '@/store/chat';

const MessageContextMenuItem = motion.create(ContextMenuItem);

type MenuList = ({ label: string, icon?: LucideIcon, seperator?: false, onClick?: () => any } | { label: string, seperator: true } | boolean)[]

const MessageContextMenu = ({ children, message, ...props }: React.PropsWithChildren<React.ComponentProps<typeof ContextMenuTrigger> & { message: Message }>) => {
  const deleteMessage = useStore(store => store.deleteMessage);
  const me = useStore(store => store.me);
  const setInputState = useChatStore(state => state.setInputState);
  const { toast } = useToast();


  const isMessageSent = message.author_id == me.id;

  const MESSAGE_BUBBLE_CONTEXT: MenuList = [
    { label: "Copy", icon: Copy },
    {
      label: "Reply", icon: Reply, onClick() {
        setInputState(message.channel_id, {
          type: "REPLYING", refMessageID: message.id
        })
      },
    },
    isMessageSent && {
      label: "Edit", icon: Edit3, onClick() {
        setInputState(message.channel_id, {
          type: "EDITING", refMessageID: message.id
        })
      },
    },
    {
      label: "Copy ID", async onClick() {
        await navigator.clipboard.writeText(message.id);
        // TODO: Use sonner
        toast({ title: "Copied to Clipboard", className: 'p-3' })
      },
    },
    isMessageSent && { label: "SEP1", seperator: true },
    isMessageSent && {
      label: "Delete", icon: Trash, onClick() {
        deleteMessage(message.channel_id, message.id)
      },
    },
  ]

  return (
    <ContextMenu modal={false}>
      <ContextMenuTrigger className='flex flex-col data-[state=open]:bg-border/50 focus-visible:bg-border/50 focus-visible:ring-2 transition-colors rounded-lg active:bg-border/35' tabIndex={0} {...props}>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className='w-24 border-none bg-sidebar-accent/60 backdrop-blur-xl'>
        {MESSAGE_BUBBLE_CONTEXT.filter(m => typeof m !== 'boolean').map(MENU_ITEM => (
          MENU_ITEM.seperator ?
            <ContextMenuSeparator key={MENU_ITEM.label} /> :
            <MessageContextMenuItem
              whileTap={{ scale: .5 }}
              key={MENU_ITEM.label}
              className='focus:bg-popover/40 text-xs'
              onClick={MENU_ITEM.onClick}>
              {MENU_ITEM.label}
              {MENU_ITEM.icon && <ContextMenuShortcut>
                <MENU_ITEM.icon size={16}></MENU_ITEM.icon>
              </ContextMenuShortcut>}
            </MessageContextMenuItem>
        ))}
      </ContextMenuContent>
    </ContextMenu>
  )
}

export default memo(MessageContextMenu)
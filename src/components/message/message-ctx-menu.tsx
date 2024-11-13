import React from 'react'

import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuShortcut,
  ContextMenuTrigger
} from '@/components/ui/context-menu';
import { Copy, Edit3, Flag, Forward, LucideIcon, MessageSquareDot, Reply, SmilePlus, Trash, UserRound } from 'lucide-react';
import type { Message } from '@/store/store';
import { useStore } from '@/store';
import { useToast } from '@/hooks/use-toast';
import { motion } from "framer-motion"

const MessageContextMenuItem = motion.create(ContextMenuItem);

type MenuList = ({ label: string, icon?: LucideIcon, seperator?: false, onClick?: () => any } | { label: string, seperator: true })[]

const MessageContextMenu = ({ children, message }: React.PropsWithChildren<{ message: Message }>) => {
  const deleteMessage = useStore(({ deleteMessage }) => deleteMessage);
  const { toast } = useToast()

  const MESSAGE_BUBBLE_CONTEXT: MenuList = [
    { label: "Copy", icon: Copy },
    { label: "Reply", icon: Reply },
    { label: "Edit", icon: Edit3 },
    {
      label: "Delete", icon: Trash, onClick() {
        deleteMessage(message.channel_id, message.id)
      },
    },
    {
      label: "Copy ID", async onClick() {
        console.log('ayoo?');

        await navigator.clipboard.writeText(message.id);
        // TODO: Use sonner
        toast({ title: "Copied to Clipboard", className: 'p-3' })
      },
    },
  ]

  return (
    <ContextMenu modal={false}>
      <ContextMenuTrigger className='flex flex-col data-[state=open]:bg-border/50 focus-visible:bg-border/50 focus-visible:ring-2' tabIndex={0}>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className='w-24 border-none bg-sidebar-accent/60 backdrop-blur-xl'>
        {MESSAGE_BUBBLE_CONTEXT.map(MENU_ITEM => (
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

export default MessageContextMenu
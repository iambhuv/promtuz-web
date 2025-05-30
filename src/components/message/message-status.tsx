import { cn } from '@/lib/utils'
import { ChatStatus } from '@/types/store'
import React from 'react'
import { Skeleton } from '../ui/skeleton'

export const MessageStatus = ({ status }: { status: ChatStatus['status'] }) => {
  return status && status === 'TYPING' ?
    <div className={cn(
      "self-start message received bg-sidebar-accent text-sidebar-accent-foreground",
      "p-3 rounded-2xl max-w-prose w-fit h-fit flex gap-1")}
    >
      <Skeleton className='size-1.5 rounded-full bg-white' />
      <Skeleton className='size-1.5 rounded-full bg-white' />
      <Skeleton className='size-1.5 rounded-full bg-white' />
    </div> : ''
}

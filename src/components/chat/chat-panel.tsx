import { cn } from '@/lib/utils'
import React from 'react'
import { useSidebar } from '../ui/sidebar';

export const ChatPanel = ({ children }: React.PropsWithChildren<{}>) => {
  const { isMobile } = useSidebar();

  return (
    <div
      style={{ '--custom-scrollbar-bg': 'hsl(var(--card))' } as React.CSSProperties}
      className={cn("flex flex-col pb-4 overflow-y-auto bg-card", isMobile ? 'h-[calc(100dvh-(4rem))]' : 'h-[calc(100dvh-(5rem))] rounded-b-xl')}>
      {children}
    </div>
  )
}

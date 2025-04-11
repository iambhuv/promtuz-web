import { cn, parseMessageDate } from '@/lib/utils'
import { Message } from '@/types/store'
import React, { useEffect, useRef } from 'react'
import { useInView } from 'react-intersection-observer'

const MessageTime = ({ displayTime }: { displayTime: string }) => {
  // const ref = useRef(null)
  // const [inViewRef, isInView] = useInView({ initialInView: false })


  return (
    <div className={cn("text-center text-xs text-muted-foreground select-none w-fit mx-auto shadow-xl rounded-full bg-primary/15 backdrop-blur-md mb-3 mt-1.5 text-white", 'sticky top-[.2rem]')}>
      <div className="time-bubble py-1 px-2">
        {displayTime}
      </div>
    </div>
  )
}

export default MessageTime
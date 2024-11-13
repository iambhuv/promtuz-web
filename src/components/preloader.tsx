import React from 'react'
import { PromtuzLogo } from './logo'
import { useStore } from '@/store'
import { ConnectionStatus } from '@/store/store'

const Preloader = () => {
  const status = useStore(({ connectionStatus }) => connectionStatus)

  const statusMap: Record<ConnectionStatus, string> = {
    ACTIVE: 'Connected',
    CLIENT_OFFLINE: 'No Internet',
    SERVER_OFFLINE: 'Server Unavailable',
    CONNECTING: "Connecting...",
    RETRYING: "Retrying...",
    FAILED: "Connection Failed :("
  }

  return (
    <div className="flex w-screen h-screen items-center justify-center flex-col gap-8">
      <div className="size-20">
        <PromtuzLogo />
      </div>
      <div className="status relative lg:absolute lg:bottom-28 lg:left-1/2 lg:-translate-x-1/2 max-lg:top-10 text-center">
        <span className='font-medium text-slate-200/85'>{statusMap[status]}</span>

        <noscript>
          <p className='font-medium text-slate-200/85 mt-2'>JavaScript has to be enabled to use this app.</p>
        </noscript>
      </div>
    </div>
  )
}

export default Preloader